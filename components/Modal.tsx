// Phase I Epic 1: Modal skeleton component (for future use)
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "small" | "medium" | "large" | "xl";
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, size = "medium", children }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          )}
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

