"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Check, Lock } from "lucide-react";
import Button from "@/components/Button";
import { Course, Lesson, ProgressLesson } from "@/types";

interface CoursePlayerFooterProps {
  course: Course;
  currentLessonId: string;
  hasPrev: boolean;
  hasNext: boolean;
  isCompleted: boolean;
  requiresManualCompletion: boolean;
  progress?: ProgressLesson;
  canComplete: boolean;
  thresholdMessages?: string[];
  completedCount: number;
  totalCount: number;
  nextLessonTitle?: string;
  onPrev: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  onDemoComplete?: () => void;
}

export default function CoursePlayerFooter({
  hasPrev,
  hasNext,
  isCompleted,
  requiresManualCompletion,
  canComplete,
  thresholdMessages = [],
  completedCount,
  totalCount,
  nextLessonTitle,
  onPrev,
  onNext,
  onMarkComplete,
  onDemoComplete,
}: CoursePlayerFooterProps) {
  const getTooltipText = (): string => {
    if (thresholdMessages.length === 0) return "";
    return thresholdMessages.join(" and ");
  };

  const getNextTooltip = (): string => {
    if (hasNext) return "";
    if (isCompleted) return "All lessons complete";
    if (!isCompleted && requiresManualCompletion) return "Mark this lesson complete to unlock the next lesson";
    return "Complete this lesson to unlock the next lesson";
  };

  return (
    <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {/* Center: completion count */}
            <span className="text-sm text-gray-500">
              {completedCount} of {totalCount} complete
            </span>

            {requiresManualCompletion && !isCompleted && (
              <div className="relative group">
                <Button
                  variant="secondary"
                  onClick={onMarkComplete}
                  disabled={!canComplete}
                  className="flex items-center gap-2"
                  title={!canComplete ? getTooltipText() : ""}
                >
                  <Check className="w-4 h-4" />
                  Mark Complete
                </Button>
                {!canComplete && thresholdMessages.length > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {getTooltipText()}
                  </div>
                )}
              </div>
            )}

            {onDemoComplete && !isCompleted && (
              <button
                onClick={onDemoComplete}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                title="Skip to next lesson (demo only)"
              >
                Skip (demo)
              </button>
            )}
          </div>

          <div className="relative group">
            <Button
              variant={isCompleted && hasNext ? "primary" : "primary"}
              onClick={onNext}
              disabled={!hasNext}
              className={`flex items-center gap-2 ${isCompleted && hasNext ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              title={getNextTooltip()}
            >
              {hasNext ? (
                <>
                  {nextLessonTitle ? `Next: ${nextLessonTitle.length > 25 ? nextLessonTitle.substring(0, 25) + "..." : nextLessonTitle}` : "Next"}
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  {!isCompleted && <Lock className="w-4 h-4" />}
                </>
              )}
            </Button>
            {!hasNext && getNextTooltip() && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {getNextTooltip()}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
