// Phase I Epic 1: Progress component
import React from "react";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export default function Progress({ 
  value, 
  className = "",
  showLabel = true 
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">{clampedValue}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-300"
          style={{ 
            width: `${clampedValue}%`,
            backgroundColor: 'var(--primary-color)'
          }}
        />
      </div>
    </div>
  );
}

