"use client";

import React, { useState } from "react";
import { RotateCcw, Clock, Calendar, Play, CheckCircle2, AlertTriangle, BookOpen, Trophy } from "lucide-react";
import { Course, ProgressCourse, CourseAssignment } from "@/types";
import { getCertificatesByUserId, getCurrentUser, getResumePointerForCourse, getSkillsByCourseId } from "@/lib/store";
import CertificateModal from "./certificates/CertificateModal";

interface CourseCardProps {
  course: Course;
  progress: ProgressCourse | undefined;
  assignment: CourseAssignment | undefined;
  onOpen: () => void;
  onResume?: (lessonId: string) => void;
}

/** Circular progress ring SVG */
function ProgressRing({ percent, size = 44, stroke = 4, color }: { percent: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function CourseCard({ course, progress, assignment, onOpen, onResume }: CourseCardProps) {
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  
  // Check for certificate
  const currentUser = getCurrentUser();
  const certificates = getCertificatesByUserId(currentUser.id);
  const courseCertificate = certificates.find(c => c.courseId === course.id);
  
  // Check if resume is available
  const resumeLessonId = getResumePointerForCourse(currentUser.id, course.id);
  const showResumeButton = resumeLessonId && !progress?.completedAt;
  
  // Get skills for course
  const courseSkills = getSkillsByCourseId(course.id);
  const visibleSkills = courseSkills.slice(0, 2);
  const overflowCount = courseSkills.length - 2;
  
  // Calculate progress percent
  const percentComplete = progress && progress.lessonTotal > 0
    ? Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100)
    : 0;

  // Determine status
  const now = new Date();
  const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
  const isOverdue = dueDate && dueDate < now && percentComplete < 100;
  const isCompleted = progress?.completedAt !== undefined || percentComplete === 100;
  const isInProgress = percentComplete > 0 && percentComplete < 100;

  // Estimated time remaining
  const estimatedTimeRemaining = () => {
    if (!course.estimatedMinutes || isCompleted) return null;
    const remaining = Math.round(course.estimatedMinutes * (1 - percentComplete / 100));
    if (remaining <= 0) return null;
    return `~${remaining} min remaining`;
  };
  const timeRemaining = estimatedTimeRemaining();

  // Status styling
  const getStatusConfig = () => {
    if (isCompleted) {
      return { 
        label: "Completed", 
        bg: "bg-emerald-100", 
        text: "text-emerald-700",
        icon: CheckCircle2,
        border: "border-emerald-200"
      };
    }
    if (isOverdue) {
      return { 
        label: "Overdue", 
        bg: "bg-red-100", 
        text: "text-red-700",
        icon: AlertTriangle,
        border: "border-red-200"
      };
    }
    if (isInProgress) {
      return { 
        label: "In Progress", 
        bg: "bg-blue-100", 
        text: "text-blue-700",
        icon: Play,
        border: "border-blue-200"
      };
    }
    return { 
      label: "Not Started", 
      bg: "bg-gray-100", 
      text: "text-gray-600",
      icon: BookOpen,
      border: "border-gray-200"
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  // Progress ring color
  const ringColor = isCompleted ? "#10b981" : isOverdue ? "#ef4444" : "#3b82f6";

  // Days until due or days overdue
  const getDueText = () => {
    if (!dueDate) return null;
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    }
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  };

  const dueText = getDueText();

  return (
    <>
      <div className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden group ${isOverdue ? "border-l-4 border-l-red-500 border-red-200" : "border-gray-200"}`}>
        {/* Card Header with status */}
        <div className={`px-4 py-3 border-b ${isOverdue ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
              {/* Quiz score for completed courses */}
              {isCompleted && progress?.scorePct !== undefined && progress.scorePct > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                  <Trophy className="w-3 h-3" />
                  Score: {progress.scorePct}%
                </span>
              )}
            </div>
            {dueText && (
              <span className={`text-xs font-medium ${dueText.isOverdue ? "text-red-600" : "text-gray-500"}`}>
                <Calendar className="w-3 h-3 inline mr-1" />
                {dueText.text}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Title + Progress Ring */}
          <div className="flex items-start gap-3">
            {/* Circular progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing percent={percentComplete} color={ringColor} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                {percentComplete}%
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {course.title}
              </h3>
              {course.category && (
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {course.category}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {course.metadata?.tags && course.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.metadata.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Skills */}
          {courseSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {skill.name}
                </span>
              ))}
              {overflowCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 cursor-help"
                  title={courseSkills.slice(2).map(s => s.name).join(", ")}
                >
                  +{overflowCount}
                </span>
              )}
            </div>
          )}

          {/* Duration & time remaining */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {course.estimatedMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{course.estimatedMinutes} min</span>
              </div>
            )}
            {timeRemaining && (
              <span className="text-gray-400">•</span>
            )}
            {timeRemaining && (
              <span className="text-gray-500 font-medium">{timeRemaining}</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-emerald-500" :
                  isOverdue ? "bg-red-500" :
                  "bg-blue-500"
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Footer with Actions */}
        <div className="px-4 pb-4 pt-2 space-y-2">
          {isCompleted && courseCertificate && (
            <button 
              onClick={() => setIsCertificateModalOpen(true)} 
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              View Certificate
            </button>
          )}
          
          {showResumeButton && onResume && resumeLessonId ? (
            <>
              <button 
                onClick={() => onResume(resumeLessonId)} 
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Resume
              </button>
              <button 
                onClick={onOpen} 
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Start Over
              </button>
            </>
          ) : (
            <button 
              onClick={onOpen} 
              className={`w-full py-2.5 px-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${
                isCompleted 
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isCompleted ? "Review Course" : "Start Course"}
            </button>
          )}
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
    </>
  );
}
