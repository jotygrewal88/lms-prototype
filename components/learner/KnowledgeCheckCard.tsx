"use client";

import React, { useState, useEffect } from "react";
import { KnowledgeCheck } from "@/types";
import { saveKnowledgeCheckAnswer, getKnowledgeCheckAnswers } from "@/lib/store";

interface KnowledgeCheckCardProps {
  check: KnowledgeCheck;
  index: number;
  lessonId: string;
  userId: string;
  onAnswered?: (checkId: string, correct: boolean) => void;
}

export default function KnowledgeCheckCard({ check, index, lessonId, userId, onAnswered }: KnowledgeCheckCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Load persisted answer
  useEffect(() => {
    const answers = getKnowledgeCheckAnswers(lessonId, userId);
    const savedAnswer = answers[check.id];
    if (savedAnswer) {
      setSelectedOptionId(savedAnswer);
      setSubmitted(true);
      setIsCorrect(savedAnswer === check.correctOptionId);
    }
  }, [check.id, check.correctOptionId, lessonId, userId]);

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    const correct = selectedOptionId === check.correctOptionId;
    setIsCorrect(correct);
    setSubmitted(true);
    saveKnowledgeCheckAnswer(lessonId, userId, check.id, selectedOptionId);
    onAnswered?.(check.id, correct);
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-colors ${
      submitted 
        ? isCorrect 
          ? "border-green-200 bg-green-50/50" 
          : "border-red-200 bg-red-50/50"
        : "border-gray-200 bg-gray-50/50"
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
          submitted 
            ? isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            : "bg-purple-100 text-purple-700"
        }`}>
          {submitted ? (isCorrect ? "✓" : "✗") : `${index + 1}`}
        </div>
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Knowledge Check
        </span>
      </div>

      {/* Question */}
      <p className="text-gray-900 font-medium text-base mb-4 leading-relaxed">{check.question}</p>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {check.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = option.id === check.correctOptionId;
          
          let optionStyles = "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer";
          
          if (submitted) {
            if (isCorrectOption) {
              optionStyles = "border-green-300 bg-green-50 text-green-900";
            } else if (isSelected && !isCorrectOption) {
              optionStyles = "border-red-300 bg-red-50 text-red-900";
            } else {
              optionStyles = "border-gray-200 bg-gray-50 text-gray-400";
            }
          } else if (isSelected) {
            optionStyles = "border-purple-400 bg-purple-50 ring-1 ring-purple-200";
          }

          return (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3.5 rounded-lg border-2 transition-all ${optionStyles} ${submitted ? "cursor-default" : ""}`}
            >
              <input
                type="radio"
                name={`kc-${check.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => !submitted && setSelectedOptionId(option.id)}
                disabled={submitted}
                className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-sm leading-relaxed">{option.text}</span>
              {submitted && isCorrectOption && (
                <span className="ml-auto text-green-600 text-xs font-semibold whitespace-nowrap">✓ Correct</span>
              )}
            </label>
          );
        })}
      </div>

      {/* Submit / Feedback */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOptionId}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-sm"
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-4 rounded-lg text-sm leading-relaxed ${
          isCorrect 
            ? "bg-green-100/80 text-green-800 border border-green-200" 
            : "bg-red-100/80 text-red-800 border border-red-200"
        }`}>
          <span className="font-semibold">{isCorrect ? "Correct!" : "Not quite."}</span>{" "}
          {check.explanation}
        </div>
      )}
    </div>
  );
}
