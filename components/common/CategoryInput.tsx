// Phase II — 1N.3: Reusable Category Input Component
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CategoryInputProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CategoryInput({ 
  categories, 
  onChange, 
  placeholder = "Add categories (comma-separated)...", 
  disabled = false 
}: CategoryInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCategories();
    } else if (e.key === "Backspace" && inputValue === "" && categories.length > 0) {
      // Remove last category on backspace when input is empty
      removeCategory(categories.length - 1);
    }
  };

  const addCategories = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      // Split by comma and filter empty strings
      const newCategories = trimmed
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0 && !categories.includes(c));
      
      if (newCategories.length > 0) {
        onChange([...categories, ...newCategories]);
        setInputValue("");
      }
    }
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* Categories display */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-sm font-medium"
            >
              {category}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="hover:bg-purple-100 rounded-full p-0.5"
                  aria-label={`Remove ${category}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      
      {/* Input field */}
      {!disabled && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addCategories}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

