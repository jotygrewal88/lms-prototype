// ComplianceBadge: Shows a Shield icon colored by user's most urgent compliance status
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Shield } from "lucide-react";
import { getCompletionsByUserId } from "@/lib/store";
import { CompletionStatus } from "@/types";

interface ComplianceBadgeProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

type UrgencyLevel = "overdue" | "assigned" | "compliant" | "none";

const STATUS_PRIORITY: Record<CompletionStatus, number> = {
  OVERDUE: 3,
  ASSIGNED: 2,
  COMPLETED: 1,
  EXEMPT: 0,
};

const URGENCY_STYLES: Record<UrgencyLevel, { icon: string; bg: string; label: string; tooltip: string }> = {
  overdue: {
    icon: "text-red-600",
    bg: "bg-red-100",
    label: "Overdue trainings",
    tooltip: "bg-red-700",
  },
  assigned: {
    icon: "text-amber-500",
    bg: "bg-amber-100",
    label: "Pending trainings",
    tooltip: "bg-amber-600",
  },
  compliant: {
    icon: "text-green-600",
    bg: "bg-green-100",
    label: "Fully compliant",
    tooltip: "bg-green-700",
  },
  none: {
    icon: "text-gray-400",
    bg: "bg-gray-100",
    label: "No trainings assigned",
    tooltip: "bg-gray-700",
  },
};

const SIZE_CLASSES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

function getUrgencyLevel(completions: { status: CompletionStatus }[]): UrgencyLevel {
  if (completions.length === 0) return "none";

  const maxPriority = Math.max(...completions.map((c) => STATUS_PRIORITY[c.status]));

  if (maxPriority >= STATUS_PRIORITY.OVERDUE) return "overdue";
  if (maxPriority >= STATUS_PRIORITY.ASSIGNED) return "assigned";
  return "compliant";
}

interface TooltipPosition {
  x: number;
  y: number;
  showBelow: boolean;
}

export default function ComplianceBadge({
  userId,
  size = "md",
  showTooltip = true,
  className = "",
}: ComplianceBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  
  const completions = getCompletionsByUserId(userId);
  const urgency = getUrgencyLevel(completions);
  const style = URGENCY_STYLES[urgency];

  // Build tooltip content
  const overdueCount = completions.filter((c) => c.status === "OVERDUE").length;
  const assignedCount = completions.filter((c) => c.status === "ASSIGNED").length;
  const completedCount = completions.filter((c) => c.status === "COMPLETED" || c.status === "EXEMPT").length;

  // Set mounted state for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate tooltip position when hovered
  useEffect(() => {
    if (isHovered && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const showBelow = rect.top < 120; // Show below if less than 120px from top
      
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: showBelow ? rect.bottom + 8 : rect.top - 8,
        showBelow,
      });
    } else {
      setTooltipPos(null);
    }
  }, [isHovered]);

  const tooltipContent = tooltipPos && (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: tooltipPos.x,
        top: tooltipPos.y,
        transform: `translateX(-50%) ${tooltipPos.showBelow ? '' : 'translateY(-100%)'}`,
      }}
    >
      <div className={`${style.tooltip} text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap`}>
        {/* Status Label */}
        <div className="font-semibold mb-1">{style.label}</div>
        
        {/* Breakdown */}
        {completions.length > 0 ? (
          <div className="space-y-0.5 text-white/90">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>{overdueCount} overdue</span>
              </div>
            )}
            {assignedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{assignedCount} pending</span>
              </div>
            )}
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span>{completedCount} complete</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/80 text-xs">No training records</div>
        )}
      </div>
      {/* Arrow */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent ${
          tooltipPos.showBelow 
            ? `bottom-full border-b-[6px] ${style.tooltip.replace('bg-', 'border-b-')}` 
            : `top-full border-t-[6px] ${style.tooltip.replace('bg-', 'border-t-')}`
        }`} 
      />
    </div>
  );

  return (
    <>
      <span
        ref={badgeRef}
        className={`relative inline-flex items-center justify-center rounded-full p-1 ${style.bg} ${className} cursor-help`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Shield className={`${SIZE_CLASSES[size]} ${style.icon}`} />
      </span>
      
      {/* Render tooltip in portal to avoid overflow clipping */}
      {showTooltip && isMounted && tooltipPos && createPortal(tooltipContent, document.body)}
    </>
  );
}
