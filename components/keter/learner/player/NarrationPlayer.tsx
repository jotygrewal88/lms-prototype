"use client";

// Keter — Anderson learner player primitive.
// Extracted from app/keter/learner/course/[id]/page.tsx so the same component
// can be reused by both the inline learner player and the admin "preview as
// learner" surface (components/keter/learner/player/ResourceRenderer.tsx).
// Behavior is byte-identical to the original inline implementation.

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  FileText,
} from "lucide-react";
import type { NarrationData } from "@/types";
import SlideFrame from "./SlideFrame";

const SPEED_OPTIONS = ["0.75x", "1x", "1.25x", "1.5x", "2x"];

export default function NarrationPlayer({
  narrationData,
}: {
  narrationData: NarrationData;
}) {
  const { slides, script, audioDurationSeconds } = narrationData;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showTranscript, setShowTranscript] = useState(false);
  const [ccEnabled, setCcEnabled] = useState(true);

  if (slides.length === 0) return null;

  const slide = slides[currentSlideIndex];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === slides.length - 1;

  const totalMin = Math.floor(audioDurationSeconds / 60);
  const totalSec = audioDurationSeconds % 60;
  const totalTime = `${totalMin}:${totalSec.toString().padStart(2, "0")}`;

  const captionText =
    script.split(".").slice(0, 2).join(".").trim() + ".";

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

      <div className="mt-4 bg-gray-900 rounded-lg p-3 flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-400 text-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-teal-400 rounded-full" />
          </div>
          <span className="text-xs text-gray-400">2:15 / {totalTime}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
            title="Skip back 10s"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
            title="Skip forward 10s"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(e.target.value)}
          className="text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 cursor-pointer"
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setCcEnabled(!ccEnabled)}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              ccEnabled ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
            title="Toggle captions"
          >
            CC
          </button>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-1.5 rounded transition-colors ${
              showTranscript
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            title="Toggle transcript"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {ccEnabled && (
        <div className="mt-2 bg-gray-900/80 text-white text-sm p-3 rounded-lg">
          {captionText}
        </div>
      )}

      {showTranscript && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">Transcript</p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {script}
          </p>
        </div>
      )}
    </div>
  );
}
