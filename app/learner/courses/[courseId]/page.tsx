// Phase II 1H.1c: Redirect page - migrates old route structure to new route structure
"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getCurrentUser, getCourseById, getLessonsByCourseId, getResumePointer } from "@/lib/store";

export default function CourseRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const lessonIdParam = searchParams.get("lessonId");

  useEffect(() => {
    const user = getCurrentUser();
    const course = getCourseById(courseId);
    
    if (!course) {
      router.push("/learner");
      return;
    }

    // If lessonId query param exists, redirect to new route structure
    if (lessonIdParam) {
      router.replace(`/learner/courses/${courseId}/lessons/${lessonIdParam}`);
      return;
    }

    // Otherwise, redirect to appropriate lesson based on resume pointer or first lesson
    const resumePointer = getResumePointer(user.id);
    if (resumePointer && resumePointer.courseId === courseId) {
      router.replace(`/learner/courses/${courseId}/lessons/${resumePointer.lessonId}`);
      return;
    }

    // Fallback to first lesson
    const lessons = getLessonsByCourseId(courseId);
    if (lessons.length > 0) {
      router.replace(`/learner/courses/${courseId}/lessons/${lessons[0].id}`);
    } else {
      router.push("/learner");
    }
  }, [courseId, lessonIdParam, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
