// Epic 1E: Lesson summary panel for stepper layout
"use client";

import React, { useState, useEffect } from "react";
import { FileText, Link as LinkIcon, FileImage, Video, File } from "lucide-react";
import { getLessonResourceCounts, estimateLessonDuration, getLessonStatus, subscribe } from "@/lib/store";

interface LessonSummaryPanelStepperProps {
  lessonId: string;
  isReadOnly: boolean;
}

export default function LessonSummaryPanelStepper({ lessonId, isReadOnly }: LessonSummaryPanelStepperProps) {
  const [counts, setCounts] = useState(getLessonResourceCounts(lessonId));
  const [duration, setDuration] = useState(estimateLessonDuration(lessonId));
  const [status, setStatus] = useState(getLessonStatus(lessonId));

  useEffect(() => {
    const updateData = () => {
      setCounts(getLessonResourceCounts(lessonId));
      setDuration(estimateLessonDuration(lessonId));
      setStatus(getLessonStatus(lessonId));
    };

    updateData();
    const unsubscribe = subscribe(updateData);
    return unsubscribe;
  }, [lessonId]);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusConfig = {
    empty: { label: 'Empty', color: 'text-gray-500', bg: 'bg-gray-100' },
    in_progress: { label: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ready: { label: 'Ready', color: 'text-green-600', bg: 'bg-green-100' },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-900">Lesson Summary</h3>

      {/* Section Breakdown */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Section Breakdown</div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Text</span>
          </div>
          <span className="font-medium text-gray-900">{counts.text}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <LinkIcon className="w-4 h-4" />
            <span>Links</span>
          </div>
          <span className="font-medium text-gray-900">{counts.link}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <File className="w-4 h-4" />
            <span>PDFs</span>
          </div>
          <span className="font-medium text-gray-900">{counts.pdf}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileImage className="w-4 h-4" />
            <span>Images</span>
          </div>
          <span className="font-medium text-gray-900">{counts.image}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Video className="w-4 h-4" />
            <span>Videos</span>
          </div>
          <span className="font-medium text-gray-900">{counts.video}</span>
        </div>

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-900">Total Sections</span>
            <span className="text-indigo-600">{counts.total}</span>
          </div>
        </div>
      </div>

      {/* Estimated Duration */}
      {duration.totalSeconds > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Estimated Duration</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatDuration(duration.totalSeconds)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            (from video sections)
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <div className="text-xs text-gray-600 mb-2">Status</div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </div>
      </div>
    </div>
  );
}

