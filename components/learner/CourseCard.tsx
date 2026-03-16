"use client";

import React, { useState } from "react";
import { Calendar, Play, CheckCircle2, AlertTriangle, BookOpen, ArrowRight, Clock } from "lucide-react";
import { Course, ProgressCourse, CourseAssignment } from "@/types";
import { getCertificatesByUserId, getCurrentUser, getResumePointerForCourse } from "@/lib/store";
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

  const currentUser = getCurrentUser();
  const certificates = getCertificatesByUserId(currentUser.id);
  const courseCertificate = certificates.find(c => c.courseId === course.id);
  const resumeLessonId = getResumePointerForCourse(currentUser.id, course.id);

  const percentComplete = progress && progress.lessonTotal > 0
    ? Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100)
    : 0;

  const now = new Date();
  const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const isOverdue = dueDate && dueDate < now && percentComplete < 100;
  const isCompleted = progress?.completedAt !== undefined || percentComplete === 100;
  const isInProgress = percentComplete > 0 && percentComplete < 100;

  const getStatusConfig = () => {
    if (isCompleted) return { label: "Completed", bg: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 };
    if (isOverdue) return { label: "Overdue", bg: "bg-red-50 text-red-700", icon: AlertTriangle };
    if (isInProgress) return { label: "In Progress", bg: "bg-blue-50 text-blue-700", icon: Play };
    return { label: "Not Started", bg: "bg-gray-100 text-gray-600", icon: BookOpen };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const getDueText = () => {
    if (!dueDate) return null;
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, warn: true };
    return { text: `Due in ${diffDays}d`, warn: false };
  };
  const dueText = getDueText();

  const barColor = isCompleted ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-blue-500";

  const handleAction = () => {
    onOpen();
  };

  const actionLabel = isCompleted ? "Review" : (isInProgress ? "Continue" : "View Course");

  return (
    <>
      <div
        className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer ${
          isOverdue ? "border-l-4 border-l-red-500 border-red-200" : "border-gray-200"
        }`}
        onClick={handleAction}
      >
        <div className="p-5">
          {/* Status + Due */}
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {dueText && (
              <span className={`text-xs font-medium ${dueText.warn ? "text-red-600" : "text-gray-500"}`}>
                {dueText.text}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
            {course.title}
          </h3>

          {/* Category + Duration */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            {course.category && <span>{course.category}</span>}
            {course.category && course.estimatedMinutes && <span>&bull;</span>}
            {course.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.estimatedMinutes} min
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 w-8 text-right">{percentComplete}%</span>
          </div>
        </div>

        {/* Action */}
        <div className="px-5 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(); }}
            className={`w-full py-2 px-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isCompleted
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {isCompleted && courseCertificate && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsCertificateModalOpen(true); }}
              className="w-full mt-2 py-1.5 px-3 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              View Certificate
            </button>
          )}
        </div>
      </div>

      {courseCertificate && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificates={[courseCertificate]}
        />
      )}
    </>
  );
}
