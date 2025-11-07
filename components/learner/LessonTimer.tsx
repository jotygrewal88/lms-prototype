// Phase II 1H.1c: Lesson Timer Component
// Phase II 1H.5: Updated to use bumpLessonTelemetry
"use client";

import React, { useEffect, useRef, useState } from "react";
import { bumpLessonTelemetry } from "@/lib/store";
import { PLAYER_CONFIG } from "@/lib/playerConfig";

interface LessonTimerProps {
  courseId: string;
  lessonId: string;
  userId: string;
  minTimeSec?: number;
  initialTimeSpent?: number;
  onTimeUpdate: (seconds: number) => void;
}

export default function LessonTimer({
  courseId,
  lessonId,
  userId,
  minTimeSec,
  initialTimeSpent = 0,
  onTimeUpdate,
}: LessonTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialTimeSpent);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const lastElapsedRef = useRef<number>(initialTimeSpent);

  // Initialize timer when component mounts
  useEffect(() => {
    // Start timer immediately
    startTimeRef.current = Date.now() - (initialTimeSpent * 1000);
    pausedDurationRef.current = 0;
    pauseStartRef.current = null;
    setIsPaused(false);
    lastElapsedRef.current = initialTimeSpent;

    // Set up interval to update elapsed time every second
    intervalRef.current = setInterval(() => {
      if (!isPaused && startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedDurationRef.current) / 1000);
        setElapsedSeconds(elapsed);
        
        // Update store every 5 seconds using bumpLessonTelemetry
        if (now - lastSaveTimeRef.current >= PLAYER_CONFIG.TELEMETRY_SAVE_INTERVAL_MS) {
          const timeDelta = elapsed - lastElapsedRef.current;
          if (timeDelta > 0) {
            bumpLessonTelemetry({
              courseId,
              lessonId,
              userId,
              timeDeltaSec: timeDelta,
            });
            lastElapsedRef.current = elapsed;
          }
          onTimeUpdate(elapsed);
          lastSaveTimeRef.current = now;
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [courseId, lessonId, userId, onTimeUpdate, initialTimeSpent]);

  // Handle visibility change (tab blur/focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab blurred - pause timer
        if (!isPaused && startTimeRef.current) {
          pauseStartRef.current = Date.now();
          setIsPaused(true);
        }
      } else {
        // Tab focused - resume timer
        if (isPaused && pauseStartRef.current && startTimeRef.current) {
          const pauseDuration = Date.now() - pauseStartRef.current;
          pausedDurationRef.current += pauseDuration;
          pauseStartRef.current = null;
          setIsPaused(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused]);

  // Cleanup on unmount or lesson change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Save final time on unmount
      const finalElapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now()) - pausedDurationRef.current) / 1000);
      if (finalElapsed > lastElapsedRef.current) {
        const timeDelta = finalElapsed - lastElapsedRef.current;
        bumpLessonTelemetry({
          courseId,
          lessonId,
          userId,
          timeDeltaSec: timeDelta,
        });
      }
    };
  }, [courseId, lessonId, userId]);

  // This component doesn't render anything visible
  // It just tracks time in the background
  return null;
}

