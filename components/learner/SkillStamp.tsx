"use client";

import React, { useState } from "react";
import { BookOpen, Calendar, CheckCircle2, Award } from "lucide-react";
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

// Category color mapping - refined palette with all categories
const categoryStyles: Record<string, { 
  gradient: string; 
  border: string; 
  badge: string; 
  text: string;
  glow: string;
  icon: string;
}> = {
  Safety: {
    gradient: "from-rose-500 to-red-600",
    border: "border-rose-400/50",
    badge: "bg-rose-500",
    text: "text-rose-700",
    glow: "shadow-rose-500/20",
    icon: "text-rose-500",
  },
  Equipment: {
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-400/50",
    badge: "bg-blue-500",
    text: "text-blue-700",
    glow: "shadow-blue-500/20",
    icon: "text-blue-500",
  },
  Compliance: {
    gradient: "from-violet-500 to-purple-600",
    border: "border-violet-400/50",
    badge: "bg-violet-500",
    text: "text-violet-700",
    glow: "shadow-violet-500/20",
    icon: "text-violet-500",
  },
  Emergency: {
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-400/50",
    badge: "bg-amber-500",
    text: "text-amber-700",
    glow: "shadow-amber-500/20",
    icon: "text-amber-500",
  },
  Leadership: {
    gradient: "from-cyan-500 to-sky-600",
    border: "border-cyan-400/50",
    badge: "bg-cyan-500",
    text: "text-cyan-700",
    glow: "shadow-cyan-500/20",
    icon: "text-cyan-500",
  },
  Quality: {
    gradient: "from-teal-500 to-emerald-600",
    border: "border-teal-400/50",
    badge: "bg-teal-500",
    text: "text-teal-700",
    glow: "shadow-teal-500/20",
    icon: "text-teal-500",
  },
  Other: {
    gradient: "from-slate-500 to-gray-600",
    border: "border-slate-400/50",
    badge: "bg-slate-500",
    text: "text-slate-700",
    glow: "shadow-slate-500/20",
    icon: "text-slate-500",
  },
};

export default function SkillStamp({ skill, courses, earnedDate }: SkillStampProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const category = skill.category || "Other";
  const styles = categoryStyles[category] || categoryStyles.Other;

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Skill Badge Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`
          group relative cursor-pointer
          bg-white rounded-2xl
          border ${styles.border}
          shadow-lg ${styles.glow}
          hover:shadow-xl hover:scale-[1.02]
          transition-all duration-300 ease-out
          overflow-hidden
        `}
      >
        {/* Top gradient accent */}
        <div className={`h-1.5 bg-gradient-to-r ${styles.gradient}`} />
        
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            {/* Category badge */}
            <span className={`
              ${styles.badge} text-white
              text-[10px] font-bold uppercase tracking-wider
              px-2 py-0.5 rounded-full
            `}>
              {category}
            </span>
            
            {/* Verified check */}
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center shadow-sm`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Skill name */}
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {skill.name}
          </h3>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {earnedDate ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDateShort(earnedDate)}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <BookOpen className="w-3 h-3" />
              <span>{courses.length}</span>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title=""
        size="medium"
      >
        <div className="p-0">
          {/* Modal Header with gradient */}
          <div className={`bg-gradient-to-br ${styles.gradient} px-6 py-8 text-white relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  Verified Skill
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{skill.name}</h2>
              <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                {category}
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Earned Date */}
            {earnedDate && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Earned On</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDateFull(earnedDate)}</div>
                </div>
              </div>
            )}

            {/* Courses */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Completed Courses ({courses.length})
              </h3>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${styles.gradient} flex items-center justify-center flex-shrink-0`}>
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {course.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
