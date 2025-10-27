// Phase I Epic 1 & UI Refresh v2: EHS-style card with precise tokens
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}
