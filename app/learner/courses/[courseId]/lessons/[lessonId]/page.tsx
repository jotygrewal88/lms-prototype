// Phase II 1H.1c: Course Player Page (New Route Structure)
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import CoursePlayerHeader from "@/components/learner/CoursePlayerHeader";
import CoursePlayerSidebar from "@/components/learner/CoursePlayerSidebar";
import LessonContentRenderer from "@/components/learner/LessonContentRenderer";
import CoursePlayerFooter from "@/components/learner/CoursePlayerFooter";
import LessonTimer from "@/components/learner/LessonTimer";
import VideoProgressTracker from "@/components/learner/VideoProgressTracker";
import Toast from "@/components/Toast";
import {
  getCurrentUser,
  getCourseById,
  getLessonsByCourseId,
  getProgressCourseByCourseAndUser,
  getProgressLesson,
  getNextLessonId,
  getNextUnlockedLesson,
  getPrevLessonId,
  startLesson,
  completeLesson,
  checkLessonCompletionThresholds,
  updateResumePointer,
  getResourcesByLessonId,
  isLessonUnlocked,
  subscribe,
  getOrCreateProgressLesson,
  updateLessonProgress,
} from "@/lib/store";
import { FEATURES } from "@/lib/features";
import { Course, Lesson, ProgressLesson } from "@/types";

export default function CoursePlayerLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressLesson>>({});
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [watchPct, setWatchPct] = useState(0);

  // Load course and lessons
  useEffect(() => {
    const courseData = getCourseById(courseId);
    if (!courseData) {
      router.push("/learner");
      return;
    }
    setCourse(courseData);
    const lessonsData = getLessonsByCourseId(courseId);
    setLessons(lessonsData);

    // Find current lesson
    const lesson = lessonsData.find((l) => l.id === lessonId);
    if (!lesson) {
      // Invalid lesson ID, redirect to first lesson or resume
      const user = getCurrentUser();
      const progressCourse = getProgressCourseByCourseAndUser(courseId, user.id);
      if (progressCourse?.lastLessonId) {
        router.replace(`/learner/courses/${courseId}/lessons/${progressCourse.lastLessonId}`);
      } else if (lessonsData.length > 0) {
        router.replace(`/learner/courses/${courseId}/lessons/${lessonsData[0].id}`);
      } else {
        router.push("/learner");
      }
      return;
    }
    setCurrentLesson(lesson);

    // Check if lesson is unlocked
    if (!isLessonUnlocked(courseData, lessonId, getCurrentUser().id)) {
      // Find first unlocked lesson
      const user = getCurrentUser();
      const unlockedLesson = lessonsData.find((l) => isLessonUnlocked(courseData, l.id, user.id));
      if (unlockedLesson) {
        router.replace(`/learner/courses/${courseId}/lessons/${unlockedLesson.id}`);
        return;
      }
    }
  }, [courseId, lessonId, router]);

  // Load progress data
  useEffect(() => {
    if (!course || lessons.length === 0) return;

    const user = getCurrentUser();
    const progressCourse = getProgressCourseByCourseAndUser(course.id, user.id);
    setCourseProgress(progressCourse);

    // Build progress map
    const map: Record<string, ProgressLesson> = {};
    lessons.forEach((lesson) => {
      const progress = getProgressLesson(user.id, lesson.id);
      if (progress) {
        map[lesson.id] = progress;
      }
    });
    setProgressMap(map);

    // Start lesson tracking
    if (lessonId) {
      const progress = startLesson(course.id, lessonId, user.id);
      setTimeSpent(progress.timeSpentSec || 0);
      setWatchPct(progress.watchPct || 0);
    }
  }, [course, lessons, lessonId]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const user = getCurrentUser();
      if (course) {
        const progressCourse = getProgressCourseByCourseAndUser(course.id, user.id);
        setCourseProgress(progressCourse);

        const map: Record<string, ProgressLesson> = {};
        lessons.forEach((lesson) => {
          const progress = getProgressLesson(user.id, lesson.id);
          if (progress) {
            map[lesson.id] = progress;
          }
        });
        setProgressMap(map);
      }
    });

    return unsubscribe;
  }, [course, lessons]);

  // Check thresholds and completion status
  const currentProgress = progressMap[lessonId];
  const canComplete = currentProgress && course
    ? checkLessonCompletionThresholds(course, currentProgress)
    : false;

  const isCompleted = currentProgress?.status === "completed";
  const requiresManualCompletion = course?.policy?.requiresManualCompletion ?? false;

  // Generate threshold messages
  const getThresholdMessages = (): string[] => {
    const messages: string[] = [];
    if (!course || !currentProgress) return messages;

    if (course.policy?.minTimeOnLessonSec) {
      const timeSpent = currentProgress.timeSpentSec || 0;
      const remaining = course.policy.minTimeOnLessonSec - timeSpent;
      if (remaining > 0) {
        messages.push(`Complete ${Math.ceil(remaining)} more seconds`);
      }
    }

    if (course.policy?.minVideoWatchPct) {
      const watchPct = currentProgress.watchPct || 0;
      const remaining = course.policy.minVideoWatchPct - watchPct;
      if (remaining > 0) {
        messages.push(`Watch ${Math.ceil(remaining)}% more video`);
      }
    }

    return messages;
  };

  // Handle navigation
  const handleLessonClick = useCallback(
    (newLessonId: string) => {
      if (!course) return;

      const user = getCurrentUser();
      if (!isLessonUnlocked(course, newLessonId, user.id)) {
        setToastMessage("Complete previous lessons to unlock this lesson");
        setShowToast(true);
        return;
      }

      updateResumePointer(user.id, course.id, newLessonId);
      router.push(`/learner/courses/${courseId}/lessons/${newLessonId}`);
    },
    [course, courseId, router]
  );

  const handlePrev = useCallback(() => {
    if (!lessonId) return;
    const prevId = getPrevLessonId(courseId, lessonId);
    if (prevId) {
      handleLessonClick(prevId);
    }
  }, [courseId, lessonId, handleLessonClick]);

  const handleNext = useCallback(() => {
    if (!lessonId || !course) return;

    const user = getCurrentUser();
    // Phase II 1H.5: Use getNextUnlockedLesson to respect policy
    const nextId = getNextUnlockedLesson(courseId, user.id, lessonId);

    if (nextId) {
      handleLessonClick(nextId);
    } else {
      // No unlocked next lesson
      if (isCompleted) {
        setToastMessage("All lessons complete");
      } else {
        setToastMessage("Complete this lesson to unlock the next lesson");
      }
      setShowToast(true);
    }
  }, [course, courseId, lessonId, handleLessonClick, isCompleted]);

  const handleMarkComplete = useCallback(() => {
    if (!course || !lessonId) return;

    const user = getCurrentUser();
    completeLesson(course.id, lessonId, user.id);

    // Phase II 1H.5: Show toast with next unlock message
    const nextUnlockedLessonId = getNextUnlockedLesson(courseId, user.id, lessonId);
    if (nextUnlockedLessonId) {
      const nextLesson = lessons.find(l => l.id === nextUnlockedLessonId);
      setToastMessage(`Lesson complete — ${nextLesson ? nextLesson.title : 'Next lesson'} unlocked`);
    } else {
      setToastMessage("Lesson complete — All lessons complete!");
    }
    setShowToast(true);

    // Auto-navigate to next lesson if available
    setTimeout(() => {
      const nextId = getNextUnlockedLesson(courseId, user.id, lessonId);
      if (nextId) {
        handleLessonClick(nextId);
      }
    }, 1000);
  }, [course, courseId, lessonId, handleLessonClick, lessons]);

  // Demo function: bypass thresholds and complete lesson
  const handleDemoComplete = useCallback(() => {
    if (!course || !lessonId) return;

    const user = getCurrentUser();
    const progress = getOrCreateProgressLesson(user.id, lessonId);
    
    // Set thresholds to met values for demo
    updateLessonProgress(lessonId, user.id, {
      timeSpentSec: course.policy?.minTimeOnLessonSec || 60,
      watchPct: course.policy?.minVideoWatchPct || 80,
    });

    // Complete the lesson
    completeLesson(course.id, lessonId, user.id);

    setToastMessage("Lesson completed (demo mode)");
    setShowToast(true);

    // Auto-navigate to next lesson if available
    setTimeout(() => {
      const nextId = getNextLessonId(courseId, lessonId);
      if (nextId) {
        handleLessonClick(nextId);
      } else {
        // Course complete!
        setToastMessage("Course complete! 🎉");
        setShowToast(true);
      }
    }, 500);
  }, [course, courseId, lessonId, handleLessonClick]);

  // Auto-completion logic
  useEffect(() => {
    if (!course || !lessonId || !currentProgress) return;
    if (requiresManualCompletion) return; // Manual completion required
    if (!FEATURES || !FEATURES.autoCompleteOnScroll) return; // Feature disabled
    if (isCompleted) return; // Already completed
    if (hasAutoCompleted) return; // Already auto-completed

    if (canComplete) {
      const user = getCurrentUser();
      completeLesson(course.id, lessonId, user.id);
      setHasAutoCompleted(true);
      
      // Phase II 1H.5: Show toast with next unlock message
      const nextUnlockedLessonId = getNextUnlockedLesson(courseId, user.id, lessonId);
      if (nextUnlockedLessonId) {
        const nextLesson = lessons.find(l => l.id === nextUnlockedLessonId);
        setToastMessage(`Lesson complete — ${nextLesson ? nextLesson.title : 'Next lesson'} unlocked`);
      } else {
        setToastMessage("Lesson complete — All lessons complete!");
      }
      setShowToast(true);
    }
  }, [course, courseId, lessonId, currentProgress, canComplete, requiresManualCompletion, isCompleted, hasAutoCompleted, lessons]);

  // Reset auto-complete flag when lesson changes
  useEffect(() => {
    setHasAutoCompleted(false);
  }, [lessonId]);

  // Keyboard navigation
  useEffect(() => {
    if (!course || !currentUser) return; // Guard clause
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      // Phase II 1H.5: j/k for resource navigation (if resources exist)
      const resources = getResourcesByLessonId(lessonId);
      if (resources.length > 0) {
        if (e.key === "j" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          // Navigate to next resource (scroll to next resource element)
          e.preventDefault();
          const resourceElements = document.querySelectorAll('.resource-wrapper, .resource-card');
          let currentIndex = -1;
          resourceElements.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
              currentIndex = idx;
            }
          });
          if (currentIndex >= 0 && currentIndex < resourceElements.length - 1) {
            resourceElements[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
        if (e.key === "k" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          // Navigate to previous resource
          e.preventDefault();
          const resourceElements = document.querySelectorAll('.resource-wrapper, .resource-card');
          let currentIndex = -1;
          resourceElements.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
              currentIndex = idx;
            }
          });
          if (currentIndex > 0) {
            resourceElements[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
      }

      // Phase II 1H.5: n for next lesson (if unlocked)
      if (e.key === "n" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const nextUnlockedLessonId = getNextUnlockedLesson(courseId, currentUser.id, lessonId);
        if (nextUnlockedLessonId) {
          handleNext();
        }
        return;
      }

      // Existing j/k for prev/next lesson (keep both behaviors)
      if (e.key === "j" || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "k" || e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev, lessonId, course, courseId, currentUser]);

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const resources = getResourcesByLessonId(lessonId);
  const hasPrev = !!getPrevLessonId(courseId, lessonId);
  // Phase II 1H.5: Check if next unlocked lesson exists
  const nextUnlockedLessonId = course && currentUser ? getNextUnlockedLesson(courseId, currentUser.id, lessonId) : null;
  const hasNext = !!nextUnlockedLessonId;

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-6 py-2">
          <div className="max-w-full mx-auto flex items-center gap-2 text-sm text-gray-600">
            <Link href="/learner" className="hover:text-gray-900">
              Back to Courses
            </Link>
            <span>/</span>
            <Link href={`/learner/courses/${courseId}`} className="hover:text-gray-900">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{currentLesson.title}</span>
          </div>
        </div>

        {/* Header */}
        <CoursePlayerHeader 
          course={course} 
          progress={courseProgress || {
            id: `pc_temp_${course.id}_${currentUser.id}`,
            userId: currentUser.id,
            courseId: course.id,
            status: "not_started",
            lessonDoneCount: 0,
            lessonTotal: lessons.length,
            scorePct: 0,
            attempts: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          currentLessonId={lessonId}
          onExit={() => router.push("/learner")}
          onResume={(resumeLessonId) => {
            router.push(`/learner/courses/${courseId}/lessons/${resumeLessonId}`);
          }}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <CoursePlayerSidebar
            course={course}
            lessons={lessons}
            currentLessonId={lessonId}
            progressMap={progressMap}
            onLessonClick={handleLessonClick}
            onBlockedNavigation={(message) => {
              setToastMessage(message);
              setShowToast(true);
            }}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-white">
            <LessonContentRenderer
              lesson={currentLesson}
              resources={resources}
              progress={currentProgress}
              courseId={courseId}
              userId={currentUser.id}
            />
          </main>
        </div>

        {/* Footer */}
        <CoursePlayerFooter
          course={course}
          currentLessonId={lessonId}
          hasPrev={hasPrev}
          hasNext={hasNext}
          isCompleted={isCompleted}
          requiresManualCompletion={requiresManualCompletion}
          progress={currentProgress}
          canComplete={canComplete}
          thresholdMessages={getThresholdMessages()}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkComplete={handleMarkComplete}
          onDemoComplete={handleDemoComplete}
        />

        {/* Timer and Video Tracking */}
        {currentProgress && (
          <>
            <LessonTimer
              courseId={course.id}
              lessonId={lessonId}
              userId={currentUser.id}
              minTimeSec={course.policy?.minTimeOnLessonSec}
              initialTimeSpent={currentProgress.timeSpentSec || 0}
              onTimeUpdate={(seconds) => {
                setTimeSpent(seconds);
              }}
            />
            <VideoProgressTracker
              courseId={course.id}
              lessonId={lessonId}
              userId={currentUser.id}
              minWatchPct={course.policy?.minVideoWatchPct}
              initialWatchPct={currentProgress.watchPct || 0}
              onProgressUpdate={(pct) => {
                setWatchPct(pct);
              }}
            />
          </>
        )}

        {/* Toast */}
        {showToast && (
          <Toast
            message={toastMessage}
            onClose={() => setShowToast(false)}
            duration={3000}
          />
        )}
      </div>
    </RouteGuard>
  );
}

