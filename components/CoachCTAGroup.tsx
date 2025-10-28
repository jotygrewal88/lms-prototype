"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Filter, Settings, MoreVertical } from "lucide-react";

interface CoachCTAGroupProps {
  onView: () => void;
  onEscalate: () => void;
  onCadence: () => void;
}

export default function CoachCTAGroup({ onView, onEscalate, onCadence }: CoachCTAGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        Actions
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleAction(onEscalate)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Bell className="h-4 w-4 text-blue-600" />
              Draft Escalation
            </button>
            <button
              onClick={() => handleAction(onView)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
              View Team
            </button>
            <button
              onClick={() => handleAction(onCadence)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              Adjust Cadence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

