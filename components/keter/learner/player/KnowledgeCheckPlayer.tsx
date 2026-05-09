"use client";

// Keter — Anderson learner player primitive.
// Extracted from app/keter/learner/course/[id]/page.tsx so the same component
// can be reused by both the inline learner player and the admin "preview as
// learner" surface (components/keter/learner/player/ResourceRenderer.tsx).
// Behavior is byte-identical to the original inline implementation.

import React, { useState } from "react";
import type { KnowledgeCheckData } from "@/types";

export default function KnowledgeCheckPlayer({
  data,
}: {
  data: KnowledgeCheckData;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const getOptionClassName = (idx: number) => {
    const base =
      "w-full text-left rounded-lg p-3 text-sm transition-all border";

    if (isChecked) {
      if (data.options[idx].isCorrect) {
        return `${base} bg-green-50 border-green-500 text-green-800 font-medium`;
      }
      if (idx === selectedIndex && !data.options[idx].isCorrect) {
        return `${base} bg-red-50 border-red-500 text-red-800`;
      }
      return `${base} bg-white border-gray-200 text-gray-400`;
    }

    if (idx === selectedIndex) {
      return `${base} border-purple-500 bg-purple-50 font-medium text-gray-900`;
    }

    return `${base} bg-white border-gray-200 text-gray-700 hover:border-purple-300`;
  };

  return (
    <div className="bg-purple-50 rounded-xl p-6 shadow-sm">
      <p className="text-purple-700 font-semibold text-sm uppercase tracking-wide">
        ✋ Knowledge Check
      </p>

      <p className="text-lg font-medium text-gray-900 mt-3 mb-5">
        {data.question}
      </p>

      <div className="space-y-3">
        {data.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!isChecked) setSelectedIndex(idx);
            }}
            disabled={isChecked}
            className={getOptionClassName(idx)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {selectedIndex !== null && !isChecked && (
        <button
          onClick={() => setIsChecked(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 mt-4 transition-colors"
        >
          Check Answer
        </button>
      )}

      {isChecked && (
        <>
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Explanation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.explanation}
            </p>
          </div>

          <p className="text-center mt-4 text-sm text-purple-600 font-medium">
            Continue ↓
          </p>
        </>
      )}
    </div>
  );
}
