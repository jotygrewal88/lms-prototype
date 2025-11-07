// Phase II 1H.5: Resource Renderer Component
// Main component that renders resources based on type with error handling and retry logic

"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Resource } from "@/types";
import ResourceText from "./ResourceText";
import ResourceVideo from "./ResourceVideo";
import ResourcePDF from "./ResourcePDF";
import ResourceImage from "./ResourceImage";
import ResourceLink from "./ResourceLink";

interface ResourceRendererProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourceRenderer({ resource, courseId, lessonId, userId }: ResourceRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    // Reset retry state after a short delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 500);
  };

  const renderResource = () => {
    try {
      switch (resource.type) {
        case "text":
          return (
            <ResourceText
              resource={resource}
              courseId={courseId}
              lessonId={lessonId}
              userId={userId}
            />
          );
        case "video":
          return (
            <ResourceVideo
              resource={resource}
              courseId={courseId}
              lessonId={lessonId}
              userId={userId}
            />
          );
        case "pdf":
          return (
            <ResourcePDF
              resource={resource}
              courseId={courseId}
              lessonId={lessonId}
              userId={userId}
            />
          );
        case "image":
          return (
            <ResourceImage
              resource={resource}
              courseId={courseId}
              lessonId={lessonId}
              userId={userId}
            />
          );
        case "link":
          return (
            <ResourceLink
              resource={resource}
              courseId={courseId}
              lessonId={lessonId}
              userId={userId}
            />
          );
        default:
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Unknown resource type: {resource.type}
              </p>
            </div>
          );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resource';
      setError(errorMessage);
      return null;
    }
  };

  return (
    <div className="resource-card">
      {/* Resource Header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Failed to load resource</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRetry}
                disabled={isRetrying || retryCount >= 3}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
              {retryCount >= 3 && (
                <p className="text-xs text-red-600 mt-2">
                  Maximum retry attempts reached. Please refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resource Content */}
      {!error && (
        <div key={retryCount}>
          {renderResource()}
        </div>
      )}
    </div>
  );
}


