// Phase II Epic 1 Fix Pass: Admin Courses List Page
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Calendar, Clock, Trash2, Sparkles } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import AIGenerateModal from "@/components/AIGenerateModal";
import { 
  getCourses, 
  getLessonsByCourseId,
  getResourcesByLessonId,
  getQuestionsByQuizId,
  getQuizByCourseId,
  getAssignmentsByCourseId,
  getProgressCourses,
  createCourse, 
  deleteCourse,
  subscribe,
  getCurrentUser,
  isAIDraftCourse
} from "@/lib/store";
import { generateCourseFromPrompt, generateCourseFromFile } from "@/lib/ai/generateCourse";
import { parseDocument } from "@/lib/ai/parseDocument";
import { Course, AIInput, AICourseDraft } from "@/types";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const currentUser = getCurrentUser();
  const isManager = currentUser.role === "MANAGER";

  useEffect(() => {
    const updateData = () => {
      setCourses(getCourses());
    };
    
    updateData();
    const unsubscribe = subscribe(updateData);
    return unsubscribe;
  }, []);

  const handleCreateCourse = () => {
    if (!newCourseTitle.trim()) return;

    const newCourse = createCourse({
      title: newCourseTitle,
      description: newCourseDescription || "",
      status: "draft",
      ownerUserId: currentUser.id,
      lessonIds: [],
    });

    setIsCreateModalOpen(false);
    setNewCourseTitle("");
    setNewCourseDescription("");
    router.push(`/admin/courses/${newCourse.id}/edit`);
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (confirm(`Are you sure you want to delete "${courseTitle}"? All lessons, sections, quizzes, and progress will be removed.`)) {
      deleteCourse(courseId);
    }
  };

  const handleAIGenerate = async (input: AIInput, file?: File) => {
    try {
      let draft: AICourseDraft;
      
      if (file) {
        // File-based generation
        console.log('Generating course from file:', file.name);
        const parsedData = await parseDocument(file);
        draft = await generateCourseFromFile(parsedData, input.prompt);
        
        // Store file metadata for preview
        sessionStorage.setItem('aiCourseSourceFile', file.name);
      } else {
        // Prompt-based generation
        console.log('Generating course from prompt:', input.prompt);
        draft = await generateCourseFromPrompt(input);
        sessionStorage.removeItem('aiCourseSourceFile');
      }
      
      // Store draft in sessionStorage for preview page
      sessionStorage.setItem('aiCourseDraft', JSON.stringify(draft));
      sessionStorage.setItem('aiCoursePrompt', input.prompt || 'AI Generated');
      
      // Close modal and navigate to preview
      setIsAIModalOpen(false);
      router.push('/admin/courses/ai/preview');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate course. Please try again.');
    }
  };

  const getCourseStats = (course: Course) => {
    const lessons = getLessonsByCourseId(course.id);
    const resourceCount = lessons.reduce((sum, lesson) => {
      return sum + getResourcesByLessonId(lesson.id).length;
    }, 0);
    
    const quiz = getQuizByCourseId(course.id);
    const questionCount = quiz ? getQuestionsByQuizId(quiz.id).length : 0;
    
    const assignments = getAssignmentsByCourseId(course.id);
    const assignedCount = assignments.length;
    
    const allProgress = getProgressCourses();
    const courseProgress = allProgress.filter(p => p.courseId === course.id);
    const completedCount = courseProgress.filter(p => p.status === "completed").length;
    
    return {
      lessonCount: lessons.length,
      resourceCount,
      questionCount,
      assignedCount,
      completedCount,
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">
                {isManager ? "View course library (read-only)" : "Manage your learning content library"}
              </p>
            </div>
            {!isManager && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsAIModalOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Course
                </Button>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>
            )}
          </div>

          {isManager && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Read-Only Mode:</strong> As a Manager, you can view courses but cannot create, edit, or delete them.
            </div>
          )}

          {courses.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No courses yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first course.
                </p>
                {!isManager && (
                  <div className="mt-6">
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Course
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => {
                const stats = getCourseStats(course);

                return (
                  <Card 
                    key={course.id} 
                    className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative"
                    onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                  >
                    <div className="h-full flex flex-col">
                      {/* Header with status and delete */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={course.status === "published" ? "success" : "default"}>
                            {course.status === "published" ? "Published" : "Draft"}
                          </Badge>
                          {isAIDraftCourse(course.id) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              <Sparkles className="w-3 h-3" />
                              AI Draft
                            </span>
                          )}
                        </div>
                        {!isManager && (
                          <button
                            onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Title and Category */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      {course.category && (
                        <Badge variant="default" className="mb-3 w-fit">
                          {course.category}
                        </Badge>
                      )}

                      {/* Description */}
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                          {course.description}
                        </p>
                      )}

                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {course.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="text-xs text-gray-500 py-0.5">
                              +{course.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="border-t border-gray-200 pt-3 mt-auto">
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{stats.lessonCount}</div>
                            <div>Lessons</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{stats.resourceCount}</div>
                            <div>Sections</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{stats.questionCount}</div>
                            <div>Questions</div>
                          </div>
                        </div>

                        {/* Progress indicator */}
                        {stats.assignedCount > 0 && (
                          <div className="text-xs text-gray-600 mb-3 text-center">
                            <span className="font-medium text-green-600">{stats.completedCount}</span> completed
                            {" / "}
                            <span className="font-medium">{stats.assignedCount}</span> assigned
                          </div>
                        )}

                        {/* Duration and timestamps */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {course.estimatedMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.estimatedMinutes}m
                            </div>
                          )}
                          <div className="flex items-center gap-1" title={`Updated ${formatDate(course.updatedAt)}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(course.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Create Course Modal */}
          {!isManager && (
            <Modal
              isOpen={isCreateModalOpen}
              onClose={() => {
                setIsCreateModalOpen(false);
                setNewCourseTitle("");
                setNewCourseDescription("");
              }}
              title="Create New Course"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g., Workplace Safety Fundamentals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCourse();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    placeholder="Brief overview of the course content"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewCourseTitle("");
                      setNewCourseDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateCourse}
                    disabled={!newCourseTitle.trim()}
                  >
                    Create & Edit
                  </Button>
                </div>
              </div>
            </Modal>
          )}

          {/* AI Generate Course Modal */}
          {!isManager && (
            <AIGenerateModal
              isOpen={isAIModalOpen}
              onClose={() => setIsAIModalOpen(false)}
              onGenerate={handleAIGenerate}
            />
          )}
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
