"use client";

import React from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getCourseById, getLessonById } from "@/lib/store";

interface ResumeCardProps {
  courseId: string;
  lessonId: string;
  onResume: () => void;
}

export default function ResumeCard({ courseId, lessonId, onResume }: ResumeCardProps) {
  const course = getCourseById(courseId);
  const lesson = getLessonById(lessonId);

  if (!course || !lesson) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600">
            Next: <span className="font-medium">{lesson.title}</span>
          </p>
        </div>
        <Button onClick={onResume} variant="primary">
          Resume
        </Button>
      </div>
    </Card>
  );
}

