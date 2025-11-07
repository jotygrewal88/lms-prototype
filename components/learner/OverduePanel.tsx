"use client";

import React from "react";
import Card from "@/components/Card";
import { Course, CourseAssignment } from "@/types";

interface OverduePanelProps {
  courses: Array<{ course: Course; assignment: CourseAssignment; daysOverdue: number }>;
  onCourseClick: (courseId: string) => void;
}

export default function OverduePanel({ courses, onCourseClick }: OverduePanelProps) {
  const displayCourses = courses.slice(0, 5);

  return (
    <Card className="border-red-200 bg-red-50">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-red-900 mb-1">
          Overdue
        </h3>
        <p className="text-xs text-red-700">
          {courses.length} {courses.length === 1 ? "course" : "courses"} overdue
        </p>
      </div>
      {displayCourses.length === 0 ? (
        <p className="text-sm text-red-600 italic py-2">
          No overdue courses. You&apos;re all caught up!
        </p>
      ) : (
        <ul className="space-y-2">
          {displayCourses.map(({ course, daysOverdue }) => (
            <li key={course.id}>
              <button
                onClick={() => onCourseClick(course.id)}
                className="text-left w-full text-sm text-red-700 hover:text-red-900 transition-colors"
              >
                <div className="font-medium">{course.title}</div>
                <div className="text-xs text-red-600 mt-0.5">
                  {daysOverdue} {daysOverdue === 1 ? "day" : "days"} overdue
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

