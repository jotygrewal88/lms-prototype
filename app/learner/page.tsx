"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import CourseCard from "@/components/learner/CourseCard";
import ResumeCard from "@/components/learner/ResumeCard";
import DueSoonPanel from "@/components/learner/DueSoonPanel";
import OverduePanel from "@/components/learner/OverduePanel";
import CertificatesMiniCard from "@/components/learner/CertificatesMiniCard";
import SkillPassportPlaceholder from "@/components/learner/SkillPassportPlaceholder";
import {
  getCurrentUser,
  getAssignedCoursesForUser,
  getProgressCourseByCourseAndUser,
  getAssignmentForUserAndCourse,
  getDueSoonForUser,
  getOverdueForUser,
  getCertificatesByUserId,
  getResumePointer,
  getEarnedSkillsByUser,
  subscribe,
} from "@/lib/store";
import { Course, ProgressCourse, CourseAssignment } from "@/types";

type TabType = "all" | "in_progress" | "completed";

export default function LearnerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressCourse>>({});
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, CourseAssignment>>({});
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [resumePointer, setResumePointer] = useState<{ courseId: string; lessonId: string } | null>(null);
  const [dueSoonCourses, setDueSoonCourses] = useState<Array<{ course: Course; assignment: CourseAssignment }>>([]);
  const [overdueCourses, setOverdueCourses] = useState<Array<{ course: Course; assignment: CourseAssignment; daysOverdue: number }>>([]);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);

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

      // Load certificates count
      const certificates = getCertificatesByUserId(user.id);
      setCertificatesCount(certificates.length);

      // Load earned skills count
      const earnedSkills = getEarnedSkillsByUser(user.id);
      setSkillCount(earnedSkills.length);
    };

    loadData();

    const unsubscribe = subscribe(() => {
      loadData();
    });

    return unsubscribe;
  }, []);

  // Filter courses by tab
  const getFilteredCourses = (): Course[] => {
    if (activeTab === "all") {
      return assignedCourses;
    }

    return assignedCourses.filter((course) => {
      const progress = progressMap[course.id];
      if (!progress) return false;

      if (activeTab === "in_progress") {
        return progress.status === "in_progress";
      }

      if (activeTab === "completed") {
        return progress.status === "completed";
      }

      return false;
    });
  };

  // Sort courses: due date asc, then in-progress first, then title asc
  const getSortedCourses = (courses: Course[]): Course[] => {
    return [...courses].sort((a, b) => {
      const assignmentA = assignmentsMap[a.id];
      const assignmentB = assignmentsMap[b.id];
      const progressA = progressMap[a.id];
      const progressB = progressMap[b.id];

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

  const filteredCourses = getFilteredCourses();
  const sortedCourses = getSortedCourses(filteredCourses);

  const handleCourseClick = (courseId: string) => {
    router.push(`/learner/courses/${courseId}`);
  };

  const handleResume = (courseId: string, lessonId: string) => {
    router.push(`/learner/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleViewAllCertificates = () => {
    // Placeholder - will be implemented in future epic
  };

  const getEmptyStateMessage = (tab: TabType): string => {
    switch (tab) {
      case "in_progress":
        return "No courses in progress. Start a course to begin learning!";
      case "completed":
        return "No completed courses yet. Keep learning to earn certificates!";
      default:
        return "No courses assigned yet. Contact your administrator for access.";
    }
  };

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <LearnerLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
            <p className="text-gray-600">
              Welcome back, {currentUser.firstName}. Resume where you left off.
            </p>
          </div>

          {/* Resume Card */}
          {resumePointer && (
            <ResumeCard
              courseId={resumePointer.courseId}
              lessonId={resumePointer.lessonId}
              onResume={() => handleCourseClick(resumePointer.courseId)}
            />
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Courses Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-[#2563EB] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  All ({assignedCourses.length})
                </button>
                <button
                  onClick={() => setActiveTab("in_progress")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "in_progress"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  In Progress ({sortedCourses.filter(c => progressMap[c.id]?.status === "in_progress").length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Completed ({sortedCourses.filter(c => progressMap[c.id]?.status === "completed").length})
                </button>
              </div>

              {/* Courses Grid */}
              {sortedCourses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getEmptyStateMessage(activeTab)}
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedCourses.map((course) => (
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

            {/* Right Column: Panels */}
            <div className="space-y-4">
              <DueSoonPanel
                courses={dueSoonCourses}
                onCourseClick={handleCourseClick}
              />
              <OverduePanel
                courses={overdueCourses}
                onCourseClick={handleCourseClick}
              />
              <CertificatesMiniCard
                count={certificatesCount}
                onViewAll={handleViewAllCertificates}
              />
              <SkillPassportPlaceholder skillCount={skillCount} />
            </div>
          </div>
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}
