"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import {
  getCurrentUser,
  getAssignedCoursesForUser,
  getProgressCourseByCourseAndUser,
  getCertificatesByUserId,
  subscribe,
} from "@/lib/store";
import { Course, ProgressCourse, Certificate } from "@/types";
import { 
  CheckCircle2,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  ExternalLink
} from "lucide-react";

export default function CompletedCoursesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [completedCourses, setCompletedCourses] = useState<Array<{
    course: Course;
    progress: ProgressCourse;
    certificate?: Certificate;
  }>>([]);

  useEffect(() => {
    const loadData = () => {
      const user = getCurrentUser();
      setCurrentUser(user);

      // Load assigned courses
      const courses = getAssignedCoursesForUser(user.id);
      const certificates = getCertificatesByUserId(user.id);
      
      // Filter to completed courses
      const completed: Array<{
        course: Course;
        progress: ProgressCourse;
        certificate?: Certificate;
      }> = [];

      courses.forEach((course) => {
        const progress = getProgressCourseByCourseAndUser(course.id, user.id);
        if (progress?.status === "completed") {
          const cert = certificates.find(c => c.courseId === course.id);
          completed.push({ course, progress, certificate: cert });
        }
      });

      // Sort by completion date (most recent first)
      completed.sort((a, b) => {
        const dateA = a.progress.completedAt ? new Date(a.progress.completedAt).getTime() : 0;
        const dateB = b.progress.completedAt ? new Date(b.progress.completedAt).getTime() : 0;
        return dateB - dateA;
      });

      setCompletedCourses(completed);
    };

    loadData();
    const unsubscribe = subscribe(loadData);
    return unsubscribe;
  }, []);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/learner/courses/${courseId}`);
  };

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <LearnerLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Completed Courses</h1>
            </div>
            <p className="text-gray-600">
              Courses you've successfully completed. View certificates and revisit course materials.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedCourses.filter(c => c.certificate).length}
                  </p>
                  <p className="text-xs text-gray-500">Certificates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Courses Grid */}
          {completedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No completed courses yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Complete your assigned courses to see them here and earn certificates.
              </p>
              <Link
                href="/learner"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Active Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completedCourses.map(({ course, progress, certificate }) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  {/* Card Header with completion badge */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-emerald-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {course.title}
                        </h3>
                      </div>
                      {certificate && (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 ml-2">
                          <Award className="w-4 h-4 text-amber-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Course category */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {course.category || "Training"}
                      </span>
                    </div>

                    {/* Completion info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Completed: {formatDate(progress.completedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{course.duration || 30} min</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {certificate && (
                        <Link
                          href="/learner/certificates"
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-4 h-4" />
                          Certificate
                        </Link>
                      )}
                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}

