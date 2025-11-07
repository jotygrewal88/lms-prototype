// Phase II 1I.1: Quiz Player Component with State Machine
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, RotateCcw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/Button";
import { Quiz, QuizAttempt, Question } from "@/types";
import {
  startQuizAttempt,
  submitQuizAttempt,
  getAttemptsForQuiz,
  getLastPassedAttempt,
  canStartAttempt,
  getActiveAttempt,
  getQuizById,
  getQuizPolicy,
} from "@/lib/store";
import QuestionRenderer from "./QuestionRenderer";
import { isValidAnswer } from "./QuizQuestion";

interface QuizCardProps {
  quiz: Quiz;
  courseId: string;
  lessonId: string;
  userId: string;
  onComplete?: () => void;
}

type QuizState = 'idle' | 'inProgress' | 'submitted' | 'review';

export default function QuizCard({
  quiz,
  courseId,
  lessonId,
  userId,
  onComplete,
}: QuizCardProps) {
  const router = useRouter();
  const [state, setState] = useState<QuizState>('idle');
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<string, Question["options"]>>({});
  const [showReview, setShowReview] = useState(false);
  const [gradingDetails, setGradingDetails] = useState<Array<{ questionId: string; correct: boolean; correctAnswer?: any }>>([]);

  // Get policy (with backward compatibility)
  const policy = useMemo(() => {
    const fullQuiz = getQuizById(quiz.id) || quiz;
    return getQuizPolicy(fullQuiz);
  }, [quiz]);

  // Load active attempt on mount
  useEffect(() => {
    const active = getActiveAttempt(userId, quiz.id);
    if (active) {
      setActiveAttempt(active);
      // Load existing answers
      const answerMap: Record<string, string | string[]> = {};
      active.answers.forEach(answer => {
        answerMap[answer.questionId] = answer.value;
      });
      setAnswers(answerMap);
      setState('inProgress');
    }
  }, [userId, quiz.id]);

  // Shuffle questions and options if needed
  useEffect(() => {
    if (state === 'inProgress' && quiz.questions.length > 0) {
      let questionsToShow = [...quiz.questions];
      
      // Shuffle questions if policy allows
      if (policy.shuffleQuestions) {
        questionsToShow = [...questionsToShow].sort(() => Math.random() - 0.5);
      }
      setShuffledQuestions(questionsToShow);

      // Shuffle options for each question if policy allows
      if (policy.shuffleOptions) {
        const optionsMap: Record<string, Question["options"]> = {};
        questionsToShow.forEach(question => {
          if (question.options && question.options.length > 0) {
            optionsMap[question.id] = [...question.options].sort(() => Math.random() - 0.5);
          }
        });
        setShuffledOptionsMap(optionsMap);
      }
    }
  }, [state, quiz.questions, policy.shuffleQuestions, policy.shuffleOptions]);

  const handleStartAttempt = () => {
    try {
      const attempt = startQuizAttempt({
        quizId: quiz.id,
        courseId,
        lessonId,
        userId,
      });
      setActiveAttempt(attempt);
      setAnswers({});
      setSubmittedAttempt(null);
      setState('inProgress');
    } catch (error: any) {
      alert(error.message || 'Failed to start attempt');
    }
  };

  const handleDiscardAndRestart = () => {
    if (confirm('Are you sure you want to discard your current attempt and start over?')) {
      // Remove the active attempt from store (we'll need to add a delete function, but for now just clear local state)
      setActiveAttempt(null);
      setAnswers({});
      handleStartAttempt();
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    if (!activeAttempt) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!activeAttempt) return;

    // Validate all required questions answered
    const requiredQuestions = shuffledQuestions.length > 0 
      ? shuffledQuestions.filter(q => q.required !== false)
      : quiz.questions.filter(q => q.required !== false);
    
    const answeredRequiredCount = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return answer && isValidAnswer(
        Array.isArray(answer) ? answer.join(',') : answer,
        q
      );
    }).length;

    if (answeredRequiredCount !== requiredQuestions.length) {
      return; // Submit button should be disabled anyway
    }

    try {
      // Convert answers to array format
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: Array.isArray(value) ? value : value,
      }));

      // Submit attempt
      const { gradeQuiz } = require('@/lib/store');
      const gradingResult = gradeQuiz(quiz.id, answersArray);
      setGradingDetails(gradingResult.details);

      const submitted = submitQuizAttempt(activeAttempt.id, answersArray);
      setSubmittedAttempt(submitted);
      setActiveAttempt(null);
      setState('submitted');

      // Trigger completion callback if passed and policy requires it
      if (submitted.passed && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit quiz');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setActiveAttempt(null);
    setSubmittedAttempt(null);
    setAnswers({});
    setShowReview(false);
    setGradingDetails([]);
  };

  const handleBackToLesson = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Check if user can start attempt
  const canStart = canStartAttempt(quiz.id, userId, policy);
  const attemptsUsed = canStart.attemptsUsed;

  // Calculate progress
  const requiredQuestions = shuffledQuestions.length > 0 
    ? shuffledQuestions.filter(q => q.required !== false)
    : quiz.questions.filter(q => q.required !== false);
  
  const answeredCount = requiredQuestions.filter(q => {
    const answer = answers[q.id];
    return answer && isValidAnswer(
      Array.isArray(answer) ? answer.join(',') : answer,
      q
    );
  }).length;

  const canSubmit = activeAttempt && 
    requiredQuestions.length > 0 && 
    answeredCount === requiredQuestions.length;

  // Get questions to display (use shuffled if available)
  const questionsToDisplay = shuffledQuestions.length > 0 ? shuffledQuestions : quiz.questions;

  // IDLE STATE
  if (state === 'idle') {
    // Only show max attempts message if maxAttempts is defined and that's the reason
    if (!canStart.canStart && policy.maxAttempts !== undefined && canStart.reason === 'Maximum attempts reached') {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Maximum attempts reached
            </h3>
          </div>
          <p className="text-gray-700">
            {canStart.reason || 'You have reached the maximum number of attempts for this quiz. You cannot retake this quiz.'}
          </p>
        </div>
      );
    }

    // Check if quiz is locked after pass
    const lastPassed = getLastPassedAttempt(quiz.id, userId);
    if (policy.lockOnPass && lastPassed) {
      return (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz Passed
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            You have successfully passed this quiz. The quiz is now locked.
          </p>
          {onComplete && (
            <Button variant="primary" onClick={onComplete}>
              Continue
            </Button>
          )}
        </div>
      );
    }

    // Show start attempt screen
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
          
          {/* Policy Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Quiz Information</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Passing score: {policy.passingScorePct}%</li>
              <li>Questions: {quiz.questions.length}</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              variant="primary"
              onClick={handleStartAttempt}
              className="flex items-center gap-2 mx-auto"
            >
              <CheckCircle2 className="w-5 h-5" />
              Start Attempt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // IN PROGRESS STATE
  if (state === 'inProgress' && activeAttempt) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
        </div>

        {/* Questions */}
        <div className="space-y-8 mb-8">
          {questionsToDisplay.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No questions available for this quiz.</p>
            </div>
          ) : (
            questionsToDisplay.map((question, index) => {
              const shuffledOptions = shuffledOptionsMap[question.id];
              return (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <QuestionRenderer
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        shuffledOptions={shuffledOptions}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {answeredCount} of {requiredQuestions.length} required questions answered
            {questionsToDisplay.length > requiredQuestions.length && (
              <span className="text-gray-400 ml-1">
                ({questionsToDisplay.length - requiredQuestions.length} optional)
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

  // SUBMITTED STATE
  if (state === 'submitted' && submittedAttempt) {
    const showDetails = policy.showFeedback === 'immediate' || (policy.showFeedback === 'end' && showReview);

    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-8 max-w-4xl mx-auto">
        <div className="text-center space-y-6">
          {/* Score Display */}
          <div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {submittedAttempt.scorePct ?? 0}%
            </div>
            <p className="text-lg text-gray-600">You scored {submittedAttempt.scorePct ?? 0}%</p>
          </div>

          {/* Pass/Fail Badge */}
          <div className="flex justify-center">
            {submittedAttempt.passed ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Passed</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-full">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Didn't pass</span>
              </div>
            )}
          </div>


          {/* Feedback based on policy */}
          {policy.showFeedback === 'end' && !showReview && (
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowReview(true)}
                className="flex items-center gap-2"
              >
                Review Answers
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Detailed Feedback */}
          {showDetails && gradingDetails.length > 0 && (
            <div className="mt-8 text-left border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Answers</h3>
              <div className="space-y-6">
                {questionsToDisplay.map((question, index) => {
                  const detail = gradingDetails.find(d => d.questionId === question.id);
                  if (!detail) return null;

                  const answer = answers[question.id];
                  const shuffledOptions = shuffledOptionsMap[question.id];
                  
                  return (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          detail.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {detail.correct ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <QuestionRenderer
                            question={question}
                            value={answer}
                            onChange={() => {}}
                            disabled={true}
                            showFeedback={true}
                            isCorrect={detail.correct}
                            correctAnswer={detail.correctAnswer}
                            shuffledOptions={shuffledOptions}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {!submittedAttempt.passed && canStart.canStart && (
              <Button
                variant="secondary"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
            )}
            {submittedAttempt.passed && policy.lockOnPass ? (
              onComplete && (
                <Button variant="primary" onClick={onComplete}>
                  Continue
                </Button>
              )
            ) : (
              <Button variant="primary" onClick={handleBackToLesson}>
                Back to Lesson
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

