// UI Refresh v2: Header pill component for scope/department selectors
"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface HeaderPillProps {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  isFiltered?: boolean;
}

export default function HeaderPill({
  label,
  value,
  options,
  onSelect,
  disabled = false,
  ariaLabel,
  isFiltered = false,
}: HeaderPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current label
  const currentOption = options.find(opt => opt.id === value);
  const displayLabel = currentOption?.name || label;

  // Truncate label to 18 characters
  const truncatedLabel = displayLabel.length > 18 
    ? displayLabel.substring(0, 18) + "..." 
    : displayLabel;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onSelect(optionId);
    setIsOpen(false);
  };

  const pillClasses = isFiltered
    ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100";

  const ringClasses = isOpen ? "ring-2 ring-[#2563EB]" : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] leading-none
          ${pillClasses}
          ${ringClasses}
          focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:ring-offset-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {isFiltered && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        )}
        <span className="truncate max-w-[18ch]">{truncatedLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1 max-h-64 overflow-y-auto" role="listbox">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full text-left px-3 py-2 text-sm transition-colors
                  ${value === option.id 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
                role="option"
                aria-selected={value === option.id}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

