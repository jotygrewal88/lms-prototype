"use client";

// Keter — Anderson learner player primitive.
// Extracted from app/keter/learner/course/[id]/page.tsx so the same component
// can be reused by both the inline learner player and the admin "preview as
// learner" surface (components/keter/learner/player/ResourceRenderer.tsx).
// Behavior is byte-identical to the original inline implementation.

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Slide } from "@/types";
import SlideFrame from "./SlideFrame";

export default function SlidePlayer({ slides }: { slides: Slide[] }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (slides.length === 0) return null;

  const slide = slides[currentSlideIndex];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === slides.length - 1;

  return (
    <div>
      <SlideFrame
        slide={slide}
        index={currentSlideIndex}
        total={slides.length}
      />

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
          disabled={isFirst}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFirst
              ? "opacity-40 cursor-not-allowed text-gray-400"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === currentSlideIndex
                    ? "bg-purple-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>

        {isLast ? (
          <button
            onClick={() => setCurrentSlideIndex(0)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            Done
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
