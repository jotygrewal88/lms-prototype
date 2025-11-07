// Phase II 1I.1 & 1I.2: Quiz Tab Component with Full Editor UI + AI Generator
"use client";

import React, { useState } from "react";
import { Plus, Sparkles, Edit2, Trash2, Copy, GripVertical, Eye, Settings, Undo2, Redo2, History } from "lucide-react";
import { Quiz, Lesson, Question, QuestionType } from "@/types";
import { getAttemptsForQuiz, getUsers, getAllQuizAttempts } from "@/lib/store";
import { getFullName } from "@/types";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuizTabProps {
  quiz: Quiz | undefined;
  courseId: string;
  activeLessonId: string | null;
  lessons: Lesson[];
  isManager: boolean;
  quizType: "course" | "lesson";
  selectedLessonIdForQuiz: string | null;
  onQuizTypeChange: (type: "course" | "lesson") => void;
  onSelectLessonForQuiz: (lessonId: string | null) => void;
  onCreateLessonQuiz: () => void;
  onGenerate: () => void;
  onCreateQuestion: () => void;
  onEditQuestion: (question: any) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onDragEnd: (event: any) => void;
  onUpdateConfig: (config: any) => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  genScope: any;
  setGenScope: (scope: any) => void;
  genScopeId: string;
  setGenScopeId: (id: string) => void;
  genCount: number;
  setGenCount: (count: number) => void;
  genTypes: any[];
  setGenTypes: (types: any[]) => void;
  genLanguage: string;
  setGenLanguage: (lang: string) => void;
  genDifficulties: any[];
  setGenDifficulties: (difficulties: any[]) => void;
  replaceExisting: boolean;
  setReplaceExisting: (replace: boolean) => void;
  isGenerating: boolean;
  onOpenAIGenerator: () => void; // Phase II 1I.2: New prop for opening AI modal
}

function SortableQuestionCard({
  question,
  index,
  isManager,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  question: Question;
  index: number;
  isManager: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 p-4 ${
        isDragging ? 'opacity-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      } transition-all`}
    >
      <div className="flex items-start gap-3">
        {!isManager && (
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mt-1"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{index + 1}
            </span>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {question.type.replace('_', ' ')}
            </span>
            {question.meta?.source === 'AI' && (
              <>
                <Badge variant="info" className="text-xs">
                  AI Generated
                </Badge>
                {question.meta?.confidenceScore && (
                  <Badge variant="info" className="text-xs">
                    Confidence: {(question.meta.confidenceScore * 100).toFixed(0)}%
                  </Badge>
                )}
              </>
            )}
            {question.meta?.difficulty && (
              <Badge variant="default" className="text-xs capitalize">
                {question.meta.difficulty}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {question.prompt}
          </p>
          {question.options && question.options.length > 0 && (
            <div className="text-xs text-gray-600 space-y-1">
              {question.options.slice(0, 2).map((opt, idx) => (
                <div key={opt.id}>
                  {opt.correct ? '✓' : '○'} {opt.text}
                </div>
              ))}
              {question.options.length > 2 && (
                <div className="text-gray-400">+{question.options.length - 2} more...</div>
              )}
            </div>
          )}
        </div>
        {!isManager && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Edit question"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Duplicate question"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              title="Delete question"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizTab(props: QuizTabProps) {
  const {
    quiz,
    courseId,
    activeLessonId,
    lessons,
    isManager,
    onCreateQuestion,
    onEditQuestion,
    onDeleteQuestion,
    onDuplicateQuestion,
    onDragEnd,
    onPreview,
    onUndo,
    onRedo,
    onHistory,
    canUndo,
    canRedo,
    onOpenAIGenerator,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get all attempts for this quiz
  const allUsers = getUsers();
  const allAttempts = getAllQuizAttempts();
  const attemptsByUser: Record<string, Array<{ attempt: any; user: any }>> = {};
  
  allAttempts
    .filter(attempt => attempt.quizId === quiz?.id)
    .forEach(attempt => {
      const user = allUsers.find(u => u.id === attempt.userId);
      if (user) {
        if (!attemptsByUser[attempt.userId]) {
          attemptsByUser[attempt.userId] = [];
        }
        attemptsByUser[attempt.userId].push({ attempt, user });
      }
    });

  // Calculate stats for each user
  const userStats = Object.entries(attemptsByUser).map(([userId, attempts]) => {
    const submittedAttempts = attempts.filter(a => a.attempt.submittedAt);
    const lastAttempt = submittedAttempts.length > 0 
      ? submittedAttempts.sort((a, b) => 
          new Date(b.attempt.submittedAt || 0).getTime() - new Date(a.attempt.submittedAt || 0).getTime()
        )[0]
      : null;
    
    return {
      user: attempts[0].user,
      attemptCount: submittedAttempts.length,
      lastScore: lastAttempt?.attempt.scorePct,
      lastAttemptDate: lastAttempt?.attempt.submittedAt,
      passed: lastAttempt?.attempt.passed,
    };
  });

  if (!quiz) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="text-center py-12 bg-white rounded-xl shadow-md border-2 border-gray-100">
          <p className="text-gray-500 mb-4">No quiz available for this course.</p>
          {!isManager && (
            <div className="flex gap-3 justify-center">
              <Button onClick={onCreateQuestion} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Quiz Editor Section */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-900">Quiz Questions</h3>
              <Badge variant="default" className="ml-2">
                {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              </Badge>
            </div>
            {!isManager && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={onUndo}
                  disabled={!canUndo}
                  variant="secondary"
                  className="px-2 py-1 text-sm"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onRedo}
                  disabled={!canRedo}
                  variant="secondary"
                  className="px-2 py-1 text-sm"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onHistory}
                  variant="secondary"
                  className="px-2 py-1 text-sm"
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
                <Button
                  onClick={onPreview}
                  variant="secondary"
                  className="px-2 py-1 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {/* Action Buttons */}
          {!isManager && (
            <div className="flex gap-3 mb-6">
              <Button onClick={onCreateQuestion} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button onClick={onOpenAIGenerator} variant="secondary">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-4">No questions yet</p>
              {!isManager && (
                <p className="text-sm text-gray-400">
                  Click "Add Question" or "Generate with AI" to get started
                </p>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
                disabled={isManager}
              >
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <SortableQuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      isManager={isManager}
                      onEdit={() => onEditQuestion(question)}
                      onDelete={() => onDeleteQuestion(question.id)}
                      onDuplicate={() => onDuplicateQuestion(question)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Attempts Table Section */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-900">Quiz Attempts</h3>
          </div>
        </div>
        <div className="p-6">
          {userStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attempts recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Learner</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Attempts</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Attempt</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((stat) => (
                    <tr key={stat.user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {getFullName(stat.user)}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {stat.attemptCount}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {stat.lastScore !== undefined ? `${stat.lastScore}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {stat.lastAttemptDate
                          ? new Date(stat.lastAttemptDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {stat.passed !== undefined && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stat.passed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {stat.passed ? 'Passed' : 'Failed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
