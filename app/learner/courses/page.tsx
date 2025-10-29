// Phase II Epic 1 Fix Pass: Learner Course Catalog
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Calendar, CheckCircle } from "lucide-react";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Progress from "@/components/Progress";
import { 
  getAssignedCoursesForUser,
  getOrCreateProgressCourse,
  subscribe,
  getCurrentUser
} from "@/lib/store";
import { Course, ProgressCourse } from "@/types";

type FilterStatus = "all" | "not_started" | "in_progress" | "completed";

export default function LearnerCoursesPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, ProgressCourse>>(new Map());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    const loadData = () => {
      // Get assigned courses (only published ones)
      const assigned = getAssignedCoursesForUser(currentUser.id).filter(c => c.status === "published");
      setCourses(assigned);

      // Get or create progress for each course
      const progMap = new Map<string, ProgressCourse>();
      assigned.forEach((course) => {
        const progress = getOrCreateProgressCourse(currentUser.id, course.id);
        progMap.set(course.id, progress);
      });
      setProgressMap(progMap);
    };

    loadData();
    const unsubscribe = subscribe(loadData);
    return unsubscribe;
  }, [currentUser.id]);

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case "completed":
        return { variant: "success" as const, label: "Completed", icon: CheckCircle };
      case "in_progress":
        return { variant: "warning" as const, label: "In Progress", icon: null };
      case "not_started":
        return { variant: "default" as const, label: "Not Started", icon: null };
      default:
        return { variant: "default" as const, label: status, icon: null };
    }
  };

  const getProgressPercent = (progress: ProgressCourse): number => {
    if (progress.lessonTotal === 0) return 0;
    return Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100);
  };

  const filteredCourses = courses.filter((course) => {
    if (filterStatus === "all") return true;
    const progress = progressMap.get(course.id);
    return progress?.status === filterStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <LearnerLayout>
        <div>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Continue your learning journey</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {(["all", "not_started", "in_progress", "completed"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-auto">
              {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
            </span>
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {courses.length === 0 ? "No courses assigned yet" : "No courses match this filter"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {courses.length === 0 
                    ? "Check back later for assigned training courses."
                    : "Try selecting a different status filter."
                  }
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const progress = progressMap.get(course.id);
                if (!progress) return null;

                const statusBadge = getStatusBadgeProps(progress.status);
                const progressPercent = getProgressPercent(progress);
                const StatusIcon = statusBadge.icon;

                return (
                  <Card 
                    key={course.id}
                    className="flex flex-col h-full hover:shadow-xl transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        {statusBadge.label}
                      </Badge>
                      {course.category && (
                        <Badge variant="default">{course.category}</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow-0">
                      {course.title}
                    </h3>

                    {/* Description */}
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                        {course.description}
                      </p>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {course.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 3 && (
                          <span className="text-xs text-gray-500 py-0.5">
                            +{course.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{progress.lessonDoneCount} of {progress.lessonTotal} lessons</span>
                        {progress.scorePct !== undefined && (
                          <span>Score: {progress.scorePct}%</span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-3 mt-auto space-y-2">
                      {/* Duration and Due Date */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {course.estimatedMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.estimatedMinutes} min
                          </div>
                        )}
                        {/* Due date would come from assignment - simplified for now */}
                      </div>

                      {/* Action Button */}
                      <Button
                        variant={progress.status === "completed" ? "secondary" : "primary"}
                        className="w-full"
                        disabled={true}
                        title="Course player coming in Epic 2"
                      >
                        {progress.status === "completed" ? "Review" : progress.status === "in_progress" ? "Continue" : "Start Course"}
                      </Button>
                      <p className="text-xs text-center text-gray-500 italic">
                        Course player coming in Epic 2
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}
