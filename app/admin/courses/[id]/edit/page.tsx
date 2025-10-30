// Phase II Epic 1 Fix Pass: Course Editor with Full Features + Drag-and-Drop
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Plus, Trash2, GripVertical, X, 
  FileText, Link as LinkIcon, Video, Image, FileImage,
  Calendar, User, RotateCcw, Upload, Sparkles, Eye, Clock
} from "lucide-react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Progress from "@/components/Progress";
import ResourcePreview from "@/components/ResourcePreview";
import ResourcesWorkspace from "./_components/ResourcesWorkspace";
import LessonStepper from "./_components/LessonStepper";
import LessonFocusedView from "./_components/LessonFocusedView";
import PreviewSectionModal from "./_components/PreviewSectionModal";
import ResourceEditorDrawer from "./_components/ResourceEditorDrawer";
import LessonSummaryPanelStepper from "./_components/LessonSummaryPanelStepper";
import LessonPreviewModalStepper from "./_components/LessonPreviewModalStepper";
import { 
  getCourseById, 
  updateCourse, 
  getLessonsByCourseId,
  getResourcesByLessonId,
  getResourceById,
  getQuizByCourseId,
  getQuestionsByQuizId,
  getAssignmentsByCourseId,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  reorderResources,
  createResource,
  updateResource,
  deleteResource,
  createAssignment,
  deleteAssignment,
  recomputeProgressCourse,
  getUsers,
  getSites,
  getDepartments,
  subscribe,
  getCurrentUser,
  ensureFirstLesson,
  getLessonById,
  // Epic 1G.4: Versioning & Audit functions
  performUndo,
  performRedo,
  canUndo,
  canRedo,
  getLastUndoSummary,
  getLastRedoSummary
} from "@/lib/store";
import { getFileAccept, formatFileSize } from "@/lib/uploads";
import { Course, Lesson, Resource, CoursePolicy, CourseAssignment, ResourceType, VersionedEntityType } from "@/types";
import HistoryDrawer from "@/components/history/HistoryDrawer";

type TabType = "overview" | "lessons" | "quiz" | "settings" | "assignment";

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const currentUser = getCurrentUser();
  const isManager = currentUser.role === "MANAGER";

  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [hasChanges, setHasChanges] = useState(false);

  // Epic 1G.4: History & Versioning state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyEntity, setHistoryEntity] = useState<{
    type: VersionedEntityType;
    id: string;
  } | null>(null);

  // Overview form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [standards, setStandards] = useState<string[]>([]);
  const [standardInput, setStandardInput] = useState("");

  // Lesson panel state (Epic 1E: Stepper-based)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>(undefined);
  const [previewingSection, setPreviewingSection] = useState<Resource | null>(null);
  const [isLessonPreviewOpen, setIsLessonPreviewOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null); // Keep for Epic 1D compatibility
  const [lessonResources, setLessonResources] = useState<Resource[]>([]);
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    type: "text" as ResourceType,
    title: "",
    url: "",
    content: "",
    durationSec: undefined as number | undefined,
  });
  const [uploadMode, setUploadMode] = useState<'upload' | 'link' | 'text'>('upload');
  const [uploadFileType, setUploadFileType] = useState<'image' | 'video' | 'pdf'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [replacingResourceId, setReplacingResourceId] = useState<string | null>(null);

  // Assignment tab state
  const [assignTab, setAssignTab] = useState<"users" | "sites" | "depts">("users");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<"LEARNER" | "MANAGER">("LEARNER");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>("");

  // Course policy state
  const [policy, setPolicy] = useState<CoursePolicy>({
    progression: "linear",
    requireAllLessons: true,
    requirePassingQuiz: true,
    enableRetakes: true,
    lockNextUntilPrevious: true,
    showExplanations: true,
    minVideoWatchPct: 80,
    minTimeOnLessonSec: 60,
    maxQuizAttempts: 3,
    retakeCooldownMin: 60,
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const loadedCourse = getCourseById(courseId);
        if (!loadedCourse) {
          console.warn(`Course not found: ${courseId}`);
          router.push("/admin/courses");
          return;
        }
        setCourse(loadedCourse);
        setTitle(loadedCourse.title);
        setDescription(loadedCourse.description || "");
        setCategory(loadedCourse.category || "");
        setTags(loadedCourse.tags || []);
        setEstimatedMinutes(loadedCourse.estimatedMinutes);
        setStatus(loadedCourse.status);
        setStandards(loadedCourse.standards || []);
        if (loadedCourse.policy) {
          setPolicy(loadedCourse.policy);
        }

        setLessons(getLessonsByCourseId(courseId));
        setAssignments(getAssignmentsByCourseId(courseId));
      } catch (error) {
        console.error("Error loading course:", error);
        router.push("/admin/courses");
      }
    };

    loadData();
    const unsubscribe = subscribe(loadData);
    return unsubscribe;
  }, [courseId, router]);

  // Update lesson resources when selectedLessonId changes
  useEffect(() => {
    if (selectedLessonId) {
      setLessonResources(getResourcesByLessonId(selectedLessonId));
    }
  }, [selectedLessonId]);

  // Epic 1E: Ensure at least one lesson exists and set active lesson
  useEffect(() => {
    if (lessons.length === 0 && !isManager) {
      // Auto-create first lesson
      const firstLesson = ensureFirstLesson(courseId);
      setActiveLessonId(firstLesson.id);
    } else if (lessons.length > 0 && !activeLessonId) {
      // Set first lesson as active
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, courseId, isManager, activeLessonId]);

  const handleSave = () => {
    if (!course || isManager) return;

    updateCourse(courseId, {
      title,
      description,
      category: category || undefined,
      tags,
      estimatedMinutes,
      status,
      standards,
      policy,
    });

    setHasChanges(false);
  };

  // Epic 1G.4: History & Versioning handlers
  const handleUndo = () => {
    const entityType = activeTab === 'overview' ? 'course' : 'lesson';
    const entityId = activeTab === 'overview' ? courseId : activeLessonId;
    if (entityId) {
      performUndo(entityType, entityId);
      // Refresh data
      const refreshedCourse = getCourseById(courseId);
      if (refreshedCourse) {
        setCourse(refreshedCourse);
        setTitle(refreshedCourse.title);
        setDescription(refreshedCourse.description || "");
        setCategory(refreshedCourse.category || "");
        setTags(refreshedCourse.tags || []);
        setEstimatedMinutes(refreshedCourse.estimatedMinutes);
        setStatus(refreshedCourse.status || "draft");
        setStandards(refreshedCourse.standards || []);
        setPolicy(refreshedCourse.policy || {
          progression: "linear",
          requireAllLessons: true,
          requirePassingQuiz: true,
          enableRetakes: true,
          lockNextUntilPrevious: true,
          showExplanations: true,
          minVideoWatchPct: 80,
          minTimeOnLessonSec: 60,
          maxQuizAttempts: 3,
          retakeCooldownMin: 60,
        });
      }
      const refreshedLessons = getLessonsByCourseId(courseId);
      setLessons(refreshedLessons);
    }
  };

  const handleRedo = () => {
    const entityType = activeTab === 'overview' ? 'course' : 'lesson';
    const entityId = activeTab === 'overview' ? courseId : activeLessonId;
    if (entityId) {
      performRedo(entityType, entityId);
      // Refresh data
      const refreshedCourse = getCourseById(courseId);
      if (refreshedCourse) {
        setCourse(refreshedCourse);
        setTitle(refreshedCourse.title);
        setDescription(refreshedCourse.description || "");
        setCategory(refreshedCourse.category || "");
        setTags(refreshedCourse.tags || []);
        setEstimatedMinutes(refreshedCourse.estimatedMinutes);
        setStatus(refreshedCourse.status || "draft");
        setStandards(refreshedCourse.standards || []);
        setPolicy(refreshedCourse.policy || {
          progression: "linear",
          requireAllLessons: true,
          requirePassingQuiz: true,
          enableRetakes: true,
          lockNextUntilPrevious: true,
          showExplanations: true,
          minVideoWatchPct: 80,
          minTimeOnLessonSec: 60,
          maxQuizAttempts: 3,
          retakeCooldownMin: 60,
        });
      }
      const refreshedLessons = getLessonsByCourseId(courseId);
      setLessons(refreshedLessons);
    }
  };

  const handleOpenHistory = () => {
    const entityType = activeTab === 'overview' ? 'course' : 'lesson';
    const entityId = activeTab === 'overview' ? courseId : activeLessonId;
    if (entityId) {
      setHistoryEntity({ type: entityType, id: entityId });
      setIsHistoryOpen(true);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    setHasChanges(true);
  };

  const handleAddStandard = () => {
    if (standardInput.trim() && !standards.includes(standardInput.trim())) {
      setStandards([...standards, standardInput.trim()]);
      setStandardInput("");
      setHasChanges(true);
    }
  };

  const handleRemoveStandard = (standard: string) => {
    setStandards(standards.filter(s => s !== standard));
    setHasChanges(true);
  };

  const handleAddLesson = () => {
    if (isManager) return;
    const order = lessons.length;
    const newLesson = createLesson({
      courseId,
      title: `Lesson ${lessons.length + 1}`,
      order,
      resourceIds: [],
    });
    setActiveLessonId(newLesson.id);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (isManager) return;
    if (confirm("Delete this lesson and all its resources?")) {
      deleteLesson(lessonId);
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
      }
    }
  };

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndLessons = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isManager) return;

    const oldIndex = lessons.findIndex(l => l.id === active.id);
    const newIndex = lessons.findIndex(l => l.id === over.id);

    if (oldIndex !== newIndex) {
      const reordered = arrayMove(lessons, oldIndex, newIndex);
      const orderedIds = reordered.map(l => l.id);
      reorderLessons(courseId, orderedIds);
    }
  };

  // Epic 1E: Stepper-specific handlers
  const handleReorderLessons = (fromIndex: number, toIndex: number) => {
    if (isManager) return;
    const reordered = arrayMove(lessons, fromIndex, toIndex);
    const orderedIds = reordered.map(l => l.id);
    reorderLessons(courseId, orderedIds);
  };

  const handleUpdateLessonTitle = (title: string) => {
    if (!activeLessonId || isManager) return;
    updateLesson(activeLessonId, { title });
  };

  const handleMoveLessonUp = () => {
    if (!activeLessonId || isManager) return;
    const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex > 0) {
      handleReorderLessons(currentIndex, currentIndex - 1);
    }
  };

  const handleMoveLessonDown = () => {
    if (!activeLessonId || isManager) return;
    const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex < lessons.length - 1) {
      handleReorderLessons(currentIndex, currentIndex + 1);
    }
  };

  const handleReorderResources = (fromIndex: number, toIndex: number) => {
    if (!activeLessonId || isManager) return;
    const resources = getResourcesByLessonId(activeLessonId);
    const reordered = arrayMove(resources, fromIndex, toIndex);
    reorderResources(activeLessonId, reordered.map(r => r.id));
  };

  const handleAddResource = () => {
    setEditingResource(undefined);
    setIsResourceDrawerOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsResourceDrawerOpen(true);
  };

  const handlePreviewResource = (resource: Resource) => {
    setPreviewingSection(resource);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (isManager) return;
    if (confirm("Delete this resource?")) {
      await deleteResource(resourceId);
    }
  };

  const handleSaveResource = async (resourceData: Partial<Resource>) => {
    if (!activeLessonId || isManager) return;

    if (editingResource) {
      // Update existing
      updateResource(editingResource.id, resourceData);
    } else {
      // Create new - ensure all required fields are present
      const newResourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
        courseId,
        lessonId: activeLessonId,
        type: resourceData.type!,
        title: resourceData.title!,
        url: resourceData.url,
        content: resourceData.content,
        durationSec: resourceData.durationSec,
        fileName: resourceData.fileName,
        fileSize: resourceData.fileSize,
        mimeType: resourceData.mimeType,
      };
      createResource(newResourceData);
    }
  };

  const handleSaveLesson = () => {
    // Already auto-saved, this is just for user feedback
    console.log('Lesson saved');
  };

  const handleSaveAndNext = () => {
    if (!activeLessonId || isManager) return;

    const currentIndex = lessons.findIndex(l => l.id === activeLessonId);

    if (currentIndex < lessons.length - 1) {
      // Navigate to next lesson
      setActiveLessonId(lessons[currentIndex + 1].id);
    } else {
      // Create new lesson and navigate to it
      handleAddLesson();
    }
  };

  const handleDragEndResources = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isManager || !selectedLessonId) return;

    const oldIndex = lessonResources.findIndex(r => r.id === active.id);
    const newIndex = lessonResources.findIndex(r => r.id === over.id);

    if (oldIndex !== newIndex) {
      const reordered = arrayMove(lessonResources, oldIndex, newIndex);
      const orderedIds = reordered.map(r => r.id);
      reorderResources(selectedLessonId, orderedIds);
    }
  };

  const handleFileUpload = async (file: File, type: ResourceType) => {
    if (!selectedLessonId) {
      console.error('No lesson selected');
      return;
    }
    
    console.log('Starting upload:', { fileName: file.name, type, size: file.size });
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('Sending request to /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.ok) {
        const titleWithoutExtension = result.fileName.replace(/\.[^/.]+$/, '');
        
        if (replacingResourceId) {
          // Replace existing resource
          const oldResource = getResourceById(replacingResourceId);
          updateResource(replacingResourceId, {
            url: result.url,
            fileName: result.fileName,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            title: titleWithoutExtension,
          });
          
          // Delete old file if it was an upload
          if (oldResource?.url && oldResource.url.startsWith('/uploads/')) {
            await fetch('/api/upload/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: oldResource.url }),
            });
          }
          
          setReplacingResourceId(null);
          console.log('Resource replaced successfully');
        } else {
          // Create new resource
          console.log('Creating new resource with data:', {
            lessonId: selectedLessonId,
            type,
            title: titleWithoutExtension,
            url: result.url,
            fileName: result.fileName,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
          });
          
          createResource({
            courseId,
            lessonId: selectedLessonId,
            type,
            title: titleWithoutExtension,
            url: result.url,
            fileName: result.fileName,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
          });
          
          console.log('Resource created successfully');
        }
        
        setIsResourceFormOpen(false);
        setReplacingResourceId(null);
      } else {
        console.error('Upload failed:', result.error);
        alert(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsUploading(false);
      console.log('Upload process complete, isUploading set to false');
    }
  };

  // Epic 1C/1D handlers - kept for compatibility with old resources workspace component
  const handleReplaceResource = (resourceId: string) => {
    setReplacingResourceId(resourceId);
    setIsResourceFormOpen(true);
    setUploadMode('upload');
  };

  const handleCreateAssignment = () => {
    if (isManager) return;
    
    let target: CourseAssignment["target"] | null = null;

    switch (assignTab) {
      case "users":
        if (selectedUserIds.length === 0) {
          alert("Please select at least one user");
          return;
        }
        // Create one assignment per user
        selectedUserIds.forEach(userId => {
          createAssignment({
            courseId,
            target: { type: "user", userId },
            dueAt: assignmentDueDate || undefined,
          });
        });
        break;
      case "sites":
        if (!selectedSiteId) {
          alert("Please select a site");
          return;
        }
        target = { type: "site", siteId: selectedSiteId };
        break;
      case "depts":
        if (!selectedDeptId) {
          alert("Please select a department");
          return;
        }
        target = { type: "dept", deptId: selectedDeptId };
        break;
    }

    if (target) {
      createAssignment({
        courseId,
        target,
        dueAt: assignmentDueDate || undefined,
      });
    }

    // Reset form
    setSelectedUserIds([]);
    setAssignmentDueDate("");
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (isManager) return;
    if (confirm("Remove this assignment?")) {
      deleteAssignment(assignmentId);
    }
  };

  const handleRecomputeProgress = () => {
    // Recompute for all learners who have progress
    const users = getUsers().filter(u => u.role === "LEARNER");
    users.forEach(user => {
      recomputeProgressCourse(user.id, courseId);
    });
    alert("Progress recomputed for all learners");
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "text": return <FileText className="w-4 h-4" />;
      case "link": return <LinkIcon className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "pdf": return <FileImage className="w-4 h-4" />;
      case "image": return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAssignmentLabel = (assignment: CourseAssignment): string => {
    const { target } = assignment;
    switch (target.type) {
      case "user":
        const user = getUsers().find(u => u.id === target.userId);
        return user ? `${user.firstName} ${user.lastName}` : target.userId;
      case "role":
        return `All ${target.role}s`;
      case "site":
        const site = getSites().find(s => s.id === target.siteId);
        return site ? `Site: ${site.name}` : target.siteId;
      case "dept":
        const dept = getDepartments().find(d => d.id === target.deptId);
        return dept ? `Dept: ${dept.name}` : target.deptId;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Sortable Lesson Row Component
  function SortableLessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
    const resources = getResourcesByLessonId(lesson.id);
    const isSelected = selectedLessonId === lesson.id;
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: lesson.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`border rounded-lg p-3 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"} ${
          isDragging ? "opacity-50 shadow-lg" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {!isManager && (
            <button
              className="drag-handle p-1 text-gray-400 hover:text-gray-700"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder lesson"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => {
              if (!isManager) {
                updateLesson(lesson.id, { title: e.target.value });
              }
            }}
            disabled={isManager}
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            aria-label={`Lesson ${index + 1} title`}
          />
          <Badge variant="default">{resources.length} resources</Badge>
          <Button
            variant="secondary"
            onClick={() => setSelectedLessonId(isSelected ? null : lesson.id)}
            className="text-sm"
          >
            {isSelected ? "Close" : "Manage"}
          </Button>
          {!isManager && (
            <button
              onClick={() => handleDeleteLesson(lesson.id)}
              className="text-red-600 hover:text-red-700"
              aria-label="Delete lesson"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Sortable Resource Row Component
  function SortableResourceRow({ resource }: { resource: Resource }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: resource.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const isUploadedFile = resource.url && resource.url.startsWith('/uploads/');

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white ${
          isDragging ? "opacity-50 shadow-lg" : ""
        }`}
      >
        {!isManager && (
          <button
            className="drag-handle flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 mt-0.5"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder resource"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-shrink-0 mt-1 text-gray-500">
          {getResourceIcon(resource.type)}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="text-sm font-medium text-gray-900">{resource.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="capitalize">{resource.type}</span>
              {resource.fileName && (
                <>
                  <span>•</span>
                  <span className="truncate">{resource.fileName}</span>
                </>
              )}
              {resource.fileSize && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(resource.fileSize)}</span>
                </>
              )}
              {resource.mimeType && (
                <>
                  <span>•</span>
                  <span className="truncate">{resource.mimeType}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Preview */}
          <div className="mt-2">
            <ResourcePreview resource={resource} size="small" />
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-1">
          {!isManager && isUploadedFile && resource.type !== 'link' && resource.type !== 'text' && (
            <button
              onClick={() => handleReplaceResource(resource.id)}
              className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
              aria-label="Replace file"
              title="Replace file"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          )}
          {!isManager && (
            <button
              onClick={() => handleDeleteResource(resource.id)}
              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete resource"
              title="Delete resource"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
        <AdminLayout>
          <div className="text-center py-12">Loading...</div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  const quiz = getQuizByCourseId(courseId);
  const questions = quiz ? getQuestionsByQuizId(quiz.id) : [];
  const ownerUser = getUsers().find(u => u.id === course.ownerUserId);

  return (
    <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <AdminLayout>
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push("/admin/courses")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <Badge variant={course.status === "published" ? "success" : "default"}>
                {course.status === "published" ? "Published" : "Draft"}
              </Badge>
            </div>
            {isManager && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Read-Only Mode:</strong> You are viewing this course as a Manager and cannot make edits.
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {ownerUser && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Owner: {ownerUser.firstName} {ownerUser.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(course.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(course.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Epic 1G.4: Undo/Redo/History Buttons */}
                <button
                  onClick={handleUndo}
                  disabled={!canUndo(historyEntity?.type || 'course', historyEntity?.id || courseId)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={getLastUndoSummary(historyEntity?.type || 'course', historyEntity?.id || courseId) || 'Undo'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleRedo}
                  disabled={!canRedo(historyEntity?.type || 'course', historyEntity?.id || courseId)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={getLastRedoSummary(historyEntity?.type || 'course', historyEntity?.id || courseId) || 'Redo'}
                >
                  <RotateCcw className="w-4 h-4 transform scale-x-[-1]" />
                </button>

                <Button variant="secondary" onClick={handleOpenHistory}>
                  <Clock className="w-4 h-4 mr-2" />
                  History
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                <Button
                  variant="secondary"
                  onClick={() => alert('Preview as Learner feature coming soon! This will show the course from a learner\'s perspective.')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview as Learner
                </Button>
                {!isManager && (
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* AI Draft Banner */}
          {course.ai?.source === "AI" && course.status === "draft" && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">Generated by AI from prompt</p>
                <p className="text-xs text-purple-700 mt-0.5">
                  Review and refine this content before publishing. You can edit all sections, add resources, and customize to your needs.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {(["overview", "lessons", "quiz", "settings", "assignment"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "overview" && (
              <div className="space-y-6 max-w-5xl">
                {/* Course Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{title || "Untitled Course"}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          status === "published" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>Owner: {ownerUser?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDate(course.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Updated {formatDate(course.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Thumbnail placeholder */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <FileText className="w-12 h-12" />
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        placeholder="Enter course title"
                        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                          isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        rows={4}
                        placeholder="Describe what learners will gain from this course..."
                        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none ${
                          isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={isManager}
                      placeholder="e.g., Safety, Equipment"
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                        isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={estimatedMinutes || ""}
                      onChange={(e) => {
                        setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined);
                        setHasChanges(true);
                      }}
                      disabled={isManager}
                      min="0"
                      placeholder="e.g., 30"
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                        isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as "draft" | "published");
                        setHasChanges(true);
                      }}
                      disabled={isManager}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                        isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Tags & Standards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    {!isManager && (
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                        />
                        <Button variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
                          Add
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {tags.length === 0 ? (
                        <p className="text-sm text-gray-400">No tags yet</p>
                      ) : (
                        tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-indigo-50 text-indigo-700 font-medium"
                          >
                            {tag}
                            {!isManager && (
                              <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Standards</h3>
                    {!isManager && (
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={standardInput}
                          onChange={(e) => setStandardInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStandard())}
                          placeholder="e.g., OSHA 1910.1200"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                        />
                        <Button variant="secondary" onClick={handleAddStandard} disabled={!standardInput.trim()}>
                          Add
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {standards.length === 0 ? (
                        <p className="text-sm text-gray-400">No standards yet</p>
                      ) : (
                        standards.map((standard) => (
                          <span
                            key={standard}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700 font-medium"
                          >
                            {standard}
                            {!isManager && (
                              <button onClick={() => handleRemoveStandard(standard)} className="hover:text-emerald-900 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lessons" && (
              <div className="flex flex-col min-h-screen">
                {/* Stepper - Sticky Top */}
                <div className="sticky top-0 z-10 bg-white border-b">
                  <LessonStepper
                    courseId={courseId}
                    lessons={lessons}
                    activeLessonId={activeLessonId || ''}
                    onSetActive={setActiveLessonId}
                    onReorder={handleReorderLessons}
                    onAddLesson={handleAddLesson}
                    isReadOnly={isManager}
                  />
                </div>

                {/* Main Content Area */}
                {activeLessonId ? (
                  <div className="flex flex-1 gap-6 p-6">
                    {/* Focused Lesson View */}
                    <div className="flex-1 overflow-auto">
                      <LessonFocusedView
                        lesson={getLessonById(activeLessonId)!}
                        resources={getResourcesByLessonId(activeLessonId)}
                        totalLessons={lessons.length}
                        isReadOnly={isManager}
                        onUpdateTitle={handleUpdateLessonTitle}
                        onMoveUp={handleMoveLessonUp}
                        onMoveDown={handleMoveLessonDown}
                        onAddResource={handleAddResource}
                        onEditResource={handleEditResource}
                        onPreviewResource={handlePreviewResource}
                        onDeleteResource={handleDeleteResource}
                        onReorderResources={handleReorderResources}
                        onPreviewLesson={() => setIsLessonPreviewOpen(true)}
                        onSave={handleSaveLesson}
                        onSaveAndNext={handleSaveAndNext}
                      />
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-80 flex-shrink-0 overflow-auto">
                      <LessonSummaryPanelStepper
                        lessonId={activeLessonId}
                        isReadOnly={isManager}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    No lessons yet. Click "Add Lesson" to get started.
                  </div>
                )}

                {/* Resource Editor Drawer */}
                <ResourceEditorDrawer
                  isOpen={isResourceDrawerOpen}
                  onClose={() => {
                    setIsResourceDrawerOpen(false);
                    setEditingResource(undefined);
                  }}
                  resource={editingResource}
                  lessonId={activeLessonId || ''}
                  onSave={handleSaveResource}
                />

                {/* Preview Modal */}
                {activeLessonId && (
                  <LessonPreviewModalStepper
                    isOpen={isLessonPreviewOpen}
                    onClose={() => setIsLessonPreviewOpen(false)}
                    lesson={getLessonById(activeLessonId)!}
                    resources={getResourcesByLessonId(activeLessonId)}
                  />
                )}

                {/* Section Preview Modal */}
                <PreviewSectionModal
                  section={previewingSection}
                  onClose={() => setPreviewingSection(null)}
                />
              </div>
            )}

            {activeTab === "quiz" && (
              <div>
                {quiz ? (
                  <div className="flex gap-6">
                    {/* Main Questions Area */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Questions</h2>
                        <p className="text-sm text-gray-600">Review and manage questions for this course quiz</p>
                      </div>

                      {questions.length === 0 ? (
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                          <div className="mb-4 text-gray-400">
                            <FileText className="w-16 h-16 mx-auto mb-3" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Questions will be managed in a future epic
                          </p>
                          {!isManager && (
                            <Button variant="primary" disabled>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question (Coming Soon)
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {questions.map((question, index) => {
                            // Get type chip styling
                            const getTypeChip = (type: string) => {
                              switch (type) {
                                case 'multiple_choice':
                                  return { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Multiple Choice', icon: '⊙' };
                                case 'true_false':
                                  return { bg: 'bg-purple-50', text: 'text-purple-700', label: 'True/False', icon: '✓✗' };
                                case 'short_answer':
                                  return { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Short Answer', icon: '✎' };
                                default:
                                  return { bg: 'bg-gray-50', text: 'text-gray-700', label: type, icon: '?' };
                              }
                            };

                            const typeChip = getTypeChip(question.type);

                            return (
                              <div 
                                key={question.id} 
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 animate-in fade-in slide-in-from-bottom-2"
                              >
                                <div className="flex items-start gap-4">
                                  {/* Question Number Badge */}
                                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-indigo-700">{index + 1}</span>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <p className="text-lg font-semibold text-gray-900 flex-1">{question.prompt}</p>
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeChip.bg} ${typeChip.text} flex-shrink-0`}>
                                        <span>{typeChip.icon}</span>
                                        {typeChip.label}
                                      </span>
                                    </div>

                                    {/* Answer Options */}
                                    <div className="space-y-2 mb-3">
                                      {question.options.map((option, optIdx) => (
                                        <div
                                          key={option.id}
                                          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg transition-colors ${
                                            option.isCorrect 
                                              ? "bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium" 
                                              : "bg-gray-50 border border-gray-200 text-gray-700"
                                          }`}
                                        >
                                          <span className="font-semibold text-gray-500 w-6">{String.fromCharCode(65 + optIdx)}.</span>
                                          <span className="flex-1">{option.label}</span>
                                          {option.isCorrect && (
                                            <span className="text-emerald-600 font-bold">✓</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Explanation */}
                                    {question.explanation && (
                                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg">
                                        <p className="text-xs font-medium text-sky-900 mb-1">Explanation</p>
                                        <p className="text-sm text-sky-800">{question.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Question CTA Card */}
                          {!isManager && (
                            <button
                              disabled
                              className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 opacity-50 cursor-not-allowed"
                            >
                              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm font-medium text-gray-600">Add Another Question (Coming Soon)</p>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar - Quiz Summary */}
                    <div className="w-80 flex-shrink-0">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Configuration</h3>
                        
                        <div className="space-y-4">
                          {/* Total Questions */}
                          <div className="p-4 bg-indigo-50 rounded-lg">
                            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Total Questions</div>
                            <div className="text-3xl font-bold text-indigo-900">{questions.length}</div>
                          </div>

                          {/* Passing Score */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Passing Score
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={quiz.passingScorePct}
                                onChange={(e) => {
                                  if (!isManager) {
                                    // Would need updateQuiz function here
                                  }
                                }}
                                disabled={isManager}
                                min="0"
                                max="100"
                                className={`flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                                  isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                                }`}
                              />
                              <span className="text-xl font-bold text-gray-900">%</span>
                            </div>
                          </div>

                          {/* Max Attempts */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Max Attempts
                            </label>
                            <input
                              type="number"
                              value={quiz.maxAttempts}
                              onChange={(e) => {
                                if (!isManager) {
                                  // Would need updateQuiz function here
                                }
                              }}
                              disabled={isManager}
                              min="1"
                              className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                                isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Question Types Breakdown */}
                          {questions.length > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Question Types</div>
                              <div className="space-y-2">
                                {Object.entries(
                                  questions.reduce((acc, q) => {
                                    acc[q.type] = (acc[q.type] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>)
                                ).map(([type, count]) => (
                                  <div key={type} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                                    <span className="font-semibold text-gray-900">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-2xl mx-auto">
                    <div className="text-gray-400 mb-4">
                      <FileText className="w-16 h-16 mx-auto mb-3" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz configured</h3>
                    <p className="text-gray-500 mb-6">Quiz creation will be available in Epic 3</p>
                    {!isManager && (
                      <Button variant="primary" disabled>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Quiz (Coming Soon)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-5xl space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Policy Settings</h2>
                  <div className="flex items-start gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-indigo-800">
                      These settings control how learners progress through the course. Changes are enforced in the course player.
                    </p>
                  </div>
                </div>

                {/* Progression Mode */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression Mode</h3>
                  <select
                    value={policy.progression}
                    onChange={(e) => {
                      setPolicy({ ...policy, progression: e.target.value as "linear" | "free" });
                      setHasChanges(true);
                    }}
                    disabled={isManager}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                      isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="linear">Linear — Learners must complete lessons in order</option>
                    <option value="free">Free — Learners can access any lesson</option>
                  </select>
                </div>

                {/* Completion Rules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Completion Rules</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Require all lessons</p>
                        <p className="text-sm text-gray-500 mt-0.5">Learners must complete every lesson to finish the course</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={policy.requireAllLessons}
                        onChange={(e) => {
                          setPolicy({ ...policy, requireAllLessons: e.target.checked });
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Require passing quiz</p>
                        <p className="text-sm text-gray-500 mt-0.5">Learners must pass the quiz to complete the course</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={policy.requirePassingQuiz}
                        onChange={(e) => {
                          setPolicy({ ...policy, requirePassingQuiz: e.target.checked });
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Lock sequential lessons</p>
                        <p className="text-sm text-gray-500 mt-0.5">Next lesson is locked until the current one is complete</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={policy.lockNextUntilPrevious}
                        onChange={(e) => {
                          setPolicy({ ...policy, lockNextUntilPrevious: e.target.checked });
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </label>
                  </div>
                </div>

                {/* Quiz Behavior */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Quiz Behavior</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Enable quiz retakes</p>
                        <p className="text-sm text-gray-500 mt-0.5">Allow learners to retake the quiz after failure</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={policy.enableRetakes}
                        onChange={(e) => {
                          setPolicy({ ...policy, enableRetakes: e.target.checked });
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Show explanations</p>
                        <p className="text-sm text-gray-500 mt-0.5">Display answer explanations when learners fail</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={policy.showExplanations}
                        onChange={(e) => {
                          setPolicy({ ...policy, showExplanations: e.target.checked });
                          setHasChanges(true);
                        }}
                        disabled={isManager}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Max Quiz Attempts
                        </label>
                        <input
                          type="number"
                          value={policy.maxQuizAttempts || ""}
                          onChange={(e) => {
                            setPolicy({ ...policy, maxQuizAttempts: e.target.value ? parseInt(e.target.value) : undefined });
                            setHasChanges(true);
                          }}
                          disabled={isManager}
                          min="1"
                          placeholder="Unlimited"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                            isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Retake Cooldown (min)
                        </label>
                        <input
                          type="number"
                          value={policy.retakeCooldownMin || ""}
                          onChange={(e) => {
                            setPolicy({ ...policy, retakeCooldownMin: e.target.value ? parseInt(e.target.value) : undefined });
                            setHasChanges(true);
                          }}
                          disabled={isManager}
                          min="0"
                          placeholder="No cooldown"
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                            isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Requirements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Timing Requirements</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Video Watch Percentage
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={policy.minVideoWatchPct || ""}
                          onChange={(e) => {
                            setPolicy({ ...policy, minVideoWatchPct: e.target.value ? parseInt(e.target.value) : undefined });
                            setHasChanges(true);
                          }}
                          disabled={isManager}
                          min="0"
                          max="100"
                          placeholder="e.g., 80"
                          className={`flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                            isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                          }`}
                        />
                        <span className="text-lg font-bold text-gray-900">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Minimum percentage of video that must be watched</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Time on Lesson
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={policy.minTimeOnLessonSec || ""}
                          onChange={(e) => {
                            setPolicy({ ...policy, minTimeOnLessonSec: e.target.value ? parseInt(e.target.value) : undefined });
                            setHasChanges(true);
                          }}
                          disabled={isManager}
                          min="0"
                          placeholder="e.g., 60"
                          className={`flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                            isManager ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'bg-white text-gray-900'
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-600">sec</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Minimum seconds required on each lesson</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assignment" && !isManager && (
              <div className="flex flex-col pb-24">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Assignments</h2>
                  <p className="text-sm text-gray-600">Assign this course to individual users, sites, or departments</p>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 mb-6">
                  {(["users", "sites", "depts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAssignTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        assignTab === tab
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tab === "users" ? "Individual Users" : tab === "sites" ? "By Site" : "By Department"}
                    </button>
                  ))}
                </div>

                {/* Selection Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  {assignTab === "users" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Learners</h3>
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {getUsers().filter(u => u.role === "LEARNER").map((user) => (
                          <label 
                            key={user.id} 
                            className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedUserIds.includes(user.id)
                                ? "bg-indigo-50 border-indigo-300 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, user.id]);
                                } else {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                                }
                              }}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="flex-1 font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                          </label>
                        ))}
                      </div>
                      {selectedUserIds.length > 0 && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                          <p className="text-sm font-medium text-indigo-900">
                            {selectedUserIds.length} {selectedUserIds.length === 1 ? 'learner' : 'learners'} selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {assignTab === "sites" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Site</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {getSites().map((site) => (
                          <label
                            key={site.id}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              selectedSiteId === site.id
                                ? "bg-indigo-50 border-indigo-500 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="font-medium text-gray-900">{site.name}</span>
                            <input
                              type="radio"
                              name="site"
                              value={site.id}
                              checked={selectedSiteId === site.id}
                              onChange={(e) => setSelectedSiteId(e.target.value)}
                              className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignTab === "depts" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Department</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {getDepartments().map((dept) => (
                          <label
                            key={dept.id}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              selectedDeptId === dept.id
                                ? "bg-indigo-50 border-indigo-500 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="font-medium text-gray-900">{dept.name}</span>
                            <input
                              type="radio"
                              name="dept"
                              value={dept.id}
                              checked={selectedDeptId === dept.id}
                              onChange={(e) => setSelectedDeptId(e.target.value)}
                              className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (optional)
                    </label>
                    <input
                      type="date"
                      value={assignmentDueDate}
                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Current Assignments - Collapsible */}
                <details open className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <span>Current Assignments ({assignments.length})</span>
                    <span className="text-gray-400">▼</span>
                  </summary>
                  <div className="px-6 pb-6">
                    {assignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No assignments yet. Select learners above and click "Assign Selected" below.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignments.map((assignment) => (
                          <div 
                            key={assignment.id} 
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                assignment.target.type === 'user' ? 'bg-indigo-100 text-indigo-700' :
                                assignment.target.type === 'role' ? 'bg-purple-100 text-purple-700' :
                                assignment.target.type === 'site' ? 'bg-sky-100 text-sky-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {assignment.target.type}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{getAssignmentLabel(assignment)}</span>
                              {assignment.dueAt && (
                                <span className="text-xs text-gray-500">
                                  Due {formatDate(assignment.dueAt)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-all"
                              title="Delete assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {assignTab === "users" && selectedUserIds.length > 0 && (
                        <span>{selectedUserIds.length} user{selectedUserIds.length === 1 ? '' : 's'} selected</span>
                      )}
                      {assignTab === "sites" && selectedSiteId && (
                        <span>Site: {getSites().find(s => s.id === selectedSiteId)?.name}</span>
                      )}
                      {assignTab === "depts" && selectedDeptId && (
                        <span>Dept: {getDepartments().find(d => d.id === selectedDeptId)?.name}</span>
                      )}
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={handleCreateAssignment}
                      className="shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Selected ›
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assignment" && isManager && (
              <Card>
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">Assignment management is not available for Managers.</p>
                  <p className="text-sm">Only Admins can assign courses to learners.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </AdminLayout>

      {/* Epic 1G.4: History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        entityType={historyEntity?.type || 'course'}
        entityId={historyEntity?.id || courseId}
        isReadOnly={isManager}
      />
    </RouteGuard>
  );
}
