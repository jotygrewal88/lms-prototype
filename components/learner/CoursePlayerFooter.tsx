// Phase II 1H.1b: Course Player Footer Component (Enhanced for 1H.1c)
// Phase II 1H.5: Enhanced Next button logic with unlocking checks
"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Check, Zap, Lock } from "lucide-react";
import Button from "@/components/Button";
import { Course, ProgressLesson } from "@/types";

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
  onPrev: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  onDemoComplete?: () => void; // Demo bypass function
}

export default function CoursePlayerFooter({
  course,
  hasPrev,
  hasNext,
  isCompleted,
  requiresManualCompletion,
  progress,
  canComplete,
  thresholdMessages = [],
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
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous lesson
          </Button>

          <div className="flex items-center gap-3">
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
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}

            {/* Demo button - bypasses all thresholds */}
            {onDemoComplete && !isCompleted && (
              <Button
                variant="primary"
                onClick={onDemoComplete}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                title="Demo: Complete lesson and move to next (bypasses thresholds)"
              >
                <Zap className="w-4 h-4" />
                Demo: Complete & Next
              </Button>
            )}
          </div>

          {/* Phase II 1H.5: Enhanced Next button with tooltip */}
          <div className="relative group">
            <Button
              variant="primary"
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-2 ml-auto"
              title={getNextTooltip()}
            >
              Next lesson
              {!hasNext && !isCompleted && (
                <Lock className="w-4 h-4" />
              )}
              {hasNext && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            {!hasNext && getNextTooltip() && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {getNextTooltip()}
                <div className="absolute top-full right-4 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

