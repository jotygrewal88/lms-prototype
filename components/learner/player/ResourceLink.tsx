// Phase II 1H.5: Resource Link Component
// Opens external link with warning message

"use client";

import React, { useEffect, useRef } from "react";
import { Link as LinkIcon, ExternalLink, AlertTriangle } from "lucide-react";
import { Resource } from "@/types";
import { bumpLessonTelemetry } from "@/lib/store";

interface ResourceLinkProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourceLink({ resource, courseId, lessonId, userId }: ResourceLinkProps) {
  const startTimeRef = useRef<number>(Date.now());

  // Track time spent on this page (for telemetry)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0 && timeSpent % 10 === 0) {
        // Update every 10 seconds
        bumpLessonTelemetry({
          courseId,
          lessonId,
          userId,
          timeDeltaSec: 10,
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [courseId, lessonId, userId]);

  if (!resource.url) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No link URL available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <LinkIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
          <p className="text-sm text-gray-600 break-all mt-1">{resource.url}</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          <strong>External content</strong> — Please mark this lesson complete when finished reviewing the link.
        </p>
      </div>

      {/* Open Link Button */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open Link
      </a>
    </div>
  );
}


