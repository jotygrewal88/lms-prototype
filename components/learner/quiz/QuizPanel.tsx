// Phase II 1H.2a: Quiz Panel Component (Updated for 1H.2b)
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import Button from "@/components/Button";
import QuizQuestion, { isValidAnswer } from "./QuizQuestion";
import QuizSummary from "./QuizSummary";
import { Quiz, QuizAttempt } from "@/types";
import {
  getActiveAttempt,
  createQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  canStartNewAttempt,
  markLessonCompleteByQuizPass,
  tryCompleteCourse,
  getCourseById,
} from "@/lib/store";

interface QuizPanelProps {
  quiz: Quiz;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function QuizPanel({
  quiz,
  courseId,
  lessonId,
  userId,
}: QuizPanelProps) {
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  // Load active attempt on mount
  useEffect(() => {
    const attempt = getActiveAttempt(userId, quiz.id);
    if (attempt) {
      setActiveAttempt(attempt);
      // Load existing answers
      const answerMap: Record<string, string | string[]> = {};
      attempt.answers.forEach(answer => {
        answerMap[answer.questionId] = answer.value;
      });
      setAnswers(answerMap);
    }
  }, [userId, quiz.id]);

  const handleStartAttempt = () => {
    const attempt = createQuizAttempt({
      quizId: quiz.id,
      courseId,
      lessonId,
      userId,
    });
    setActiveAttempt(attempt);
    setAnswers({});
    setSubmittedAttempt(null);
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    if (!activeAttempt) return;

    // Update local state
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Save to store
    saveQuizAnswer(activeAttempt.id, questionId, value);
  };

  const handleSubmit = () => {
    if (!activeAttempt) return;

    // Validate all questions answered
    if (quiz.questions.length !== Object.keys(answers).length) {
      return; // Submit button should be disabled anyway
    }

    try {
      // Convert answers object to array format
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      const submitted = submitQuizAttempt(activeAttempt.id, answersArray);
      setSubmittedAttempt(submitted);
      setActiveAttempt(null);

      // Phase II 1H.2d: Check if quiz pass should complete lesson
      if (submitted.passed && submitted.lessonId) {
        const course = getCourseById(courseId);
        if (course?.policy?.requireQuizPassToCompleteLesson) {
          markLessonCompleteByQuizPass({
            courseId,
            lessonId: submitted.lessonId,
            userId,
            quizAttemptId: submitted.id,
          });
          
          // Try to complete course
          tryCompleteCourse({ courseId, userId });
          
          // Show toasts (using browser alert for MVP, can be replaced with toast system)
          setTimeout(() => {
            alert("Lesson completed!");
          }, 500);
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const handleRetry = () => {
    setActiveAttempt(null);
    setSubmittedAttempt(null);
    setAnswers({});
    handleStartAttempt();
  };

  const handleBackToLesson = () => {
    // This will be handled by parent component
    // For now, just clear the submitted state
    setSubmittedAttempt(null);
  };

  // Check if submit button should be enabled
  // Phase II 1H.2b: Check all required questions have valid answers
  const requiredQuestions = quiz.questions.filter(q => q.required !== false);
  const answeredRequiredCount = requiredQuestions.filter(q => {
    const answer = answers[q.id];
    return answer && isValidAnswer(
      Array.isArray(answer) ? answer.join(',') : answer,
      q
    );
  }).length;
  
  const canSubmit = activeAttempt && 
    quiz.questions.length > 0 && 
    answeredRequiredCount === requiredQuestions.length;

  // Count answered questions (for display)
  const answeredCount = quiz.questions.filter(q => {
    const answer = answers[q.id];
    return answer && isValidAnswer(
      Array.isArray(answer) ? answer.join(',') : answer,
      q
    );
  }).length;
  const totalRequired = requiredQuestions.length;

  // Check if user can start new attempt
  const canRetry = canStartNewAttempt(userId, quiz.id);

  // Show submitted summary
  if (submittedAttempt) {
    return (
      <QuizSummary
        attempt={submittedAttempt}
        quiz={quiz}
        canRetry={canRetry}
        onRetry={handleRetry}
        onBackToLesson={handleBackToLesson}
      />
    );
  }

  // Show max attempts message
  if (!activeAttempt && !canRetry) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Maximum attempts reached
          </h3>
        </div>
        <p className="text-gray-700">
          You have reached the maximum number of attempts for this quiz. You cannot retake this quiz.
        </p>
      </div>
    );
  }

  // Show start attempt button
  if (!activeAttempt) {
    const maxAttempts = quiz.config.maxAttempts;
    const attemptText = maxAttempts 
      ? `Attempt 1 of ${maxAttempts}`
      : "Attempt 1";

    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
          <div className="pt-4">
            <Button
              variant="primary"
              onClick={handleStartAttempt}
              className="flex items-center gap-2 mx-auto"
            >
              <CheckCircle2 className="w-5 h-5" />
              Start Attempt
            </Button>
            {maxAttempts && (
              <p className="text-sm text-gray-500 mt-3">
                {attemptText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show quiz questions
  const attemptNumber = activeAttempt.attemptNumber;
  const maxAttempts = quiz.config.maxAttempts;
  const attemptText = maxAttempts 
    ? `Attempt ${attemptNumber} of ${maxAttempts}`
    : `Attempt ${attemptNumber}`;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
        <p className="text-sm text-gray-600">{attemptText}</p>
      </div>

      {/* Questions */}
      <div className="space-y-8 mb-8">
        {quiz.questions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No questions available for this quiz.</p>
          </div>
        ) : (
          quiz.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <QuizQuestion
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {answeredCount} of {totalRequired} required questions answered
          {quiz.questions.length > totalRequired && (
            <span className="text-gray-400 ml-1">
              ({quiz.questions.length - totalRequired} optional)
            </span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}

