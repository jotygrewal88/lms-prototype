// Phase II 1I.1: Question Renderer Component (with feedback support)
"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Question } from "@/types";
import { isValidAnswer } from "./QuizQuestion";

interface QuestionRendererProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
  correctAnswer?: any;
  shuffledOptions?: Question["options"]; // For option shuffling
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
  isCorrect,
  correctAnswer,
  shuffledOptions,
}: QuestionRendererProps) {
  // Use shuffled options if provided, otherwise use original options
  const options = shuffledOptions || question.options;

  const renderMCQ = () => {
    if (!options || options.length === 0) {
      return <div className="text-gray-500">No options available</div>;
    }

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const answerValue = Array.isArray(value) ? value[0] : value;

    return (
      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = answerValue === option.id;
          const isCorrectOption = option.correct;
          const showResult = showFeedback && isCorrect !== undefined;

          return (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected
                  ? showResult
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : showResult && isCorrectOption
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="font-semibold text-gray-700 mr-2">
                  {labels[index]}.
                </span>
                <span className="text-gray-900 flex-1">{option.text}</span>
                {showResult && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  const renderTrueFalse = () => {
    const answerValue = Array.isArray(value) ? value[0] : value;
    const correctBool = question.answer;

    return (
      <div className="space-y-2">
        {[
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ].map((option) => {
          const isSelected = answerValue === option.value;
          const isCorrectOption = (option.value === "true") === correctBool;
          const showResult = showFeedback && isCorrect !== undefined;

          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected
                  ? showResult
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : showResult && isCorrectOption
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium flex-1">{option.label}</span>
              {showResult && isCorrectOption && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
              {showResult && isSelected && !isCorrect && !isCorrectOption && (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>
    );
  };

  const renderShortText = () => {
    const answerValue = Array.isArray(value) ? value.join('') : value || '';
    const showResult = showFeedback && isCorrect !== undefined;

    return (
      <div className="space-y-2">
        <input
          type="text"
          value={answerValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer here..."
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
            showResult
              ? isCorrect
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
        />
        {showResult && !isCorrect && correctAnswer && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Correct answer:</span>{" "}
            <span className="text-green-700">{correctAnswer}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMultiselect = () => {
    if (!options || options.length === 0) {
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
      onChange(Array.from(newSelected));
    };

    const showResult = showFeedback && isCorrect !== undefined;

    return (
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedIds.has(option.id);
          const isCorrectOption = option.correct;

          return (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected
                  ? showResult
                    ? isCorrectOption
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : showResult && isCorrectOption
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.id)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-900">{option.text}</span>
                {showResult && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </label>
          );
        })}
        {selectedIds.size > 0 && !showResult && (
          <p className="text-sm text-gray-500 mt-2">
            {selectedIds.size} selected
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
      {showFeedback && question.explanation && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}


