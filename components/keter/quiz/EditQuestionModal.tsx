// Epic 1G.6: Edit Question Modal (Updated for 1H.2b)
"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import { Question, QuestionType, QuestionOption, QuestionMeta } from "@/types";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (question: Question) => void;
  onDelete?: (questionId: string) => void;
  isReadOnly?: boolean;
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  onSave,
  onDelete,
  isReadOnly = false,
}: EditQuestionModalProps) {
  const [type, setType] = useState<QuestionType>("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "opt_1", text: "", correct: false },
    { id: "opt_2", text: "", correct: false },
    { id: "opt_3", text: "", correct: false },
    { id: "opt_4", text: "", correct: false },
  ]);
  const [answer, setAnswer] = useState<boolean>(true);
  const [rationale, setRationale] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [language, setLanguage] = useState<string>("en");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Phase II 1H.2b: New question type fields
  const [correctAnswerText, setCorrectAnswerText] = useState(""); // for shorttext
  const [correctNumber, setCorrectNumber] = useState<string>(""); // for numeric
  const [tolerance, setTolerance] = useState<string>("0"); // for numeric
  const [gradingMode, setGradingMode] = useState<"all-or-nothing" | "partial">("all-or-nothing"); // for multiselect
  const [required, setRequired] = useState<boolean>(true);
  const [points, setPoints] = useState<string>("1");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (question) {
      setType(question.type);
      setPrompt(question.prompt || "");
      setOptions(question.options || [
        { id: "opt_1", text: "", correct: false },
        { id: "opt_2", text: "", correct: false },
        { id: "opt_3", text: "", correct: false },
        { id: "opt_4", text: "", correct: false },
      ]);
      setAnswer(question.answer ?? true);
      setRationale(question.meta?.rationale || "");
      setDifficulty(question.meta?.difficulty || "medium");
      setTags(question.meta?.tags || []);
      setLanguage(question.meta?.language || "en");
      
      // Phase II 1H.2b: Load new fields
      setCorrectAnswerText(question.correctAnswerText || "");
      setCorrectNumber(question.correctNumber?.toString() || "");
      setTolerance(question.tolerance?.toString() || "0");
      setGradingMode(question.grading?.mode || "all-or-nothing");
      setRequired(question.required !== false);
      setPoints(question.points?.toString() || "1");
      setExplanation(question.explanation || "");
    } else {
      // Reset to defaults
      setType("mcq");
      setPrompt("");
      setOptions([
        { id: "opt_1", text: "", correct: false },
        { id: "opt_2", text: "", correct: false },
        { id: "opt_3", text: "", correct: false },
        { id: "opt_4", text: "", correct: false },
      ]);
      setAnswer(true);
      setRationale("");
      setDifficulty("medium");
      setTags([]);
      setLanguage("en");
      
      // Phase II 1H.2b: Reset new fields
      setCorrectAnswerText("");
      setCorrectNumber("");
      setTolerance("0");
      setGradingMode("all-or-nothing");
      setRequired(true);
      setPoints("1");
      setExplanation("");
    }
  }, [question]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const meta: QuestionMeta = {
      rationale: rationale || undefined,
      difficulty,
      tags: tags.length > 0 ? tags : undefined,
      language,
      source: question?.meta?.source,
    };

    // Validate required fields
    if (!prompt.trim()) {
      alert("Please enter a question prompt");
      return;
    }

    // Type-specific validation
    if (type === "shorttext") {
      if (!correctAnswerText.trim()) {
        alert("Please enter the correct answer text");
        return;
      }
    } else if (type === "numeric") {
      const num = parseFloat(correctNumber);
      if (isNaN(num) || !isFinite(num)) {
        alert("Please enter a valid number for the correct answer");
        return;
      }
    } else if (type === "ordering") {
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options");
        return;
      }
      // All options must be present for ordering
      if (validOptions.length !== options.length) {
        alert("All options must have text for ordering questions");
        return;
      }
    } else if (type === "multiselect") {
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options");
        return;
      }
      // At least one correct answer required
      if (!validOptions.some(opt => opt.correct)) {
        alert("Please mark at least one option as correct");
        return;
      }
    } else if (type !== "true_false") {
      // MCQ and Scenario validation
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options");
        return;
      }
      // Exactly one correct answer for MCQ/Scenario
      if (!validOptions.some(opt => opt.correct)) {
        alert("Please mark exactly one option as correct");
        return;
      }
    }

    // Validate points
    const pointsNum = parseFloat(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      alert("Points must be a positive number");
      return;
    }

    // Build question data
    const questionData: Question = question
      ? {
          // Editing existing question
          ...question,
          type,
          prompt,
          options: (type === "mcq" || type === "scenario" || type === "multiselect" || type === "ordering")
            ? options.filter(opt => opt.text.trim())
            : undefined,
          answer: type === "true_false" ? answer : undefined,
          correctAnswerText: type === "shorttext" ? correctAnswerText : undefined,
          correctNumber: type === "numeric" ? parseFloat(correctNumber) : undefined,
          tolerance: type === "numeric" ? parseFloat(tolerance) : undefined,
          grading: type === "multiselect" ? { mode: gradingMode } : undefined,
          correctOrder: type === "ordering" ? options.filter(opt => opt.text.trim()).map(opt => opt.id) : undefined,
          required: required === false ? false : undefined,
          points: pointsNum !== 1 ? pointsNum : undefined,
          explanation: explanation || undefined,
          meta,
          updatedAt: now,
        }
      : {
          // Creating new question
          id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type,
          prompt,
          options: (type === "mcq" || type === "scenario" || type === "multiselect" || type === "ordering")
            ? options.filter(opt => opt.text.trim())
            : undefined,
          answer: type === "true_false" ? answer : undefined,
          correctAnswerText: type === "shorttext" ? correctAnswerText : undefined,
          correctNumber: type === "numeric" ? parseFloat(correctNumber) : undefined,
          tolerance: type === "numeric" ? parseFloat(tolerance) : undefined,
          grading: type === "multiselect" ? { mode: gradingMode } : undefined,
          correctOrder: type === "ordering" ? options.filter(opt => opt.text.trim()).map(opt => opt.id) : undefined,
          required: required === false ? false : undefined,
          points: pointsNum !== 1 ? pointsNum : undefined,
          explanation: explanation || undefined,
          meta,
          createdAt: now,
          updatedAt: now,
        };

    onSave(questionData);
    onClose();
  };

  const handleDelete = () => {
    if (question && onDelete) {
      onDelete(question.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    if (type === "multiselect") {
      // Multiselect: allow multiple correct answers
      const newOptions = [...options];
      newOptions[index] = { ...newOptions[index], correct: !newOptions[index].correct };
      setOptions(newOptions);
    } else {
      // MCQ/Scenario/Ordering: only one correct (radio behavior)
      const newOptions = options.map((opt, idx) => ({
        ...opt,
        correct: idx === index,
      }));
      setOptions(newOptions);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isReadOnly ? "View Question" : question ? "Edit Question" : "Create Question"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && onDelete && question && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border-2 border-transparent hover:border-red-200"
                  title="Delete question"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="px-6 py-4 bg-red-50 border-b-2 border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-red-900">Delete this question?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Question Type */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Question Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              disabled={isReadOnly}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="scenario">Scenario</option>
              <option value="shorttext">Short Text</option>
              <option value="multiselect">Multiple Select</option>
              <option value="numeric">Numeric</option>
              <option value="ordering">Ordering</option>
            </select>
          </div>

          {/* Prompt */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {type === "scenario" ? "Scenario Stem" : "Question Prompt"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder={type === "scenario" ? "Enter the scenario description..." : "Enter the question..."}
            />
          </div>

          {/* Options (for MCQ, Scenario, Multiselect, Ordering) */}
          {(type === "mcq" || type === "scenario" || type === "multiselect" || type === "ordering") && (
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Options
                <span className="text-red-500 ml-1">*</span>
                {type === "ordering" && (
                  <span className="text-xs text-gray-500 ml-2 font-normal">(All options will be ordered)</span>
                )}
                {type === "multiselect" && (
                  <span className="text-xs text-gray-500 ml-2 font-normal">(Select multiple correct answers)</span>
                )}
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all">
                    {(type === "mcq" || type === "scenario") && (
                      <input
                        type="radio"
                        checked={option.correct}
                        onChange={() => handleCorrectChange(index)}
                        disabled={isReadOnly}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                        title="Mark as correct answer"
                      />
                    )}
                    {(type === "multiselect") && (
                      <input
                        type="checkbox"
                        checked={option.correct}
                        onChange={() => handleCorrectChange(index)}
                        disabled={isReadOnly}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                        title="Mark as correct answer"
                      />
                    )}
                    {type === "ordering" && (
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded text-sm font-semibold">
                        {index + 1}
                      </div>
                    )}
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      disabled={isReadOnly}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
              {type === "multiselect" && (
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Grading Mode
                  </label>
                  <select
                    value={gradingMode}
                    onChange={(e) => setGradingMode(e.target.value as "all-or-nothing" | "partial")}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="all-or-nothing">All-or-Nothing (exact match required)</option>
                    <option value="partial">Partial Credit (proportional scoring)</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    {gradingMode === "all-or-nothing" 
                      ? "Learners must select all and only the correct answers to receive points."
                      : "Learners receive proportional credit based on correct/incorrect selections."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* True/False Answer */}
          {type === "true_false" && (
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Correct Answer
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAnswer(true)}
                  disabled={isReadOnly}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all border-2 ${
                    answer
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  True
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(false)}
                  disabled={isReadOnly}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all border-2 ${
                    !answer
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  False
                </button>
              </div>
            </div>
          )}

          {/* Short Text Correct Answer */}
          {type === "shorttext" && (
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Correct Answer
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={correctAnswerText}
                onChange={(e) => setCorrectAnswerText(e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter the correct answer text..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                Answers will be compared case-insensitively after trimming whitespace.
              </p>
            </div>
          )}

          {/* Numeric Correct Answer */}
          {type === "numeric" && (
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Correct Answer
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Number
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={correctNumber}
                    onChange={(e) => setCorrectNumber(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Tolerance (±)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Answers within ±{tolerance || "0"} of {correctNumber || "the correct number"} will be accepted.
              </p>
            </div>
          )}

          {/* Question Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Points
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Required
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  disabled={isReadOnly}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">This question is required</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Explanation (shown after quiz submission)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Provide an explanation for the correct answer (optional)..."
            />
          </div>

          {/* Rationale (Legacy) */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Rationale (Legacy - use Explanation above)
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                disabled={isReadOnly}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              {!isReadOnly && (
                <Button onClick={handleAddTag} variant="secondary" className="font-semibold">
                  Add
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200"
                >
                  {tag}
                  {!isReadOnly && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-indigo-900 transition-colors p-0.5 rounded-full hover:bg-indigo-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        {!isReadOnly && (
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t-2 border-gray-200 flex items-center justify-end gap-3">
            <Button onClick={onClose} variant="secondary" className="font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" className="shadow-md hover:shadow-lg font-semibold">
              <Save className="w-4 h-4 mr-2" />
              {question ? "Save Changes" : "Create Question"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

