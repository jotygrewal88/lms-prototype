// Phase II 1H.5: Resource Video Component
// HTML5 video with progress capture via timeupdate events

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Video } from "lucide-react";
import { Resource } from "@/types";
import { bumpLessonTelemetry } from "@/lib/store";

interface ResourceVideoProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourceVideo({ resource, courseId, lessonId, userId }: ResourceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoPctRef = useRef<number>(0);

  const updateVideoProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const watched = video.currentTime;
    const duration = video.duration;
    const videoPct = duration > 0 ? watched / duration : 0;

    // Only update if percentage increased significantly (avoid spam)
    if (videoPct > lastVideoPctRef.current + 0.05 || videoPct >= 0.9) {
      lastVideoPctRef.current = videoPct;
      bumpLessonTelemetry({
        courseId,
        lessonId,
        userId,
        videoPct,
      });
    }
  }, [courseId, lessonId, userId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Listen to timeupdate events (fires frequently during playback)
    video.addEventListener('timeupdate', updateVideoProgress);

    return () => {
      video.removeEventListener('timeupdate', updateVideoProgress);
    };
  }, [updateVideoProgress]);

  if (!resource.url) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No video URL available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={resource.url}
        controls
        className="w-full"
        style={{ maxHeight: "600px" }}
        data-video-id={resource.id}
        data-duration-sec={resource.durationSec}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}


