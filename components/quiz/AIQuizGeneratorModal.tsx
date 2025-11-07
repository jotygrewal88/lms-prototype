// Phase II 1I.2: AI Quiz Generator Modal
"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Upload, FileText, Loader2, RotateCcw, Check, X } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { Question, QuestionType } from "@/types";
import { generateQuizFromContext, QuizGenerationContext, AIQuestion } from "@/lib/ai";
import { extractTextFromPDF } from "@/lib/pdfExtractor";
import { getResourcesByLessonId, getLessonsByCourseId, getCourseById, getResourceById } from "@/lib/store";
import Toast from "@/components/Toast";

interface AIQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  lessonId?: string | null;
  onQuestionsGenerated: (questions: Question[]) => void;
  onError?: (message: string) => void;
}

type SourceType = 'lesson' | 'course' | 'file' | 'manual';

export default function AIQuizGeneratorModal({
  isOpen,
  onClose,
  courseId,
  lessonId,
  onQuestionsGenerated,
  onError,
}: AIQuizGeneratorModalProps) {
  const [sourceType, setSourceType] = useState<SourceType>('lesson');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [customCount, setCustomCount] = useState<string>("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'true_false']);
  const [bloomsLevel, setBloomsLevel] = useState<'knowledge' | 'comprehension' | 'application' | 'analysis' | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSourceType('lesson');
      setUploadedFile(null);
      setManualText("");
      setDifficulty(2);
      setQuestionCount(10);
      setCustomCount("");
      setQuestionTypes(['mcq', 'true_false']);
      setBloomsLevel('');
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());
    }
  }, [isOpen]);

  // Extract context based on source type
  const extractContext = async (): Promise<string> => {
    let context = "";

    switch (sourceType) {
      case 'lesson':
        if (!lessonId) {
          throw new Error('No lesson selected');
        }
        const resources = getResourcesByLessonId(lessonId);
        resources.forEach((r) => {
          if (r.content) context += `${r.content}\n`;
          if (r.title) context += `${r.title}\n`;
        });
        break;

      case 'course':
        const course = getCourseById(courseId);
        if (course) {
          context += `${course.title}\n${course.description || ''}\n`;
          const lessons = getLessonsByCourseId(courseId);
          lessons.forEach((lesson) => {
            context += `${lesson.title}\n`;
            const lessonResources = getResourcesByLessonId(lesson.id);
            lessonResources.forEach((r) => {
              if (r.content) context += `${r.content}\n`;
            });
          });
        }
        break;

      case 'file':
        if (!uploadedFile) {
          throw new Error('Please upload a PDF file');
        }
        context = await extractTextFromPDF(uploadedFile);
        break;

      case 'manual':
        if (!manualText.trim()) {
          throw new Error('Please paste some text content');
        }
        context = manualText;
        break;
    }

    if (!context.trim()) {
      throw new Error('No source material found. Please provide content.');
    }

    return context;
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());

      const contextText = await extractContext();
      
      const generationContext: QuizGenerationContext = {
        lessonText: sourceType === 'lesson' || sourceType === 'course' ? contextText : undefined,
        pdfText: sourceType === 'file' ? contextText : undefined,
        difficulty: difficulty === 1 ? 'beginner' : difficulty === 2 ? 'intermediate' : 'advanced',
        questionCount,
        questionTypes,
        bloomsLevel: bloomsLevel || undefined,
      };

      const questions = await generateQuizFromContext(generationContext);
      setGeneratedQuestions(questions);
      // Select all questions by default
      setSelectedQuestions(new Set(questions.map(q => q.id)));
      setToastMessage(`Generated ${questions.length} questions successfully!`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate questions';
      setToastError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    // Regenerate using same parameters
    await handleGenerate();
  };

  const handleAcceptAll = () => {
    if (generatedQuestions.length === 0) return;
    onQuestionsGenerated(generatedQuestions);
    setToastMessage(`Added ${generatedQuestions.length} questions to quiz`);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleAddSelected = () => {
    if (selectedQuestions.size === 0) {
      setToastError('Please select at least one question');
      return;
    }
    const selected = generatedQuestions.filter(q => selectedQuestions.has(q.id));
    onQuestionsGenerated(selected);
    setToastMessage(`Added ${selected.length} question(s) to quiz`);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setToastError('Please upload a PDF file');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleQuestionCountChange = (value: number | 'custom') => {
    if (value === 'custom') {
      setQuestionCount(parseInt(customCount) || 10);
    } else {
      setQuestionCount(value);
    }
  };

  const handleCustomCountChange = (value: string) => {
    setCustomCount(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setQuestionCount(num);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    setQuestionTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const canGenerate = () => {
    if (sourceType === 'file' && !uploadedFile) return false;
    if (sourceType === 'manual' && !manualText.trim()) return false;
    if (sourceType === 'lesson' && !lessonId) return false;
    if (questionTypes.length === 0) return false;
    return true;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="AI Quiz Generator" size="large">
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Inputs Section */}
          <div className="space-y-6 mb-6">
            {/* Source Material Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Material
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType('lesson')}
                  disabled={!lessonId}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    sourceType === 'lesson'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!lessonId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">This Lesson Only</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('course')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    sourceType === 'course'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Entire Course</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    sourceType === 'file'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Uploaded File</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('manual')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    sourceType === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Manual Paste</div>
                </button>
              </div>

              {/* File Upload Input */}
              {sourceType === 'file' && (
                <div className="mt-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadedFile && (
                    <p className="mt-1 text-sm text-gray-600">Selected: {uploadedFile.name}</p>
                  )}
                </div>
              )}

              {/* Manual Paste Textarea */}
              {sourceType === 'manual' && (
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste your content here..."
                  rows={6}
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Difficulty Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty: {difficulty === 1 ? 'Beginner' : difficulty === 2 ? 'Intermediate' : 'Advanced'}
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value) as 1 | 2 | 3)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Count
              </label>
              <div className="flex gap-3 items-center">
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleQuestionCountChange(count)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      questionCount === count && customCount === ''
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customCount}
                  onChange={(e) => {
                    setCustomCount(e.target.value);
                    handleCustomCountChange(e.target.value);
                  }}
                  placeholder="Custom"
                  className="w-24 px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Question Type Mix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Types
              </label>
              <div className="flex flex-wrap gap-2">
                {(['mcq', 'multiselect', 'true_false', 'shorttext'] as QuestionType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: questionTypes.includes(type) ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: questionTypes.includes(type) ? '#eff6ff' : 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={questionTypes.includes(type)}
                      onChange={() => toggleQuestionType(type)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bloom's Level (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bloom's Level <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <select
                value={bloomsLevel}
                onChange={(e) => setBloomsLevel(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="knowledge">Knowledge</option>
                <option value="comprehension">Comprehension</option>
                <option value="application">Application</option>
                <option value="analysis">Analysis</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate() || isGenerating}
              variant="primary"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>

          {/* Output Area */}
          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
              <p className="text-gray-600">Generating questions from {sourceType === 'file' ? 'uploaded file' : sourceType === 'manual' ? 'pasted text' : sourceType === 'lesson' ? 'lesson content' : 'course content'}...</p>
            </div>
          )}

          {!isGenerating && generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Generated Questions ({generatedQuestions.length})
                </h4>
                <Button
                  onClick={handleRegenerate}
                  variant="secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="border-2 rounded-lg p-4"
                    style={{
                      borderColor: selectedQuestions.has(question.id) ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: selectedQuestions.has(question.id) ? '#eff6ff' : 'white',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {question.type.replace('_', ' ')}
                          </span>
                          {question.meta?.confidenceScore && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              AI Confidence: {(question.meta.confidenceScore * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">{question.prompt}</p>
                        
                        {question.options && (
                          <div className="space-y-1 mb-2">
                            {question.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`text-sm ${
                                  opt.correct ? 'text-green-700 font-medium' : 'text-gray-600'
                                }`}
                              >
                                {opt.correct ? '✓ ' : '○ '}
                                {opt.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <p className="text-sm font-medium text-green-700 mb-2">
                            Correct Answer: {question.answer ? 'True' : 'False'}
                          </p>
                        )}

                        {question.type === 'shorttext' && question.correctAnswerText && (
                          <p className="text-sm font-medium text-green-700 mb-2">
                            Correct Answer: {question.correctAnswerText}
                          </p>
                        )}

                        {question.explanation && (
                          <p className="text-xs text-gray-600 italic mt-2">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleAcceptAll}
                  variant="primary"
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept All
                </Button>
                <Button
                  onClick={handleAddSelected}
                  variant="secondary"
                  className="flex-1"
                  disabled={selectedQuestions.size === 0}
                >
                  Add Selected ({selectedQuestions.size})
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {toastError && (
        <Toast
          message={toastError}
          type="error"
          onClose={() => setToastError(null)}
        />
      )}
    </>
  );
}


