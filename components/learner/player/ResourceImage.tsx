// Phase II 1H.5: Resource Image Component
// Click-to-zoom lightbox using yet-another-react-lightbox

"use client";

import React, { useState, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Resource } from "@/types";
import { bumpLessonTelemetry } from "@/lib/store";

interface ResourceImageProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourceImage({ resource, courseId, lessonId, userId }: ResourceImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = useCallback(() => {
    setIsLightboxOpen(true);
    // Mark scroll depth as 100% when image is clicked (viewed)
    bumpLessonTelemetry({
      courseId,
      lessonId,
      userId,
      scrollDepth: 1.0,
    });
  }, [courseId, lessonId, userId]);

  if (!resource.url) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No image URL available.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
        </div>

        {/* Image */}
        <div className="cursor-pointer" onClick={handleImageClick}>
          <img
            src={resource.url}
            alt={resource.title}
            className="w-full h-auto max-h-[600px] object-contain"
            style={{ display: 'block' }}
          />
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[{ src: resource.url! }]}
      />
    </>
  );
}


