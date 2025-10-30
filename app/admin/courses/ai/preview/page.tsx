"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Check, FileText, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Button from "@/components/Button";
import Card from "@/components/Card";
import AIInsightPanel from "@/components/AIInsightPanel";
import SectionActions from "@/components/SectionActions";
import { AICourseDraft, AIPreviewInsights, PreviewSection } from "@/types";
import { createCourseFromAIDraft, getCurrentUser } from "@/lib/store";
import { regenerateSection, simplifySection, expandSection } from "@/lib/ai/transformSection";

export default function AIPreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<AICourseDraft | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedLessons, setEditedLessons] = useState<AICourseDraft['lessons']>([]);
  const [insights, setInsights] = useState<AIPreviewInsights | null>(null);
  
  // UI state
  const [expandedLessons, setExpandedLessons] = useState<number[]>([]); // Will be set after lessons load
  const [sectionHistories, setSectionHistories] = useState<Map<string, string[]>>(new Map());
  const [toast, setToast] = useState<{message: string; type: 'success'|'info'} | null>(null);
  const [undoTimers, setUndoTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Load draft from sessionStorage
    const stored = sessionStorage.getItem('aiCourseDraft');
    
    if (stored) {
      try {
        const parsed: AICourseDraft = JSON.parse(stored);
        setDraft(parsed);
        setEditedTitle(parsed.title);
        setEditedDescription(parsed.description);
        setEditedLessons(parsed.lessons);
        
        // Expand all lessons by default
        setExpandedLessons(parsed.lessons.map((_, idx) => idx));
        
        // Extract insights
        if (parsed.previewInsights) {
          setInsights(parsed.previewInsights);
        }
      } catch (error) {
        console.error('Failed to parse draft:', error);
        router.push('/admin/courses');
      }
    } else {
      // No draft found, redirect back
      router.push('/admin/courses');
    }
  }, [router]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      undoTimers.forEach(timer => clearTimeout(timer));
    };
  }, [undoTimers]);

  const showToast = (message: string, type: 'success'|'info' = 'success') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  const toggleLesson = (index: number) => {
    setExpandedLessons(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getSectionKey = (lessonIndex: number, sectionIndex: number) => {
    return `${lessonIndex}-${sectionIndex}`;
  };

  const updateSectionContent = (lessonIndex: number, sectionIndex: number, newContent: string) => {
    const updated = [...editedLessons];
    updated[lessonIndex].sections[sectionIndex] = {
      ...updated[lessonIndex].sections[sectionIndex],
      content: newContent,
    };
    setEditedLessons(updated);
  };

  const saveToHistory = (lessonIndex: number, sectionIndex: number, content: string) => {
    const key = getSectionKey(lessonIndex, sectionIndex);
    const newHistories = new Map(sectionHistories);
    const history = newHistories.get(key) || [];
    history.push(content);
    newHistories.set(key, history);
    setSectionHistories(newHistories);

    // Set timer to clear undo after 15 seconds
    const existingTimer = undoTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const newTimer = setTimeout(() => {
      const currentHistories = new Map(sectionHistories);
      currentHistories.delete(key);
      setSectionHistories(currentHistories);
      
      const currentTimers = new Map(undoTimers);
      currentTimers.delete(key);
      setUndoTimers(currentTimers);
    }, 15000);

    const newTimers = new Map(undoTimers);
    newTimers.set(key, newTimer);
    setUndoTimers(newTimers);
  };

  const handleUndo = (lessonIndex: number, sectionIndex: number) => {
    const key = getSectionKey(lessonIndex, sectionIndex);
    const history = sectionHistories.get(key);
    
    if (history && history.length > 0) {
      const previousContent = history[history.length - 1];
      updateSectionContent(lessonIndex, sectionIndex, previousContent);
      
      // Remove from history
      const newHistories = new Map(sectionHistories);
      const newHistory = [...history];
      newHistory.pop();
      
      if (newHistory.length === 0) {
        newHistories.delete(key);
      } else {
        newHistories.set(key, newHistory);
      }
      setSectionHistories(newHistories);
      
      showToast('Changes undone', 'info');
    }
  };

  const handleSectionTransform = async (
    lessonIndex: number,
    sectionIndex: number,
    transformFn: (text: string, context?: any) => Promise<string>,
    actionName: string
  ) => {
    const currentContent = editedLessons[lessonIndex].sections[sectionIndex].content;
    
    // Save current content to history
    saveToHistory(lessonIndex, sectionIndex, currentContent);
    
    try {
      const newContent = await transformFn(currentContent, {
        lessonTitle: editedLessons[lessonIndex].title,
        topic: editedTitle
      });
      
      updateSectionContent(lessonIndex, sectionIndex, newContent);
      showToast(`Section ${actionName.toLowerCase()}d successfully`);
    } catch (error) {
      console.error(`Failed to ${actionName}:`, error);
      showToast(`Failed to ${actionName.toLowerCase()} section`, 'info');
      
      // Remove from history since transform failed
      const key = getSectionKey(lessonIndex, sectionIndex);
      const newHistories = new Map(sectionHistories);
      const history = newHistories.get(key);
      if (history) {
        history.pop();
        if (history.length === 0) {
          newHistories.delete(key);
        }
      }
      setSectionHistories(newHistories);
    }
  };

  const handleAccept = () => {
    if (!draft) return;

    // Create course from edited draft
    const updatedDraft: AICourseDraft = {
      ...draft,
      title: editedTitle,
      description: editedDescription,
      lessons: editedLessons,
    };

    const courseId = createCourseFromAIDraft(updatedDraft, getCurrentUser().id);
    
    // Clear sessionStorage
    sessionStorage.removeItem('aiCourseDraft');
    sessionStorage.removeItem('aiCoursePrompt');
    sessionStorage.removeItem('aiCourseSourceFile');
    
    // Navigate to course editor
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDiscard = () => {
    if (confirm('Discard this AI-generated draft? This cannot be undone.')) {
      sessionStorage.removeItem('aiCourseDraft');
      sessionStorage.removeItem('aiCoursePrompt');
      sessionStorage.removeItem('aiCourseSourceFile');
      router.push('/admin/courses');
    }
  };

  if (!draft || !insights) {
    return (
      <RouteGuard allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500">Loading preview...</p>
            </div>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AdminLayout>
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-indigo-500'
          } text-white`}>
            {toast.message}
          </div>
        )}

        <div className="max-w-[1600px] mx-auto py-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">AI Course Workspace</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    <Sparkles className="w-4 h-4" />
                    AI Draft
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Review, refine, and customize AI-generated content</p>
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex gap-6">
            {/* Left Column: Main Editor */}
            <div className="flex-1 space-y-6">
              {/* Course Title and Description */}
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Lessons Accordion */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
                <div className="space-y-3">
                  {editedLessons.map((lesson, lessonIdx) => (
                    <Card key={lessonIdx}>
                      {/* Lesson Header */}
                      <button
                        onClick={() => toggleLesson(lessonIdx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                            {lessonIdx + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-left">{lesson.title}</h3>
                          <span className="text-xs text-gray-500">
                            {lesson.sections.length} section{lesson.sections.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {expandedLessons.includes(lessonIdx) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {/* Lesson Content */}
                      {expandedLessons.includes(lessonIdx) && (
                        <div className="px-4 pb-4 space-y-4">
                          {/* Sections */}
                          {lesson.sections.map((section, sectionIdx) => {
                            const sectionKey = getSectionKey(lessonIdx, sectionIdx);
                            const hasHistory = sectionHistories.has(sectionKey) && 
                              (sectionHistories.get(sectionKey)?.length || 0) > 0;

                            return (
                              <div key={sectionIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="block text-xs font-medium text-gray-500 mb-2">
                                  Section {sectionIdx + 1}
                                </label>
                                <textarea
                                  value={section.content}
                                  onChange={(e) => updateSectionContent(lessonIdx, sectionIdx, e.target.value)}
                                  rows={8}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none font-mono"
                                />

                                {/* Section Actions */}
                                <SectionActions
                                  sectionIndex={sectionIdx}
                                  onRegenerate={() => handleSectionTransform(lessonIdx, sectionIdx, regenerateSection, 'Regenerate')}
                                  onSimplify={() => handleSectionTransform(lessonIdx, sectionIdx, simplifySection, 'Simplify')}
                                  onExpand={() => handleSectionTransform(lessonIdx, sectionIdx, expandSection, 'Expand')}
                                  onUndo={() => handleUndo(lessonIdx, sectionIdx)}
                                  canUndo={hasHistory}
                                  isAIGenerated={true}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quiz Preview */}
              {draft.quiz && draft.quiz.questions.length > 0 && (
                <Card>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Quiz (Draft) - {draft.quiz.questions.length} Question{draft.quiz.questions.length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Multiple choice format
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>Read-only preview</span>
                      </div>
                    </div>

                    {draft.quiz.questions.slice(0, 3).map((question, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-900">{question.question}</p>
                        </div>
                        <div className="pl-8 space-y-1">
                          {question.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`text-sm px-3 py-1.5 rounded ${
                                optIdx === question.correctIndex
                                  ? 'bg-green-50 text-green-900 font-medium'
                                  : 'text-gray-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {option}
                              {optIdx === question.correctIndex && (
                                <span className="ml-2 text-green-600">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {draft.quiz.questions.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        + {draft.quiz.questions.length - 3} more question{draft.quiz.questions.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: AI Insight Panel */}
            <AIInsightPanel insights={insights} />
          </div>
        </div>

        {/* Fixed Bottom Toolbar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={handleDiscard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleAccept}>
                <Check className="w-4 h-4 mr-2" />
                Accept Draft
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
