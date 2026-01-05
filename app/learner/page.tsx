"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import CourseCard from "@/components/learner/CourseCard";
import {
  getCurrentUser,
  getAssignedCoursesForUser,
  getProgressCourseByCourseAndUser,
  getAssignmentForUserAndCourse,
  getDueSoonForUser,
  getOverdueForUser,
  getResumePointer,
  getCourseById,
  getLessonById,
  subscribe,
} from "@/lib/store";
import { Course, ProgressCourse, CourseAssignment } from "@/types";
import { 
  Play, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  BookOpen,
  Sparkles
} from "lucide-react";

export default function LearnerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressCourse>>({});
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, CourseAssignment>>({});
  const [resumePointer, setResumePointer] = useState<{ courseId: string; lessonId: string } | null>(null);
  const [dueSoonCourses, setDueSoonCourses] = useState<Array<{ course: Course; assignment: CourseAssignment }>>([]);
  const [overdueCourses, setOverdueCourses] = useState<Array<{ course: Course; assignment: CourseAssignment; daysOverdue: number }>>([]);

  useEffect(() => {
    const loadData = () => {
      const user = getCurrentUser();
      setCurrentUser(user);

      // Load assigned courses (published only)
      const courses = getAssignedCoursesForUser(user.id);
      setAssignedCourses(courses);

      // Load progress and assignments
      const progress: Record<string, ProgressCourse> = {};
      const assignments: Record<string, CourseAssignment> = {};
      
      courses.forEach((course) => {
        const progressData = getProgressCourseByCourseAndUser(course.id, user.id);
        if (progressData) {
          progress[course.id] = progressData;
        }
        
        const assignment = getAssignmentForUserAndCourse(user.id, course.id);
        if (assignment) {
          assignments[course.id] = assignment;
        }
      });

      setProgressMap(progress);
      setAssignmentsMap(assignments);

      // Load resume pointer
      const resume = getResumePointer(user.id);
      setResumePointer(resume);

      // Load due soon and overdue
      const dueSoon = getDueSoonForUser(user.id, 14);
      setDueSoonCourses(dueSoon);

      const overdue = getOverdueForUser(user.id);
      setOverdueCourses(overdue);
    };

    loadData();

    const unsubscribe = subscribe(() => {
      loadData();
    });

    return unsubscribe;
  }, []);

  // Get active courses (not completed)
  const activeCourses = assignedCourses.filter((course) => {
    const progress = progressMap[course.id];
    return !progress || progress.status !== "completed";
  });

  // Sort courses: overdue first, then due soon, then by due date, then in-progress first
  const getSortedCourses = (courses: Course[]): Course[] => {
    return [...courses].sort((a, b) => {
      const assignmentA = assignmentsMap[a.id];
      const assignmentB = assignmentsMap[b.id];
      const progressA = progressMap[a.id];
      const progressB = progressMap[b.id];

      // Check if overdue
      const isOverdueA = overdueCourses.some(o => o.course.id === a.id);
      const isOverdueB = overdueCourses.some(o => o.course.id === b.id);
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // Check if due soon
      const isDueSoonA = dueSoonCourses.some(d => d.course.id === a.id);
      const isDueSoonB = dueSoonCourses.some(d => d.course.id === b.id);
      if (isDueSoonA && !isDueSoonB) return -1;
      if (!isDueSoonA && isDueSoonB) return 1;

      // Sort by due date asc (if exists)
      if (assignmentA?.dueAt && assignmentB?.dueAt) {
        const dateA = new Date(assignmentA.dueAt).getTime();
        const dateB = new Date(assignmentB.dueAt).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
      } else if (assignmentA?.dueAt && !assignmentB?.dueAt) {
        return -1;
      } else if (!assignmentA?.dueAt && assignmentB?.dueAt) {
        return 1;
      }

      // Then in-progress first
      const isInProgressA = progressA?.status === "in_progress";
      const isInProgressB = progressB?.status === "in_progress";
      if (isInProgressA && !isInProgressB) return -1;
      if (!isInProgressA && isInProgressB) return 1;

      // Finally by title asc
      return a.title.localeCompare(b.title);
    });
  };

  const sortedActiveCourses = getSortedCourses(activeCourses);

  const handleCourseClick = (courseId: string) => {
    router.push(`/learner/courses/${courseId}`);
  };

  const handleResume = (courseId: string, lessonId: string) => {
    router.push(`/learner/courses/${courseId}/lessons/${lessonId}`);
  };

  // Get resume course/lesson info
  const resumeCourse = resumePointer ? getCourseById(resumePointer.courseId) : null;
  const resumeLesson = resumePointer ? getLessonById(resumePointer.lessonId) : null;

  // Stats
  const inProgressCount = activeCourses.filter(c => progressMap[c.id]?.status === "in_progress").length;
  const notStartedCount = activeCourses.filter(c => !progressMap[c.id] || progressMap[c.id]?.status === "not_started").length;

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <LearnerLayout>
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                    <span className="text-emerald-100 text-sm font-medium">Welcome back</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Hi, {currentUser.firstName}!
                  </h1>
                  <p className="text-emerald-100 text-sm md:text-base max-w-md">
                    {activeCourses.length === 0 
                      ? "You're all caught up! Check back soon for new training assignments."
                      : `You have ${activeCourses.length} active course${activeCourses.length !== 1 ? 's' : ''} to complete.`}
                  </p>
                  
                  {/* Quick stats */}
                  <div className="flex gap-4 mt-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-2xl font-bold">{inProgressCount}</p>
                      <p className="text-xs text-emerald-100">In Progress</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-2xl font-bold">{notStartedCount}</p>
                      <p className="text-xs text-emerald-100">Not Started</p>
                    </div>
                  </div>
                </div>

                {/* Resume Card */}
                {resumeCourse && resumeLesson && (
                  <div className="bg-white rounded-xl p-4 shadow-lg min-w-[280px] max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Continue Learning</p>
                        <h3 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                          {resumeCourse.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {resumeLesson.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResume(resumePointer!.courseId, resumePointer!.lessonId)}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Resume
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert Banners */}
          {(overdueCourses.length > 0 || dueSoonCourses.length > 0) && (
            <div className="space-y-3">
              {/* Overdue Alert */}
              {overdueCourses.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-800">
                      {overdueCourses.length} Overdue Course{overdueCourses.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-600">
                      {overdueCourses.map(o => o.course.title).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCourseClick(overdueCourses[0].course.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    Start Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Due Soon Alert */}
              {dueSoonCourses.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-800">
                      {dueSoonCourses.length} Course{dueSoonCourses.length !== 1 ? 's' : ''} Due Soon
                    </p>
                    <p className="text-sm text-amber-600">
                      {dueSoonCourses.map(d => d.course.title).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCourseClick(dueSoonCourses[0].course.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    View
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeCourses.length}
                </span>
              </div>
              <Link 
                href="/learner/completed"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View Completed
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {sortedActiveCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You don't have any active courses right now. Check back soon for new assignments or view your completed courses.
                </p>
                <Link
                  href="/learner/completed"
                  className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View Completed Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedActiveCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progressMap[course.id]}
                    assignment={assignmentsMap[course.id]}
                    onOpen={() => handleCourseClick(course.id)}
                    onResume={(lessonId) => handleResume(course.id, lessonId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}
