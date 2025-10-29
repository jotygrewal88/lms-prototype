// Epic 1D: Inline editable text component
"use client";

import React, { useState, useEffect, useRef } from "react";

interface InlineEditableProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function InlineEditable({
  value,
  onSave,
  placeholder = "Enter text...",
  multiline = false,
  disabled = false,
  className = "",
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (multiline) {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, multiline]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (disabled) {
    return (
      <div className={`text-gray-700 ${className}`}>
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
    );
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
          rows={4}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
}

