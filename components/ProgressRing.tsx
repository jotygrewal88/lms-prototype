// Phase I Epic 4: Progress ring component
"use client";

import React from "react";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary-color)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Percentage text - scale based on ring size */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="font-bold" 
          style={{ 
            color: "var(--primary-color)",
            fontSize: size <= 48 ? '0.75rem' : size <= 80 ? '1.25rem' : '1.875rem',
          }}
        >
          {Math.round(progress)}%
        </span>
        {size > 60 && (
          <span className="text-xs text-gray-500 mt-1">Complete</span>
        )}
      </div>
    </div>
  );
}

