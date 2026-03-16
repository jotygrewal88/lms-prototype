"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings2, Type, Contrast } from "lucide-react";

interface AccessibilityControlsProps {
  textSize: "sm" | "base" | "lg";
  highContrast: boolean;
  onTextSizeChange: (size: "sm" | "base" | "lg") => void;
  onHighContrastChange: (enabled: boolean) => void;
}

export default function AccessibilityControls({
  textSize,
  highContrast,
  onTextSizeChange,
  onHighContrastChange,
}: AccessibilityControlsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sizes: Array<{ key: "sm" | "base" | "lg"; label: string }> = [
    { key: "sm", label: "Small" },
    { key: "base", label: "Medium" },
    { key: "lg", label: "Large" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
        title="Accessibility settings"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Accessibility</p>

            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1.5">
                <Type className="w-3.5 h-3.5" />
                Text Size
              </div>
              <div className="flex gap-1">
                {sizes.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onTextSizeChange(s.key)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                      textSize === s.key
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => onHighContrastChange(!highContrast)}
                className="flex items-center gap-2 w-full text-sm text-gray-700 hover:bg-gray-50 rounded px-2 py-1.5 transition-colors"
              >
                <Contrast className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">High Contrast</span>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors ${highContrast ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${highContrast ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
