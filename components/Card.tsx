// Phase I Epic 1 & UI Refresh v2: EHS-style card with precise tokens
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div 
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
