// Preview Quiz Panel - Quiz experience in preview mode (ephemeral, not persisted)
"use client";

import React, { useState } from "react";
import { Quiz, Question } from "@/types";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface PreviewQuizPanelProps {
  quiz: Quiz;
  questions: Question[];
  courseId: string;
  lessonId: string;
}

type QuizState = "not_started" | "in_progress" | "submitted";

interface Answer {
  questionId: string;
  value: string | string[];
}

export default function PreviewQuizPanel({
  quiz,
  questions,
  courseId,
  lessonId,
}: PreviewQuizPanelProps) {
  const [quizState, setQuizState] = useState<QuizState>("not_started");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    questionResults: Record<string, { correct: boolean; correctAnswer: string | string[] }>;
  } | null>(null);

  const handleStartQuiz = () => {
    setQuizState("in_progress");
    setAnswers({});
    setResults(null);
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    // Grade the quiz locally
    let correctCount = 0;
    const questionResults: Record<string, { correct: boolean; correctAnswer: string | string[] }> = {};

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === "MULTI_SELECT") {
        const correctSet = new Set(question.correctAnswer as string[]);
        const userSet = new Set((userAnswer as string[]) || []);
        isCorrect = correctSet.size === userSet.size && 
          [...correctSet].every(a => userSet.has(a));
      }

      questionResults[question.id] = {
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
      };

      if (isCorrect) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passingScore = quiz.config?.passingScore || 70;
    const passed = score >= passingScore;

    setResults({ score, passed, questionResults });
    setQuizState("submitted");
  };

  const handleRetry = () => {
    setQuizState("not_started");
    setAnswers({});
    setResults(null);
  };

  const allAnswered = questions.every(q => {
    const answer = answers[q.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  });

  // Not Started State
  if (quizState === "not_started") {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{quiz.title || "Lesson Quiz"}</h3>
            <p className="text-gray-600 mt-1">
              {questions.length} question{questions.length !== 1 ? "s" : ""} • 
              Passing score: {quiz.config?.passingScore || 70}%
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Preview Mode:</span>
            <span>Quiz results are not saved. This is how learners will experience the quiz.</span>
          </div>
        </div>

        <Button variant="primary" onClick={handleStartQuiz} className="w-full">
          Start Quiz
        </Button>
      </div>
    );
  }

  // Submitted State
  if (quizState === "submitted" && results) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Results Header */}
        <div className={`p-8 ${results.passed ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-red-50 to-orange-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {results.passed ? (
                  <Award className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {results.passed ? "Quiz Passed!" : "Quiz Not Passed"}
                </h3>
              </div>
              <p className="text-gray-600">
                You scored {results.score}% ({quiz.config?.passingScore || 70}% required to pass)
              </p>
            </div>
            <div className={`text-5xl font-bold ${results.passed ? "text-emerald-600" : "text-red-600"}`}>
              {results.score}%
            </div>
          </div>
          
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Preview Mode: These results are not saved to learner progress.</span>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Question Review</h4>
          {questions.map((question, index) => {
            const result = results.questionResults[question.id];
            const userAnswer = answers[question.id];
            
            return (
              <div 
                key={question.id}
                className={`p-4 rounded-lg border ${
                  result.correct 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </p>
                    <div className="mt-2 text-sm">
                      <p className={result.correct ? "text-emerald-700" : "text-red-700"}>
                        Your answer: {Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer || "(no answer)"}
                      </p>
                      {!result.correct && (
                        <p className="text-emerald-700 mt-1">
                          Correct answer: {Array.isArray(result.correctAnswer) ? result.correctAnswer.join(", ") : result.correctAnswer}
                        </p>
                      )}
                    </div>
                    {question.explanation && quiz.config?.showExplanations && (
                      <p className="mt-2 text-sm text-gray-600 bg-white/50 rounded p-2">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Retry Button */}
        <div className="p-6 pt-0">
          <Button variant="secondary" onClick={handleRetry} className="w-full flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  // In Progress State
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{quiz.title || "Lesson Quiz"}</h3>
            <p className="text-sm text-gray-600">
              {Object.keys(answers).length} of {questions.length} questions answered
            </p>
          </div>
          <div className="text-sm text-indigo-600 font-medium">
            Pass: {quiz.config?.passingScore || 70}%
          </div>
        </div>
        <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <p className="font-medium text-gray-900">
              <span className="text-indigo-600 mr-2">{index + 1}.</span>
              {question.text}
            </p>

            {/* Multiple Choice / True-False */}
            {(question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") && (
              <div className="space-y-2 pl-6">
                {question.options?.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      answers[question.id] === option
                        ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Multi-Select */}
            {question.type === "MULTI_SELECT" && (
              <div className="space-y-2 pl-6">
                <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                {question.options?.map((option, optIndex) => {
                  const selectedOptions = (answers[question.id] as string[]) || [];
                  const isSelected = selectedOptions.includes(option);
                  
                  return (
                    <label
                      key={optIndex}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newValue = isSelected
                            ? selectedOptions.filter(o => o !== option)
                            : [...selectedOptions, option];
                          handleAnswerChange(question.id, newValue);
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full"
        >
          {allAnswered ? "Submit Quiz" : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </Button>
      </div>
    </div>
  );
}


