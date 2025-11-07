// Phase II 1H.2a: Quiz Summary Component (Updated for 1H.2b)
"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/Button";
import { QuizAttempt, Quiz, Question, GradedQuestion } from "@/types";
import { getQuizById } from "@/lib/store";

interface QuizSummaryProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  canRetry: boolean;
  onRetry: () => void;
  onBackToLesson: () => void;
}

export default function QuizSummary({
  attempt,
  quiz,
  canRetry,
  onRetry,
  onBackToLesson,
}: QuizSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const maxAttempts = quiz.config.maxAttempts;
  const attemptsUsed = attempt.attemptNumber;
  const showResultDetail = quiz.showResultDetail !== false;

  // Get full quiz to access question details
  const fullQuiz = getQuizById(quiz.id) || quiz;

  const getQuestionAnswer = (questionId: string): string | string[] | undefined => {
    return attempt.answers.find(a => a.questionId === questionId)?.value;
  };

  const renderQuestionDetail = (question: Question, graded: GradedQuestion) => {
    const learnerAnswer = getQuestionAnswer(question.id);
    const isCorrect = graded.correct;

    return (
      <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{question.prompt}</h4>
              <span className="text-sm text-gray-600 ml-2">
                {graded.pointsAwarded} / {graded.pointsPossible} pts
              </span>
            </div>

            {/* Question-specific answer display */}
            {question.type === 'multiselect' && (
              <div className="space-y-2 mt-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Your selections:</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(learnerAnswer) 
                      ? learnerAnswer 
                      : learnerAnswer?.split(',').map(id => id.trim()).filter(id => id) || []
                    ).map(optId => {
                      const option = question.options?.find(o => o.id === (typeof optId === 'string' ? optId.trim() : optId));
                      if (!option) return null;
                      const isCorrectOption = option.correct;
                      return (
                        <span
                          key={optId}
                          className={`px-2 py-1 rounded text-sm ${
                            isCorrectOption
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {option.text}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Correct answers:</p>
                  <div className="flex flex-wrap gap-2">
                    {question.options?.filter(o => o.correct).map(option => (
                      <span
                        key={option.id}
                        className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800"
                      >
                        {option.text}
                      </span>
                    ))}
                  </div>
                </div>
                {question.grading?.mode === 'partial' && graded.pointsAwarded < graded.pointsPossible && (
                  <p className="text-sm text-gray-600 mt-2">
                    Partial credit: {Math.round((graded.pointsAwarded / graded.pointsPossible) * 100)}% of points awarded
                  </p>
                )}
              </div>
            )}

            {question.type === 'ordering' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Your order:</p>
                  <ol className="space-y-1">
                    {(Array.isArray(learnerAnswer) 
                      ? learnerAnswer 
                      : learnerAnswer?.split(',').map(id => id.trim()).filter(id => id) || []
                    ).map((optId, idx) => {
                      const trimmedOptId = typeof optId === 'string' ? optId.trim() : optId;
                      const option = question.options?.find(o => o.id === trimmedOptId);
                      if (!option) return null;
                      const correctIndex = question.correctOrder?.indexOf(trimmedOptId) ?? -1;
                      const isCorrectPosition = correctIndex === idx;
                      return (
                        <li
                          key={optId}
                          className={`text-sm flex items-center gap-2 ${
                            isCorrectPosition ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          <span className="font-semibold">{idx + 1}.</span>
                          {option.text}
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Correct order:</p>
                  <ol className="space-y-1">
                    {question.correctOrder?.map((optId, idx) => {
                      const option = question.options?.find(o => o.id === optId);
                      if (!option) return null;
                      return (
                        <li key={optId} className="text-sm flex items-center gap-2 text-blue-700">
                          <span className="font-semibold">{idx + 1}.</span>
                          {option.text}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}

            {question.type === 'numeric' && (
              <div className="mt-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Your answer:</span>{' '}
                  <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                    {learnerAnswer}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Correct:</span>{' '}
                  <span className="text-blue-700">
                    {question.correctNumber}
                    {question.tolerance !== undefined && question.tolerance > 0 && (
                      <span className="text-gray-500"> (±{question.tolerance})</span>
                    )}
                  </span>
                </p>
              </div>
            )}

            {(question.type === 'mcq' || question.type === 'scenario' || question.type === 'true_false' || question.type === 'shorttext') && (
              <div className="mt-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Your answer:</span>{' '}
                  <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                    {question.type === 'true_false' 
                      ? (learnerAnswer === 'true' ? 'True' : 'False')
                      : question.type === 'mcq' || question.type === 'scenario'
                      ? question.options?.find(o => o.id === learnerAnswer)?.text || learnerAnswer
                      : learnerAnswer}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Correct:</span>{' '}
                    <span className="text-blue-700">
                      {question.type === 'true_false'
                        ? (question.answer ? 'True' : 'False')
                        : question.type === 'mcq' || question.type === 'scenario'
                        ? question.options?.find(o => o.correct)?.text || 'N/A'
                        : question.correctAnswerText}
                    </span>
                  </p>
                )}
              </div>
            )}

            {question.explanation && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        {/* Score Display */}
        <div>
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {attempt.scorePct ?? 0}%
          </div>
          <p className="text-lg text-gray-600">You scored {attempt.scorePct ?? 0}%</p>
        </div>

        {/* Pass/Fail Badge */}
        <div className="flex justify-center">
          {attempt.passed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Passed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-full">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Didn't pass</span>
            </div>
          )}
        </div>

        {/* Correct Count */}
        <div className="text-gray-700">
          <p className="text-lg">
            {attempt.correctCount ?? 0} out of {attempt.totalCount ?? 0} correct
          </p>
        </div>

        {/* Attempts Info */}
        {maxAttempts !== undefined && (
          <div className="text-sm text-gray-500">
            <p>Attempt {attemptsUsed} of {maxAttempts}</p>
            {!canRetry && (
              <p className="mt-1 text-red-600 font-medium">
                Maximum attempts reached
              </p>
            )}
          </div>
        )}

        {/* Result Detail Section */}
        {showResultDetail && attempt.breakdown && attempt.breakdown.length > 0 && (
          <div className="mt-8 text-left border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">View Answers</h3>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {showDetails && (
              <div className="space-y-6">
                {attempt.breakdown.map(graded => {
                  const question = fullQuiz.questions.find(q => q.id === graded.questionId);
                  if (!question) return null;
                  return renderQuestionDetail(question, graded);
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {canRetry && (
            <Button
              variant="secondary"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onBackToLesson}
          >
            Back to Lesson
          </Button>
        </div>
      </div>
    </div>
  );
}
