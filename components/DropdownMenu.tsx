/**
 * DropdownMenu - Reusable dropdown menu component
 * Supports trigger button with menu items, click-outside to close
 */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  label?: string;
  icon?: React.ReactNode;
  items: DropdownMenuItem[];
  variant?: "primary" | "secondary" | "more";
  className?: string;
}

export default function DropdownMenu({
  label,
  icon,
  items,
  variant = "secondary",
  className = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const baseButtonStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 h-[38px] rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-emerald-500",
    more: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-emerald-500 !px-3",
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonStyles} ${variantStyles[variant]}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon}
        {label && <span>{label}</span>}
        {variant === "more" ? (
          <MoreHorizontal className="w-4 h-4" />
        ) : (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                role="menuitem"
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

