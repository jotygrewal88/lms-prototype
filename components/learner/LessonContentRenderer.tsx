// Phase II 1H.1b: Lesson Content Renderer Component (Enhanced for 1H.1c)
// Phase II 1H.5: Updated to use ResourceRenderer components
"use client";

import React, { useEffect, useState, useCallback } from "react";
import ResourceRenderer from "./player/ResourceRenderer";
import KnowledgeCheckCard from "./KnowledgeCheckCard";
import QuizCard from "@/components/learner/quiz/QuizCard";
import { Lesson, Resource, ProgressLesson } from "@/types";
import { getQuizByLesson, getQuizzesByCourseId, getKnowledgeCheckAnswers } from "@/lib/store";

interface LessonContentRendererProps {
  lesson: Lesson;
  resources: Resource[];
  progress?: ProgressLesson;
  courseId: string;
  userId: string;
  onAllKnowledgeChecksAnswered?: (allAnswered: boolean) => void;
  onQuizComplete?: () => void;
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

export default function LessonContentRenderer({ lesson, resources, progress, courseId, userId, onAllKnowledgeChecksAnswered, onQuizComplete }: LessonContentRendererProps) {
  const [answeredChecks, setAnsweredChecks] = useState<Set<string>>(new Set());

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lesson.id]);

  // Load persisted knowledge check answers
  useEffect(() => {
    if (lesson.knowledgeChecks && lesson.knowledgeChecks.length > 0) {
      const answers = getKnowledgeCheckAnswers(lesson.id, userId);
      const answered = new Set(Object.keys(answers));
      setAnsweredChecks(answered);
      const allAnswered = lesson.knowledgeChecks.every(kc => answered.has(kc.id));
      onAllKnowledgeChecksAnswered?.(allAnswered);
    } else {
      // No knowledge checks = all "answered"
      onAllKnowledgeChecksAnswered?.(true);
    }
  }, [lesson.id, lesson.knowledgeChecks, userId, onAllKnowledgeChecksAnswered]);

  const handleKCAnswered = useCallback((checkId: string) => {
    setAnsweredChecks(prev => {
      const next = new Set(prev);
      next.add(checkId);
      if (lesson.knowledgeChecks) {
        const allAnswered = lesson.knowledgeChecks.every(kc => next.has(kc.id));
        onAllKnowledgeChecksAnswered?.(allAnswered);
      }
      return next;
    });
  }, [lesson.knowledgeChecks, onAllKnowledgeChecksAnswered]);

  const sortedResources = [...resources].sort((a, b) => a.order - b.order);
  const knowledgeChecks = lesson.knowledgeChecks || [];
  
  // Check if lesson has a quiz (lesson-level first, then course-level)
  const lessonQuiz = getQuizByLesson(courseId, lesson.id);
  const courseQuizzes = getQuizzesByCourseId(courseId);
  const courseLevelQuiz = courseQuizzes.find(q => !q.lessonId);
  
  // Show quiz only on assessment lessons
  const isAssessment = lesson.lessonType === "assessment";
  const quiz = isAssessment ? (lessonQuiz || courseLevelQuiz) : lessonQuiz;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.estimatedMinutes && (
            <p className="text-sm text-gray-500 mt-1">Estimated time: {lesson.estimatedMinutes} min</p>
          )}
        </div>
        {progress?.updatedAt && (
          <div className="text-sm text-gray-500">
            Saved • {formatRelativeTime(new Date(progress.updatedAt))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {sortedResources.length === 0 && knowledgeChecks.length === 0 && !quiz ? (
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

      {/* Knowledge Checks */}
      {knowledgeChecks.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
              <span className="text-purple-600 text-sm">✓</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Knowledge Check</h2>
              <p className="text-sm text-gray-500">
                Answer {knowledgeChecks.length === 1 ? "this question" : `all ${knowledgeChecks.length} questions`} to complete this lesson
                {answeredChecks.size > 0 && (
                  <span className="ml-2 text-purple-600 font-medium">
                    ({answeredChecks.size}/{knowledgeChecks.length} answered)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {knowledgeChecks.map((kc, idx) => (
              <KnowledgeCheckCard
                key={kc.id}
                check={kc}
                index={idx}
                lessonId={lesson.id}
                userId={userId}
                onAnswered={(checkId) => handleKCAnswered(checkId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quiz Panel */}
      {quiz && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <QuizCard
            quiz={quiz}
            courseId={courseId}
            lessonId={lesson.id}
            userId={userId}
            onComplete={() => {
              if (onQuizComplete) {
                onQuizComplete();
              } else {
                window.location.reload();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

