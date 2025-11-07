// Phase II 1H.5: Resource Text Component
// Renders TipTap content (read-only) and tracks scroll depth

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Resource } from "@/types";
import { bumpLessonTelemetry } from "@/lib/store";
import { PLAYER_CONFIG } from "@/lib/playerConfig";

interface ResourceTextProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourceText({ resource, courseId, lessonId, userId }: ResourceTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollDepthRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateScrollDepth = useCallback(() => {
    if (!containerRef.current) return 0;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight <= clientHeight) {
      // Content fits in viewport, consider it 100% viewed
      return 1.0;
    }

    const scrollableHeight = scrollHeight - clientHeight;
    const scrolled = scrollTop / scrollableHeight;
    return Math.min(1.0, Math.max(0, scrolled));
  }, []);

  const updateScrollDepth = useCallback(() => {
    const scrollDepth = calculateScrollDepth();
    
    // Only update if depth increased significantly (avoid spam)
    if (scrollDepth > lastScrollDepthRef.current + 0.05 || scrollDepth >= 0.9) {
      lastScrollDepthRef.current = scrollDepth;
      bumpLessonTelemetry({
        courseId,
        lessonId,
        userId,
        scrollDepth,
      });
    }
  }, [courseId, lessonId, userId, calculateScrollDepth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial scroll depth check
    updateScrollDepth();

    // Set up scroll listener
    container.addEventListener('scroll', updateScrollDepth, { passive: true });

    // Set up periodic check (fallback)
    checkIntervalRef.current = setInterval(updateScrollDepth, PLAYER_CONFIG.SCROLL_CHECK_INTERVAL_MS);

    return () => {
      container.removeEventListener('scroll', updateScrollDepth);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [updateScrollDepth]);

  if (!resource.content) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No content available for this resource.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="prose max-w-none overflow-y-auto max-h-[70vh]"
      style={{ scrollBehavior: 'smooth' }}
    >
      <RichTextEditor
        value={resource.content}
        onChange={() => {}}
        readOnly={true}
        ariaLabel={`Content: ${resource.title}`}
      />
    </div>
  );
}


