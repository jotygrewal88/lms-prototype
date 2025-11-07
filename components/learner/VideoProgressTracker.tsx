// Phase II 1H.1c: Video Progress Tracker Component
// Phase II 1H.5: Updated to use bumpLessonTelemetry
"use client";

import React, { useEffect, useRef, useState } from "react";
import { bumpLessonTelemetry } from "@/lib/store";
import { PLAYER_CONFIG } from "@/lib/playerConfig";

interface VideoProgress {
  id: string;
  element: HTMLVideoElement;
  duration: number;
  watchedTime: number;
}

interface VideoProgressTrackerProps {
  courseId: string;
  lessonId: string;
  userId: string;
  minWatchPct?: number;
  initialWatchPct?: number;
  onProgressUpdate: (watchPct: number) => void;
}

export default function VideoProgressTracker({
  courseId,
  lessonId,
  userId,
  minWatchPct,
  initialWatchPct = 0,
  onProgressUpdate,
}: VideoProgressTrackerProps) {
  const [watchPct, setWatchPct] = useState(initialWatchPct);
  const videosRef = useRef<Map<string, VideoProgress>>(new Map());
  const lastSaveTimeRef = useRef<number>(Date.now());

  // Find and track all video elements on the page
  useEffect(() => {
    const findVideos = () => {
      const videoElements = document.querySelectorAll<HTMLVideoElement>("video[data-video-id]");
      const videos = new Map<string, VideoProgress>();

      videoElements.forEach((video) => {
        const videoId = video.getAttribute("data-video-id");
        if (!videoId) return;

        // Get duration (use resource durationSec if available, or video element duration)
        const duration = video.duration || 0;
        
        videos.set(videoId, {
          id: videoId,
          element: video,
          duration,
          watchedTime: 0,
        });

        // Initialize watched time from currentTime if video was already played
        if (video.currentTime > 0) {
          videos.get(videoId)!.watchedTime = video.currentTime;
        }
      });

      videosRef.current = videos;
      calculateWeightedPercentage();
    };

    // Initial find
    findVideos();

    // Re-find videos periodically (in case videos are loaded dynamically)
    const findInterval = setInterval(findVideos, 2000);

    return () => {
      clearInterval(findInterval);
    };
  }, []);

  // Attach timeupdate listeners to all videos
  useEffect(() => {
    const handleTimeUpdate = (videoId: string) => {
      return () => {
        const videoData = videosRef.current.get(videoId);
        if (videoData) {
          videoData.watchedTime = videoData.element.currentTime;
          videoData.duration = videoData.element.duration || videoData.duration;
          calculateWeightedPercentage();
        }
      };
    };

    const cleanupFunctions: Array<() => void> = [];

    videosRef.current.forEach((videoData) => {
      const handler = handleTimeUpdate(videoData.id);
      videoData.element.addEventListener("timeupdate", handler);
      cleanupFunctions.push(() => {
        videoData.element.removeEventListener("timeupdate", handler);
      });
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  // Calculate weighted watch percentage
  const calculateWeightedPercentage = () => {
    const videos = Array.from(videosRef.current.values());
    
    if (videos.length === 0) {
      setWatchPct(0);
      return;
    }

    // Calculate weighted average
    let totalWatched = 0;
    let totalDuration = 0;

    videos.forEach((video) => {
      const duration = video.duration || 0;
      if (duration > 0) {
        totalWatched += video.watchedTime * duration;
        totalDuration += duration;
      }
    });

    const percentage = totalDuration > 0 ? (totalWatched / totalDuration) * 100 : 0;
    const roundedPct = Math.round(percentage);
    const videoPct = roundedPct / 100; // Convert to 0-1 range

    setWatchPct(roundedPct);

    // Update store every 5 seconds using bumpLessonTelemetry
    const now = Date.now();
    if (now - lastSaveTimeRef.current >= PLAYER_CONFIG.TELEMETRY_SAVE_INTERVAL_MS) {
      bumpLessonTelemetry({
        courseId,
        lessonId,
        userId,
        videoPct,
      });
      onProgressUpdate(roundedPct);
      lastSaveTimeRef.current = now;
    }
  };

  // Periodic recalculation (fallback in case events miss)
  useEffect(() => {
    const interval = setInterval(() => {
      calculateWeightedPercentage();
    }, PLAYER_CONFIG.TELEMETRY_SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [courseId, lessonId, userId, onProgressUpdate]);

  // Save final progress on unmount
  useEffect(() => {
    return () => {
      if (watchPct > 0) {
        const videoPct = watchPct / 100; // Convert to 0-1 range
        bumpLessonTelemetry({
          courseId,
          lessonId,
          userId,
          videoPct,
        });
      }
    };
  }, [courseId, lessonId, userId, watchPct]);

  // This component doesn't render anything visible
  // It just tracks video progress in the background
  return null;
}



