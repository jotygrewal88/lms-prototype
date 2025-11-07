// Phase II 1H.1b: Lesson Content Renderer Component (Enhanced for 1H.1c)
// Phase II 1H.5: Updated to use ResourceRenderer components
"use client";

import React, { useEffect } from "react";
import ResourceRenderer from "./player/ResourceRenderer";
import QuizCard from "@/components/learner/quiz/QuizCard";
import { Lesson, Resource, ProgressLesson } from "@/types";
import { getQuizByLesson, getQuizzesByCourseId } from "@/lib/store";

interface LessonContentRendererProps {
  lesson: Lesson;
  resources: Resource[];
  progress?: ProgressLesson;
  courseId: string;
  userId: string;
}

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function LessonContentRenderer({ lesson, resources, progress, courseId, userId }: LessonContentRendererProps) {
  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lesson.id]);

  const sortedResources = [...resources].sort((a, b) => a.order - b.order);
  
  // Check if lesson has a quiz (lesson-level first, then course-level)
  const lessonQuiz = getQuizByLesson(courseId, lesson.id);
  const courseQuizzes = getQuizzesByCourseId(courseId);
  const courseLevelQuiz = courseQuizzes.find(q => !q.lessonId); // Course-level quiz has no lessonId
  
  // Use lesson-level quiz if available, otherwise use course-level quiz
  const quiz = lessonQuiz || courseLevelQuiz;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        {progress?.updatedAt && (
          <div className="text-sm text-gray-500">
            Saved • {formatRelativeTime(new Date(progress.updatedAt))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {sortedResources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No content available for this lesson.</p>
            <p className="text-sm text-gray-400 mt-2">This lesson will not auto-complete.</p>
          </div>
        ) : (
          sortedResources.map((resource, index) => (
            <div 
              key={resource.id} 
              className={`resource-wrapper ${index < sortedResources.length - 1 ? 'pb-8 border-b border-gray-200' : ''}`}
            >
              <ResourceRenderer
                resource={resource}
                courseId={courseId}
                lessonId={lesson.id}
                userId={userId}
              />
            </div>
          ))
        )}
      </div>

      {/* Quiz Panel */}
      {quiz && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <QuizCard
            quiz={quiz}
            courseId={courseId}
            lessonId={lesson.id}
            userId={userId}
            onComplete={() => {
              // Refresh page to update progress
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
}

