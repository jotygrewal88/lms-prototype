// Epic 1G.6: Preview Quiz Modal
"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Quiz, Question } from "@/types";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

interface PreviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

export default function PreviewQuizModal({
  isOpen,
  onClose,
  quiz,
}: PreviewQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && quiz) {
      setCurrentIndex(0);
      setAnswers({});
      setShowResults(false);
      setCheckedAnswers({});
    }
  }, [isOpen, quiz]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  
  // Apply shuffles if enabled
  const displayQuestions = quiz.config.shuffleQuestions
    ? [...questions].sort(() => Math.random() - 0.5)
    : questions;

  const currentQuestion = displayQuestions[currentIndex];
  const isLastQuestion = currentIndex === displayQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleAnswerChange = (value: any) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score
      const correct = displayQuestions.reduce((acc, q, idx) => {
        const userAnswer = answers[idx];
        let isCorrect = false;

        if (q.type === "true_false") {
          isCorrect = userAnswer === q.answer;
        } else if (q.type === "mcq" || q.type === "scenario") {
          const correctOption = q.options?.find(opt => opt.correct);
          isCorrect = userAnswer === correctOption?.id;
        }

        return acc + (isCorrect ? 1 : 0);
      }, 0);

      setShowResults(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    const userAnswer = answers[currentIndex];

    if (currentQuestion.type === "true_false") {
      isCorrect = userAnswer === currentQuestion.answer;
    } else if (currentQuestion.type === "mcq" || currentQuestion.type === "scenario") {
      const correctOption = currentQuestion.options?.find(opt => opt.correct);
      isCorrect = userAnswer === correctOption?.id;
    }

    setCheckedAnswers({ ...checkedAnswers, [currentIndex]: isCorrect });
  };

  const calculateScore = () => {
    const correct = displayQuestions.reduce((acc, q, idx) => {
      const userAnswer = answers[idx];
      let isCorrect = false;

      if (q.type === "true_false") {
        isCorrect = userAnswer === q.answer;
      } else if (q.type === "mcq" || q.type === "scenario") {
        const correctOption = q.options?.find(opt => opt.correct);
        isCorrect = userAnswer === correctOption?.id;
      }

      return acc + (isCorrect ? 1 : 0);
    }, 0);

    const percentage = Math.round((correct / displayQuestions.length) * 100);
    return { correct, total: displayQuestions.length, percentage };
  };

  const score = calculateScore();
  const passed = score.percentage >= quiz.config.passingScore;

  // Shuffle options if enabled
  const getShuffledOptions = (question: Question) => {
    if (!question.options) return [];
    if (quiz.config.shuffleOptions) {
      return [...question.options].sort(() => Math.random() - 0.5);
    }
    return question.options;
  };

  if (showResults) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className="p-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}>
              {passed ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? "Quiz Passed!" : "Quiz Not Passed"}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your score: {score.correct} out of {score.total} ({score.percentage}%)
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Passing score: {quiz.config.passingScore}%
            </p>

            {/* Question Review */}
            <div className="mt-8 space-y-4 text-left max-h-96 overflow-y-auto">
              {displayQuestions.map((q, idx) => {
                const userAnswer = answers[idx];
                let isCorrect = false;
                let correctAnswer: any = null;

                if (q.type === "true_false") {
                  isCorrect = userAnswer === q.answer;
                  correctAnswer = q.answer ? "True" : "False";
                } else if (q.type === "mcq" || q.type === "scenario") {
                  const correctOption = q.options?.find(opt => opt.correct);
                  isCorrect = userAnswer === correctOption?.id;
                  correctAnswer = correctOption?.text;
                }

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{q.prompt}</p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 mt-1">
                            Correct answer: {correctAnswer}
                          </p>
                        )}
                        {q.meta?.rationale && quiz.config.showRationales && (
                          <p className="text-sm text-blue-700 mt-2">
                            <strong>Rationale:</strong> {q.meta.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button onClick={onClose} variant="primary" className="px-8">
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Preview Quiz: {quiz.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentQuestion && (
          <>
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentIndex + 1} of {displayQuestions.length}</span>
                <span>{Math.round(((currentIndex + 1) / displayQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / displayQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.type === "mcq"
                    ? "bg-indigo-100 text-indigo-700"
                    : currentQuestion.type === "true_false"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {currentQuestion.type === "mcq"
                    ? "Multiple Choice"
                    : currentQuestion.type === "true_false"
                    ? "True/False"
                    : "Scenario"}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.prompt}
              </h3>

              {/* Answer Options */}
              {currentQuestion.type === "true_false" ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAnswerChange(true)}
                    className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                      answers[currentIndex] === true
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentIndex] === true
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300"
                      }`}>
                        {answers[currentIndex] === true && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">True</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAnswerChange(false)}
                    className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                      answers[currentIndex] === false
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentIndex] === false
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300"
                      }`}>
                        {answers[currentIndex] === false && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">False</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getShuffledOptions(currentQuestion).map((option, idx) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerChange(option.id)}
                      className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                        answers[currentIndex] === option.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentIndex] === option.id
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300"
                        }`}>
                          {answers[currentIndex] === option.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Check Answer Button */}
              {quiz.config.showRationales && answers[currentIndex] !== undefined && (
                <div className="mt-6">
                  {checkedAnswers[currentIndex] !== undefined ? (
                    <div className={`p-4 rounded-lg ${
                      checkedAnswers[currentIndex]
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}>
                      <div className="flex items-start gap-2">
                        {checkedAnswers[currentIndex] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            checkedAnswers[currentIndex] ? "text-green-900" : "text-red-900"
                          }`}>
                            {checkedAnswers[currentIndex] ? "Correct!" : "Incorrect"}
                          </p>
                          {currentQuestion.meta?.rationale && (
                            <p className="text-sm text-gray-700 mt-1">
                              {currentQuestion.meta.rationale}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleCheckAnswer} variant="secondary" className="w-full">
                      Check Answer
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                variant="secondary"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={answers[currentIndex] === undefined}
                variant="primary"
              >
                {isLastQuestion ? "Finish" : "Next"}
                {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}




