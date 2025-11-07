// Phase II 1H.1b: Course Player Sidebar Component (Enhanced for 1H.1c)
// Phase II 1H.5: Enhanced lock tooltips
"use client";

import React, { useState } from "react";
import { Circle, CircleDot, CheckCircle2, Lock } from "lucide-react";
import { Course, Lesson, ProgressLesson } from "@/types";
import { isLessonUnlocked } from "@/lib/store";
import { getCurrentUser } from "@/lib/store";

interface CoursePlayerSidebarProps {
  course: Course;
  lessons: Lesson[];
  currentLessonId: string;
  progressMap: Record<string, ProgressLesson>;
  onLessonClick: (lessonId: string) => void;
  onBlockedNavigation?: (message: string) => void;
}

export default function CoursePlayerSidebar({
  course,
  lessons,
  currentLessonId,
  progressMap,
  onLessonClick,
  onBlockedNavigation,
}: CoursePlayerSidebarProps) {
  const currentUser = getCurrentUser();
  const [hoveredLockedLesson, setHoveredLockedLesson] = useState<string | null>(null);

  const getStatusIcon = (lesson: Lesson) => {
    const progress = progressMap[lesson.id];
    const status = progress?.status || "not_started";

    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <CircleDot className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const isUnlocked = (lessonId: string) => {
    return isLessonUnlocked(course, lessonId, currentUser.id);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (isUnlocked(lesson.id)) {
      onLessonClick(lesson.id);
    } else {
      // Show toast/tooltip for blocked navigation
      if (onBlockedNavigation) {
        onBlockedNavigation("Complete previous lesson first");
      }
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Lessons</h2>
        <nav className="space-y-1">
          {lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;
            const unlocked = isUnlocked(lesson.id);
            const isLocked = !unlocked;
            const showTooltip = isLocked && hoveredLockedLesson === lesson.id;

            return (
              <div 
                key={lesson.id} 
                className="relative group"
                onMouseEnter={() => {
                  if (isLocked) {
                    setHoveredLockedLesson(lesson.id);
                  }
                }}
                onMouseLeave={() => {
                  if (isLocked) {
                    setHoveredLockedLesson(null);
                  }
                }}
              >
                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isCurrent
                      ? "bg-blue-50 text-blue-900 font-medium"
                      : isLocked
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title={isLocked ? "Complete previous lesson first" : lesson.title}
                >
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    getStatusIcon(lesson)
                  )}
                  <span className="flex-1 truncate">{lesson.title}</span>
                </button>
                {/* Phase II 1H.5: Enhanced lock tooltip */}
                {showTooltip && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Complete previous lesson first
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
