// Phase II 1H.1b: Course Player Header Component (Updated for 1H.2d)
// Phase II 1H.5: Added Resume button and sticky progress strip
"use client";

import React, { useState, useEffect } from "react";
import { X, Award, Calendar, RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import { Course, ProgressCourse } from "@/types";
import { getCertificatesByUserId, getCurrentUser, getAssignmentForUserAndCourse, getTrainingById, getResumePointerForCourse, getLessonsByCourseId } from "@/lib/store";
import CertificateModal from "./certificates/CertificateModal";
import { formatDate } from "@/lib/utils";

interface CoursePlayerHeaderProps {
  course: Course;
  progress: ProgressCourse;
  currentLessonId?: string;
  onExit: () => void;
  onResume?: (lessonId: string) => void;
}

export default function CoursePlayerHeader({ course, progress, currentLessonId, onExit, onResume }: CoursePlayerHeaderProps) {
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  
  // Phase II 1H.2d: Check for certificate
  const currentUser = getCurrentUser();
  const certificates = getCertificatesByUserId(currentUser.id);
  const courseCertificate = certificates.find(c => c.courseId === course.id);
  const isCompleted = progress.completedAt !== undefined;
  
  // Phase II 1H.4: Get assignment and shadow training
  const assignment = getAssignmentForUserAndCourse(currentUser.id, course.id);
  const shadowTrainingId = `trn_${course.id}`;
  const shadowTraining = getTrainingById(shadowTrainingId);
  
  const percentComplete = progress.lessonTotal > 0
    ? Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100)
    : 0;

  const now = new Date();
  const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const isOverdue = dueDate && dueDate < now && percentComplete < 100;
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Phase II 1H.5: Check if resume is available
  const resumeLessonId = getResumePointerForCourse(currentUser.id, course.id);
  const lessons = getLessonsByCourseId(course.id);
  const currentLessonIndex = currentLessonId ? lessons.findIndex(l => l.id === currentLessonId) : -1;
  const showResumeButton = resumeLessonId && resumeLessonId !== currentLessonId && !isCompleted;

  // Phase II 1H.5: Show sticky progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyProgress(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResume = () => {
    if (resumeLessonId && onResume) {
      onResume(resumeLessonId);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{course.title}</h1>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                )}
                {courseCertificate && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Certificate
                  </Button>
                )}
              </div>
              
              {/* Phase II 1H.4: Due date and policy hint */}
              <div className="flex items-center gap-4 mb-2 text-sm">
                {dueDate && (
                  <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    <Calendar className="w-4 h-4" />
                    {isOverdue ? (
                      <span>Overdue</span>
                    ) : daysUntilDue !== null && daysUntilDue <= 14 ? (
                      <span>Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}</span>
                    ) : (
                      <span>Due: {formatDate(assignment!.dueAt!)}</span>
                    )}
                  </div>
                )}
                {shadowTraining && (
                  <div className="text-gray-600">
                    <span className="text-gray-500">Completion will satisfy training requirement: </span>
                    <span className="font-medium">{shadowTraining.title}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span className="font-semibold">{percentComplete}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                    role="progressbar"
                    aria-valuenow={percentComplete}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Phase II 1H.5: Resume button */}
              {showResumeButton && (
                <Button
                  variant="secondary"
                  onClick={handleResume}
                  className="flex items-center gap-2"
                  title="Resume from last position"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resume
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onExit}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Exit
              </Button>
            </div>
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
      </header>

      {/* Phase II 1H.5: Sticky mini progress strip */}
      {showStickyProgress && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-full mx-auto px-6 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate">{course.title}</span>
                <span className="text-sm text-gray-500">
                  {currentLessonIndex >= 0 && lessons.length > 0
                    ? `Lesson ${currentLessonIndex + 1} of ${lessons.length}`
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{percentComplete}%</span>
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

