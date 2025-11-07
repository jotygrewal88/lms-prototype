"use client";

import React from "react";
import Card from "@/components/Card";
import { Course, CourseAssignment } from "@/types";
import { formatDate } from "@/lib/utils";

interface DueSoonPanelProps {
  courses: Array<{ course: Course; assignment: CourseAssignment }>;
  onCourseClick: (courseId: string) => void;
}

export default function DueSoonPanel({ courses, onCourseClick }: DueSoonPanelProps) {
  const displayCourses = courses.slice(0, 5);

  return (
    <Card>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Due Soon
        </h3>
        <p className="text-xs text-gray-600">
          {courses.length} {courses.length === 1 ? "course" : "courses"} due in the next 14 days
        </p>
      </div>
      {displayCourses.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-2">
          No courses due soon. Great job staying ahead!
        </p>
      ) : (
        <ul className="space-y-2">
          {displayCourses.map(({ course, assignment }) => (
            <li key={course.id}>
              <button
                onClick={() => onCourseClick(course.id)}
                className="text-left w-full text-sm text-gray-700 hover:text-[#2563EB] transition-colors"
              >
                <div className="font-medium">{course.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Due: {formatDate(assignment.dueAt!)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

