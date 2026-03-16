"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import {
  getCurrentUser,
  getCourseById,
  getLessonsByCourseId,
  getProgressCourseByCourseAndUser,
  getProgressLesson,
  getResumePointerForCourse,
  isLessonUnlocked,
  getQuizByLesson,
  getAssignmentForUserAndCourse,
} from "@/lib/store";
import { ArrowLeft, Clock, BookOpen, Target, CheckCircle2, Circle, CircleDot, Lock, PlayCircle, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { Course, Lesson, ProgressLesson } from "@/types";

export default function CourseOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [descExpanded, setDescExpanded] = useState(false);

  const user = getCurrentUser();
  const course = getCourseById(courseId);
  const lessons = useMemo(() => (course ? getLessonsByCourseId(courseId) : []), [courseId, course]);
  const progress = course ? getProgressCourseByCourseAndUser(courseId, user.id) : undefined;
  const assignment = course ? getAssignmentForUserAndCourse(user.id, courseId) : undefined;

  const progressMap = useMemo(() => {
    const map: Record<string, ProgressLesson> = {};
    lessons.forEach((l) => {
      const p = getProgressLesson(user.id, l.id);
      if (p) map[l.id] = p;
    });
    return map;
  }, [lessons, user.id]);

  const completedCount = lessons.filter((l) => progressMap[l.id]?.status === "completed").length;
  const percentComplete = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isCompleted = progress?.status === "completed";

  const totalMinutes = lessons.reduce((sum, l) => sum + (l.estimatedMinutes || 5), 0);
  const remainingMinutes = lessons.reduce((sum, l) => {
    if (progressMap[l.id]?.status === "completed") return sum;
    return sum + (l.estimatedMinutes || 5);
  }, 0);

  const resumeLessonId = course ? getResumePointerForCourse(user.id, courseId) : null;
  const resumeLesson = resumeLessonId ? lessons.find((l) => l.id === resumeLessonId) : null;
  const resumeIndex = resumeLesson ? lessons.indexOf(resumeLesson) + 1 : 1;

  const objectives = course?.metadata?.objectives || [];

  const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const now = new Date();
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = dueDate && dueDate < now && !isCompleted;

  if (!course) {
    return (
      <RouteGuard allowedRoles={["LEARNER"]}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Course not found.</p>
        </div>
      </RouteGuard>
    );
  }

  const handleStart = () => {
    const targetLessonId = resumeLessonId || lessons[0]?.id;
    if (targetLessonId) {
      router.push(`/learner/courses/${courseId}/lessons/${targetLessonId}`);
    }
  };

  const getLessonStatus = (lesson: Lesson) => {
    const p = progressMap[lesson.id];
    if (p?.status === "completed") return "completed";
    if (p?.status === "in_progress") return "in_progress";
    return "not_started";
  };

  const hasQuiz = (lesson: Lesson) => {
    return !!(lesson.knowledgeChecks?.length || getQuizByLesson(courseId, lesson.id));
  };

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/learner"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Courses
            </Link>
          </div>
        </div>

        {/* Due date banner */}
        {dueDate && daysUntilDue !== null && (daysUntilDue <= 7 || isOverdue) && (
          <div className={`px-6 py-2.5 text-sm font-medium text-center ${isOverdue ? "bg-red-50 text-red-700 border-b border-red-100" : "bg-amber-50 text-amber-700 border-b border-amber-100"}`}>
            <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {isOverdue
              ? `This course is overdue. It was due ${dueDate.toLocaleDateString()}.`
              : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} (${dueDate.toLocaleDateString()})`}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-2">
              {course.category && (
                <Badge variant="info" className="text-xs mt-1">{course.category}</Badge>
              )}
              {isCompleted && (
                <Badge variant="success" className="text-xs mt-1">Completed</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {totalMinutes} min total
                {!isCompleted && completedCount > 0 && (
                  <span className="text-gray-400 ml-1">(~{remainingMinutes} min remaining)</span>
                )}
              </span>
              {course.tags && course.tags.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-gray-400" />
                  {course.tags.slice(0, 3).join(", ")}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {completedCount > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{completedCount} of {lessons.length} lessons complete</span>
                  <span className="font-semibold text-gray-900">{percentComplete}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-blue-600"}`}
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleStart} className="flex items-center gap-2 px-6 py-2.5">
                <PlayCircle className="w-5 h-5" />
                {isCompleted
                  ? "Review Course"
                  : completedCount > 0
                  ? `Resume — Lesson ${resumeIndex}: ${resumeLesson?.title || "..."}`
                  : "Start Course"}
              </Button>
            </div>
          </div>

          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
              <h2 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                By the end of this course, you will...
              </h2>
              <ul className="space-y-2">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {course.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Course</h2>
              <div className={`text-sm text-gray-600 leading-relaxed ${!descExpanded ? "line-clamp-3" : ""}`}>
                {course.description}
              </div>
              {course.description.length > 200 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {descExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
                </button>
              )}
            </div>
          )}

          {/* Lesson list */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-1">
              {lessons.map((lesson, index) => {
                const status = getLessonStatus(lesson);
                const unlocked = isLessonUnlocked(course, lesson.id, user.id);
                const isLocked = !unlocked;
                const quiz = hasQuiz(lesson);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (!isLocked) {
                        router.push(`/learner/courses/${courseId}/lessons/${lesson.id}`);
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${
                      isLocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white hover:shadow-sm cursor-pointer"
                    } ${status === "in_progress" ? "bg-blue-50 border border-blue-100" : "bg-white border border-gray-100"}`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : status === "in_progress" ? (
                        <CircleDot className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={`text-sm font-medium truncate ${status === "completed" ? "text-gray-500" : "text-gray-900"}`}>
                          {lesson.title}
                        </span>
                        {lesson.lessonType === "assessment" && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">Assessment</Badge>
                        )}
                        {quiz && lesson.lessonType !== "assessment" && (
                          <span title="Has quiz"><ClipboardList className="w-3.5 h-3.5 text-purple-400" /></span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 shrink-0">
                      {lesson.estimatedMinutes || 5} min
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
