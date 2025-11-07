"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { Course, ProgressCourse, CourseAssignment, Certificate } from "@/types";
import { formatDate } from "@/lib/utils";
import { getCertificatesByUserId, getCurrentUser, getResumePointerForCourse, getLessonsByCourseId, getSkillsByCourseId } from "@/lib/store";
import CertificateModal from "./certificates/CertificateModal";

interface CourseCardProps {
  course: Course;
  progress: ProgressCourse | undefined;
  assignment: CourseAssignment | undefined;
  onOpen: () => void;
  onResume?: (lessonId: string) => void;
}

export default function CourseCard({ course, progress, assignment, onOpen, onResume }: CourseCardProps) {
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  
  // Phase II 1H.2d: Check for certificate
  const currentUser = getCurrentUser();
  const certificates = getCertificatesByUserId(currentUser.id);
  const courseCertificate = certificates.find(c => c.courseId === course.id);
  
  // Phase II 1H.5: Check if resume is available
  const resumeLessonId = getResumePointerForCourse(currentUser.id, course.id);
  const showResumeButton = resumeLessonId && !progress?.completedAt;
  
  // Phase II — 1M.1: Get skills for course
  const courseSkills = getSkillsByCourseId(course.id);
  const visibleSkills = courseSkills.slice(0, 3);
  const overflowCount = courseSkills.length - 3;
  
  // Calculate progress percent
  const percentComplete = progress && progress.lessonTotal > 0
    ? Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100)
    : 0;

  // Determine status
  const now = new Date();
  const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const isOverdue = dueDate && dueDate < now && percentComplete < 100;
  const isCompleted = progress?.completedAt !== undefined || percentComplete === 100;
  const isNotStarted = percentComplete === 0 && dueDate && dueDate > now;
  const isInProgress = percentComplete > 0 && percentComplete < 100;

  let statusLabel: string;
  let statusVariant: "success" | "warning" | "error" | "info" | "default";
  
  if (isCompleted) {
    statusLabel = "Completed";
    statusVariant = "success";
  } else if (isOverdue) {
    statusLabel = "Overdue";
    statusVariant = "error";
  } else if (isInProgress) {
    statusLabel = "In Progress";
    statusVariant = "info";
  } else {
    statusLabel = "Not Started";
    statusVariant = "default";
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {course.title}
            </h3>
            {course.metadata?.tags && course.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {course.metadata.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Phase II — 1M.1: Skills */}
            {courseSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 relative">
                {visibleSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill.name}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-help"
                    title={courseSkills.slice(3).map(s => s.name).join(", ")}
                  >
                    +{overflowCount}
                  </span>
                )}
              </div>
            )}
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        {/* Category */}
        {course.category && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {course.category}
            </span>
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div className="text-sm text-gray-600">
            {isOverdue ? (
              <span className="font-medium text-red-600">Overdue</span>
            ) : (
              <>
                Due in{" "}
                <span className="font-medium">
                  {Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span className="font-medium">{percentComplete}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${percentComplete}%`,
                backgroundColor: "#2563EB",
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          {isCompleted && courseCertificate && (
            <Button 
              variant="secondary" 
              onClick={() => setIsCertificateModalOpen(true)} 
              className="w-full"
            >
              View Certificate
            </Button>
          )}
          {/* Phase II 1H.5: Resume button */}
          {showResumeButton && onResume && resumeLessonId && (
            <Button 
              variant="primary" 
              onClick={() => onResume(resumeLessonId)} 
              className="w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resume
            </Button>
          )}
          <Button variant="secondary" onClick={onOpen} className="w-full">
            {showResumeButton ? "Start Over" : "Open"}
          </Button>
        </div>
      </div>
      
      {/* Certificate Modal */}
      {courseCertificate && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificates={[courseCertificate]}
        />
      )}
    </Card>
  );
}

