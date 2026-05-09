// Phase II 1H.2a: Quiz Question Component (Updated for 1H.2b)
"use client";

import React, { useState } from "react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Question } from "@/types";

interface QuizQuestionProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

/**
 * Check if an answer value is valid for a question
 * Phase II 1H.2b
 */
export function isValidAnswer(value: string | undefined, question: Question): boolean {
  if (question.required === false) return true; // Optional questions
  if (!value || value.trim() === '') return false;
  
  switch (question.type) {
    case 'multiselect':
      return value.split(',').filter(id => id.trim()).length > 0;
    
    case 'numeric':
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    
    case 'ordering':
      const orderIds = value.split(',').filter(id => id.trim());
      return orderIds.length === (question.options?.length ?? 0);
    
    default:
      return value.trim().length > 0;
  }
}

export default function QuizQuestion({
  question,
  value,
  onChange,
  disabled = false,
}: QuizQuestionProps) {
  // Phase II 1H.2b: Initialize ordering with default order if no value
  React.useEffect(() => {
    if (question.type === 'ordering' && !value && question.options && question.options.length > 0) {
      const defaultOrder = question.options.map(opt => opt.id).join(',');
      onChange(defaultOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.type, question.id]); // Only run when question changes

  const renderMCQ = () => {
    if (!question.options || question.options.length === 0) {
      return <div className="text-gray-500">No options available</div>;
    }

    // Generate labels (A, B, C, D...)
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    return (
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={option.id}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              value === option.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 mr-2">
                {labels[index]}.
              </span>
              <span className="text-gray-900">{option.text}</span>
            </div>
          </label>
        ))}
      </div>
    );
  };

  const renderTrueFalse = () => {
    return (
      <div className="space-y-2">
        {[
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ].map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              value === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900 font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderShortText = () => {
    return (
      <div>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer here..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    );
  };

  const renderMultiselect = () => {
    if (!question.options || question.options.length === 0) {
      return <div className="text-gray-500">No options available</div>;
    }

    const selectedIds = value 
      ? Array.isArray(value) 
        ? new Set(value) 
        : new Set(value.split(',').map(id => id.trim()).filter(id => id))
      : new Set();

    const handleToggle = (optionId: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId);
      } else {
        newSelected.add(optionId);
      }
      onChange(Array.from(newSelected).join(','));
    };

    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedIds.has(option.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(option.id)}
              onChange={() => handleToggle(option.id)}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-900">{option.text}</span>
          </label>
        ))}
        {selectedIds.size > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {selectedIds.size} selected
          </p>
        )}
      </div>
    );
  };

  const renderNumeric = () => {
    return (
      <div>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter a number"
          step="any"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {question.tolerance !== undefined && question.tolerance > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            ±{question.tolerance} accepted
          </p>
        )}
      </div>
    );
  };

  const renderOrdering = () => {
    if (!question.options || question.options.length === 0) {
      return <div className="text-gray-500">No options available</div>;
    }

    // Initialize with default order if no value
    const orderIds = value 
      ? Array.isArray(value)
        ? value
        : value.trim() ? value.split(',').map(id => id.trim()).filter(id => id) : question.options.map(opt => opt.id)
      : question.options.map(opt => opt.id);

    // Ensure all options are included
    const orderedOptions = orderIds.length === question.options.length
      ? orderIds.map(id => question.options!.find(opt => opt.id === id)).filter(Boolean)
      : question.options;

    const moveItem = (fromIndex: number, toIndex: number) => {
      const newOrder = [...orderedOptions.map(opt => opt!.id)];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      onChange(newOrder.join(','));
    };

    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-3">
          Drag items or use arrow buttons to reorder. Place them in the correct sequence.
        </p>
        {orderedOptions.map((option, index) => (
          <div
            key={option!.id}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 bg-white"
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-semibold text-gray-700">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 text-gray-900">{option!.text}</div>
            {!disabled && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, Math.min(orderedOptions.length - 1, index + 1))}
                  disabled={index === orderedOptions.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {value && orderIds.length < question.options.length && (
          <p className="text-sm text-gray-500 mt-2">
            Please order all items
          </p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (question.type) {
      case "mcq":
      case "scenario":
        return renderMCQ();
      case "true_false":
        return renderTrueFalse();
      case "shorttext":
        return renderShortText();
      case "multiselect":
        return renderMultiselect();
      case "numeric":
        return renderNumeric();
      case "ordering":
        return renderOrdering();
      default:
        return <div className="text-gray-500">Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.prompt}
        </h3>
      </div>
      {renderContent()}
    </div>
  );
}
