"use client";

import React, { useState } from "react";
import { BookOpen, Calendar } from "lucide-react";
import Modal from "@/components/Modal";

interface SkillStampProps {
  skill: {
    id: string;
    name: string;
    category?: string;
  };
  courses: Array<{
    id: string;
    title: string;
  }>;
  earnedDate?: string | null;
  primaryColor?: string;
}

// Category color mapping for stamps
const categoryColors: Record<string, { bg: string; border: string; text: string; icon: string; borderColor: string; bgColor: string; textColor: string }> = {
  Safety: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    icon: "text-red-600",
    borderColor: "#f87171",
    bgColor: "#fef2f2",
    textColor: "#b91c1c",
  },
  Equipment: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    icon: "text-blue-600",
    borderColor: "#60a5fa",
    bgColor: "#eff6ff",
    textColor: "#1e40af",
  },
  Compliance: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    icon: "text-purple-600",
    borderColor: "#a78bfa",
    bgColor: "#faf5ff",
    textColor: "#6b21a8",
  },
  Emergency: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    text: "text-orange-700",
    icon: "text-orange-600",
    borderColor: "#fb923c",
    bgColor: "#fff7ed",
    textColor: "#c2410c",
  },
  Other: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    icon: "text-green-600",
    borderColor: "#4ade80",
    bgColor: "#f0fdf4",
    textColor: "#166534",
  },
};

export default function SkillStamp({ skill, courses, earnedDate, primaryColor = "#2563EB" }: SkillStampProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const category = skill.category || "Other";
  const colors = categoryColors[category] || categoryColors.Other;

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Compact Clickable Stamp */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`
          relative p-3
          ${colors.bg}
          transform transition-all duration-200
          hover:scale-105 hover:shadow-md
          cursor-pointer
          border-2 ${colors.border}
          rounded-lg
          group
        `}
        style={{
          background: `linear-gradient(to bottom right, ${colors.bgColor}, white)`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* Category badge - compact */}
        <div className="mb-2">
          <span 
            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: colors.borderColor,
              color: 'white',
            }}
          >
            {category}
          </span>
        </div>

        {/* Skill name - compact */}
        <h3 
          className="text-sm font-bold line-clamp-2"
          style={{ 
            color: colors.textColor,
            fontFamily: 'serif',
            lineHeight: '1.3',
          }}
        >
          {skill.name}
        </h3>

        {/* Course count indicator */}
        {courses.length > 0 && (
          <div className="mt-2 text-xs opacity-60" style={{ color: colors.textColor }}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-[10px] font-medium" style={{ color: colors.borderColor }}>
            Click for details
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={skill.name}
        size="medium"
      >
        <div className="p-6">
          {/* Category */}
          <div className="mb-4">
            <span 
              className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: colors.borderColor,
                color: 'white',
              }}
            >
              {category}
            </span>
          </div>

          {/* Date */}
          {earnedDate && (
            <div className="mb-4 flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${colors.icon}`} />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Earned On</div>
                <div className="text-sm font-medium" style={{ color: colors.textColor }}>
                  {formatDateFull(earnedDate)}
                </div>
              </div>
            </div>
          )}

          {/* Courses */}
          <div className="mt-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Earned Via ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
            </div>
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{
                    borderColor: colors.borderColor,
                    backgroundColor: colors.bgColor,
                    opacity: 0.8,
                  }}
                >
                  <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.icon}`} />
                  <span className="text-sm font-medium" style={{ color: colors.textColor }}>
                    {course.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

