"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Zap,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  X as XIcon,
  Check,
  Users,
  MoreVertical,
  Download,
  GripVertical,
  Plus,
  Search,
  ClipboardList,
  Link2,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  getOnboardingPathById,
  getOnboardingAssignmentsByPathId,
  getJobTitleById,
  getActiveSkillsV2,
  getLibraryItems,
  getCourses,
  getCourseById,
  getTrainings,
  getTrainingById,
  getUser,
  deleteOnboardingPath,
  updateOnboardingPath,
  archiveOnboardingPath,
  addOnboardingPhase,
  updateOnboardingPhase,
  deleteOnboardingPhase,
  reorderOnboardingPhases,
  addOnboardingCourse,
  addOnboardingTraining,
  addOnboardingTodoItem,
  updateOnboardingCourse,
  deleteOnboardingCourse,
  reorderOnboardingCourses,
} from "@/lib/store";
import { getFullName } from "@/types";
import type { OnboardingPhase, OnboardingPhaseCourse, Course, Training } from "@/types";
import { useRouter } from "next/navigation";
import PublishConfirmModal from "./PublishConfirmModal";
import AssignLearnersModal from "./AssignLearnersModal";

// ----------------------------------------------------------------------------
// Picker popover (used for skills and sources in edit mode)
// ----------------------------------------------------------------------------

function MultiPickerPopover({
  items,
  selectedIds,
  onChange,
  onClose,
  emptyLabel,
}: {
  items: { id: string; label: string; sub?: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
  emptyLabel: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return it.label.toLowerCase().includes(q) || (it.sub || "").toLowerCase().includes(q);
  });
  const selectedSet = new Set(selectedIds);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-2">
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">{emptyLabel}</p>
          ) : (
            filtered.map((it) => (
              <label
                key={it.id}
                className="flex items-start gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(it.id)}
                  onChange={() => toggle(it.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{it.label}</p>
                  {it.sub && <p className="text-[10px] text-gray-500 truncate">{it.sub}</p>}
                </div>
              </label>
            ))
          )}
        </div>
        <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------------
// Course Picker Modal — choose a published Course to link into the phase
// ----------------------------------------------------------------------------

function CoursePickerModal({
  excludeCourseIds,
  onPick,
  onClose,
}: {
  excludeCourseIds: string[];
  onPick: (courseId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const allCourses = getCourses().filter((c) => c.status === "published");
  const exclude = new Set(excludeCourseIds);
  const filtered = allCourses.filter((c) => {
    if (exclude.has(c.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-xl w-full shadow-xl">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Add Course to Phase</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search published courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {allCourses.length === 0
                  ? "No published courses yet. Create one in the Courses module first."
                  : "No matching courses."}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c.id)}
                className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                      {c.category && <span>{c.category}</span>}
                      {c.estimatedMinutes !== undefined && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {c.estimatedMinutes} min
                        </span>
                      )}
                      {(c.skillsGranted?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Target className="w-3 h-3" />
                          {c.skillsGranted!.length} skill{c.skillsGranted!.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Training Picker Modal — choose an active Training to link into the phase
// ----------------------------------------------------------------------------

function TrainingPickerModal({
  excludeTrainingIds,
  onPick,
  onClose,
}: {
  excludeTrainingIds: string[];
  onPick: (trainingId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const allTrainings = getTrainings().filter((t) => t.status === "active");
  const exclude = new Set(excludeTrainingIds);
  const filtered = allTrainings.filter((t) => {
    if (exclude.has(t.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.vendor || "").toLowerCase().includes(q) ||
      (t.category || "").toLowerCase().includes(q)
    );
  });

  const formatLabel = (t: Training): string => {
    switch (t.trainingFormat) {
      case "in-person":
        return "In-person";
      case "classroom":
        return "Classroom";
      case "on-site":
        return "On-site";
      case "third-party-online":
        return "Third-party online";
      case "other":
        return t.trainingFormatOther || "Other";
      default:
        return "Training";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-xl w-full shadow-xl">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Add Training to Phase</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Link an existing training from the Trainings module. Includes in-person,
            classroom, on-site, and third-party trainings.
          </p>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search active trainings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {allTrainings.length === 0
                  ? "No active trainings yet. Create one in the Trainings module first."
                  : "No matching trainings."}
              </p>
            </div>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                className="w-full text-left p-3 hover:bg-emerald-50 rounded-lg transition-colors mb-1"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    {t.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 flex-wrap">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                        {formatLabel(t)}
                      </span>
                      {t.vendor && <span>· {t.vendor}</span>}
                      {t.category && <span>· {t.category}</span>}
                      {(t.skillsGranted?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Target className="w-3 h-3" />
                          {t.skillsGranted!.length} skill{t.skillsGranted!.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------------

export default function PathPreview({
  pathId,
  onBack,
}: {
  pathId: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [showPublish, setShowPublish] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignToast, setAssignToast] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [coursePickerPhaseId, setCoursePickerPhaseId] = useState<string | null>(null);
  const [trainingPickerPhaseId, setTrainingPickerPhaseId] = useState<string | null>(null);

  // Edit-mode toggle. View mode is the default for every path. Only draft
  // paths can enter edit mode at all — published/archived stay strictly
  // read-only to protect active assignments.
  const [isEditMode, setIsEditMode] = useState(false);

  // Path metadata edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState(0);
  const [editInstructions, setEditInstructions] = useState("");

  // Phase edit state
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhaseDesc, setEditPhaseDesc] = useState("");
  const [editPhaseTimeline, setEditPhaseTimeline] = useState("");
  const [editPhaseDayStart, setEditPhaseDayStart] = useState(0);
  const [editPhaseDayEnd, setEditPhaseDayEnd] = useState(0);

  // Course/Todo edit state
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseCategory, setEditCourseCategory] = useState("");
  const [editCourseMinutes, setEditCourseMinutes] = useState(0);
  const [editCourseScore, setEditCourseScore] = useState<number | undefined>(undefined);
  const [editTodoNote, setEditTodoNote] = useState("");

  // Per-row UI state
  const [skillsPickerCourseId, setSkillsPickerCourseId] = useState<string | null>(null);
  const [sourcesPickerCourseId, setSourcesPickerCourseId] = useState<string | null>(null);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const path = getOnboardingPathById(pathId);
  const allSkills = getActiveSkillsV2();
  const allSources = getLibraryItems();

  // Memoize picker item lists. Hooks must run before any conditional return.
  const skillPickerItems = useMemo(
    () =>
      allSkills.map((s) => ({
        id: s.id,
        label: s.name,
        sub: [s.category, s.type === "certification" ? "Certification" : "Skill"].filter(Boolean).join(" · "),
      })),
    [allSkills]
  );
  const sourcePickerItems = useMemo(
    () =>
      allSources
        .filter((s) => s.allowedForSynthesis)
        .map((s) => ({
          id: s.id,
          label: s.title,
          sub: s.description || (s.tags || []).join(", "),
        })),
    [allSources]
  );

  if (!path) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Onboarding path not found.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
          Back to Paths
        </button>
      </div>
    );
  }

  // Editing is allowed on any status; a banner makes it clear when you're
  // editing something that already has learners attached so changes aren't silent.
  const editing = isEditMode;

  const jt = getJobTitleById(path.jobTitleId);
  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;
  const getSourceTitle = (id: string) => allSources.find((s) => s.id === id)?.title || id;
  const totalCourses = path.phases.reduce(
    (s, p) => s + p.courses.filter((c) => (c.kind ?? "course") === "course").length,
    0,
  );
  const totalTrainings = path.phases.reduce(
    (s, p) => s + p.courses.filter((c) => c.kind === "training").length,
    0,
  );
  const totalTodos = path.phases.reduce(
    (s, p) => s + p.courses.filter((c) => c.kind === "todo").length,
    0,
  );
  const totalSkills = path.skillsCovered.length + path.skillsGap.length;
  const coveragePct = totalSkills > 0 ? Math.round((path.skillsCovered.length / totalSkills) * 100) : 100;

  const sourceUsage: Record<string, number> = {};
  for (const ph of path.phases) {
    for (const c of ph.courses) {
      for (const sid of c.sourceAttributions) {
        sourceUsage[sid] = (sourceUsage[sid] || 0) + 1;
      }
    }
  }

  // Close any inline editing forms when leaving edit mode
  const exitEditMode = () => {
    setIsEditMode(false);
    setEditingPhaseId(null);
    setEditingCourseId(null);
    setSkillsPickerCourseId(null);
    setSourcesPickerCourseId(null);
    setCoursePickerPhaseId(null);
    setTrainingPickerPhaseId(null);
  };

  const openEditModal = () => {
    setEditTitle(path.title);
    setEditDescription(path.description);
    setEditDuration(path.durationDays);
    setEditInstructions(path.additionalInstructions || "");
    setShowEditModal(true);
  };

  const saveMetadata = () => {
    updateOnboardingPath(pathId, {
      title: editTitle,
      description: editDescription,
      durationDays: editDuration,
      additionalInstructions: editInstructions || undefined,
    });
    setShowEditModal(false);
  };

  // ---- Phase edit handlers ----
  const startEditPhase = (phaseId: string) => {
    const phase = path.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    setEditPhaseName(phase.name);
    setEditPhaseDesc(phase.description);
    setEditPhaseTimeline(phase.timeline);
    setEditPhaseDayStart(phase.dayStart);
    setEditPhaseDayEnd(phase.dayEnd);
    setEditingPhaseId(phaseId);
    setEditingCourseId(null);
  };

  const savePhase = () => {
    if (!editingPhaseId) return;
    updateOnboardingPhase(pathId, editingPhaseId, {
      name: editPhaseName,
      description: editPhaseDesc,
      timeline: editPhaseTimeline,
      dayStart: editPhaseDayStart,
      dayEnd: editPhaseDayEnd,
    });
    setEditingPhaseId(null);
  };

  const handleDeletePhase = (phase: OnboardingPhase) => {
    const message =
      phase.courses.length > 0
        ? `Delete "${phase.name}" and its ${phase.courses.length} item${phase.courses.length === 1 ? "" : "s"}?`
        : `Delete "${phase.name}"?`;
    if (confirm(message)) {
      deleteOnboardingPhase(pathId, phase.id);
    }
  };

  const handlePhaseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = path.phases.findIndex((p) => p.id === active.id);
    const newIndex = path.phases.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(path.phases, oldIndex, newIndex).map((p) => p.id);
    reorderOnboardingPhases(pathId, reordered);
  };

  // ---- Course/Todo edit handlers ----
  const startEditCourse = (courseId: string) => {
    for (const ph of path.phases) {
      const course = ph.courses.find((c) => c.id === courseId);
      if (course) {
        setEditCourseTitle(course.title);
        setEditCourseCategory(course.category);
        setEditCourseMinutes(course.estimatedMinutes);
        setEditCourseScore(course.passingScore);
        setEditTodoNote(course.todoNote || "");
        setEditingCourseId(courseId);
        setEditingPhaseId(null);
        return;
      }
    }
  };

  const saveCourse = () => {
    if (!editingCourseId) return;
    // Find the item to know its kind (so we save only the relevant fields)
    let kind: "course" | "training" | "todo" = "course";
    for (const ph of path.phases) {
      const c = ph.courses.find((x) => x.id === editingCourseId);
      if (c) {
        kind = c.kind ?? "course";
        break;
      }
    }
    if (kind === "todo") {
      updateOnboardingCourse(pathId, editingCourseId, {
        title: editCourseTitle,
        estimatedMinutes: editCourseMinutes,
        todoNote: editTodoNote || undefined,
      });
    } else if (kind === "training") {
      // Trainings only let the admin tweak the time estimate; everything else
      // is sourced from the linked Training record.
      updateOnboardingCourse(pathId, editingCourseId, {
        estimatedMinutes: editCourseMinutes,
      });
    } else {
      updateOnboardingCourse(pathId, editingCourseId, {
        title: editCourseTitle,
        category: editCourseCategory,
        estimatedMinutes: editCourseMinutes,
        passingScore: editCourseScore,
      });
    }
    setEditingCourseId(null);
  };

  const handleDeleteCourse = (course: OnboardingPhaseCourse) => {
    const label = (course.kind ?? "course") === "todo" ? "to-do" : "course";
    if (confirm(`Delete ${label} "${course.title}"?`)) {
      deleteOnboardingCourse(pathId, course.id);
    }
  };

  const handleCourseDragEnd = (phaseId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const phase = path.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const oldIndex = phase.courses.findIndex((c) => c.id === active.id);
    const newIndex = phase.courses.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(phase.courses, oldIndex, newIndex).map((c) => c.id);
    reorderOnboardingCourses(pathId, phaseId, reordered);
  };

  // Course IDs already linked anywhere in this path — pass to picker to avoid dupes
  const linkedCourseIds = path.phases.flatMap((p) =>
    p.courses.map((c) => c.linkedCourseId).filter((x): x is string => !!x),
  );
  const linkedTrainingIds = path.phases.flatMap((p) =>
    p.courses.map((c) => c.linkedTrainingId).filter((x): x is string => !!x),
  );

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Onboarding Paths
      </button>

      {/* Edit-mode banner */}
      {editing && (
        <div
          className={`border rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between ${
            path.status === "published"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <p
            className={`text-sm flex items-center gap-2 ${
              path.status === "published" ? "text-red-800" : "text-amber-800"
            }`}
          >
            {path.status === "published" ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
            {path.status === "published"
              ? "You are editing a published path. Changes apply immediately to any active assignments."
              : path.status === "archived"
              ? "You are editing an archived path. Changes won't take effect until you restore it to draft."
              : "You are editing this draft. Changes save automatically as you make them."}
          </p>
          <button
            onClick={exitEditMode}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white border rounded transition-colors ${
              path.status === "published"
                ? "text-red-800 border-red-300 hover:bg-red-100"
                : "text-amber-800 border-amber-300 hover:bg-amber-100"
            }`}
            type="button"
          >
            <Check className="w-3.5 h-3.5" />
            Done editing
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{path.title}</h1>
              <Badge
                variant={path.status === "published" ? "success" : path.status === "draft" ? "info" : "default"}
              >
                {path.status === "published" ? "Published" : path.status === "draft" ? "Draft" : "Archived"}
              </Badge>
            </div>
            {jt && (
              <p className="text-sm text-gray-500">
                {jt.department} &bull; {jt.site}
              </p>
            )}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2">
            {!editing && path.status === "published" && (
              <Button
                variant="primary"
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Assign Learners
              </Button>
            )}
            {!editing && (
              <Button
                variant={path.status === "published" ? "secondary" : "primary"}
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            {editing && (
              <Button variant="secondary" onClick={openEditModal} className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Details
              </Button>
            )}
            <div className="relative">
              <button
                onClick={() => setOverflowOpen(!overflowOpen)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {overflowOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOverflowOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
                    <button
                      onClick={() => { setOverflowOpen(false); alert("PDF download will be available in the next release."); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    {path.status === "published" && (
                      <button
                        onClick={() => { setOverflowOpen(false); archiveOnboardingPath(path.id); onBack(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    )}
                    {path.status === "archived" && (
                      <button
                        onClick={() => { setOverflowOpen(false); updateOnboardingPath(path.id, { status: "draft" }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore to Draft
                      </button>
                    )}
                    {path.status === "draft" && (
                      <button
                        onClick={() => { setOverflowOpen(false); if (confirm("Delete this draft?")) { deleteOnboardingPath(path.id); onBack(); } }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{path.description}</p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600 mb-5">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {path.durationDays} Days
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            {(path.totalEstimatedMinutes / 60).toFixed(1)} Hours Total
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-gray-400" />
            {totalCourses} Course{totalCourses !== 1 ? "s" : ""}
          </span>
          {totalTrainings > 0 && (
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              {totalTrainings} Training{totalTrainings !== 1 ? "s" : ""}
            </span>
          )}
          {totalTodos > 0 && (
            <span className="flex items-center gap-1">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              {totalTodos} To-Do{totalTodos !== 1 ? "s" : ""}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-gray-400" />
            {path.skillsCovered.length}/{totalSkills} Skills ({coveragePct}%)
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400" />
            {path.confidenceScore}% Confidence
          </span>
        </div>

        {/* Status actions */}
        {path.status === "draft" && !editing && (
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setShowPublish(true)}>
              <CheckCircle2 className="w-4 h-4" />
              Approve & Publish
            </Button>
          </div>
        )}
      </div>

      {/* Skills Coverage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Skills Coverage</h2>
        <div className="space-y-2">
          {path.skillsCovered.map((skillId) => {
            const phase = path.phases.find((ph) =>
              ph.courses.some((c) => c.skillsGranted.includes(skillId))
            );
            return (
              <div key={skillId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {getSkillName(skillId)}
                </span>
                <span className="text-gray-500">
                  {phase?.name} — {phase?.timeline}
                </span>
              </div>
            );
          })}
          {path.skillsGap.map((skillId) => (
            <div key={skillId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {getSkillName(skillId)}
              </span>
              <span className="text-amber-600 text-xs">NOT COVERED — no source found</span>
            </div>
          ))}
        </div>
        {path.skillsGap.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Add sources for uncovered skills in Learning Model, then regenerate this path.
          </p>
        )}
      </div>

      {/* Source Attribution */}
      {Object.keys(sourceUsage).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Source Attribution</h2>
          <div className="space-y-2">
            {Object.entries(sourceUsage).map(([sid, count]) => (
              <div key={sid} className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{getSourceTitle(sid)}</span>
                <span className="text-gray-400">— used in {count} course{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course & Training Assignments — every trackable item this path will assign, in order */}
      {(() => {
        // Flatten all phase items in path order, keeping courses + trainings (skip to-dos).
        const allAssignments: {
          item: OnboardingPhaseCourse;
          phase: OnboardingPhase;
        }[] = [];
        for (const ph of path.phases) {
          for (const c of ph.courses) {
            const k = c.kind ?? "course";
            if (k === "course" || k === "training") {
              allAssignments.push({ item: c, phase: ph });
            }
          }
        }

        if (allAssignments.length === 0) return null;

        const courseCount = allAssignments.filter((a) => (a.item.kind ?? "course") === "course").length;
        const trainingCount = allAssignments.length - courseCount;

        return (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                Course &amp; Training Assignments
              </h2>
              <span className="text-xs text-gray-500">
                {courseCount} course{courseCount !== 1 ? "s" : ""}
                {trainingCount > 0 && ` · ${trainingCount} training${trainingCount !== 1 ? "s" : ""}`}
                {" · in order taken"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              These are assigned automatically when a learner is placed on this path.
              {editing && " Remove any you don't want included."}
            </p>
            <div className="divide-y divide-gray-100">
              {allAssignments.map(({ item, phase }, idx) => {
                const itemKind = item.kind ?? "course";
                const isTraining = itemKind === "training";
                const linkedC = item.linkedCourseId ? getCourseById(item.linkedCourseId) : undefined;
                const linkedT = item.linkedTrainingId ? getTrainingById(item.linkedTrainingId) : undefined;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 text-sm"
                  >
                    <div
                      className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center flex-shrink-0 ${
                        isTraining ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        {isTraining ? (
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 truncate">{item.title}</span>
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${
                            isTraining
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                          title={isTraining ? "From Trainings module" : "From Upkeep Learn"}
                        >
                          {isTraining ? "Training" : "Course"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {phase.timeline} · {phase.name} · {item.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {linkedC && (
                        <button
                          onClick={() => router.push(`/admin/courses/${linkedC.id}`)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          type="button"
                          title="Open course in library"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {linkedT && (
                        <button
                          onClick={() => router.push(`/admin/trainings/${linkedT.id}`)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          type="button"
                          title="Open training"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {editing && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${item.title}" from this path?`)) {
                              deleteOnboardingCourse(pathId, item.id);
                            }
                          }}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from path"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Learners Assigned */}
      {(() => {
        const assignments = getOnboardingAssignmentsByPathId(pathId);
        const activeCount = assignments.filter((a) => a.status === "active").length;
        const completedCount = assignments.filter((a) => a.status === "completed").length;
        const cancelledCount = assignments.filter((a) => a.status === "cancelled").length;

        return (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Learners Assigned
              </h2>
              {path.status === "published" && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Assign Learners
                </button>
              )}
              {path.status === "draft" && (
                <span className="text-xs text-gray-400">
                  Publish this path to start assigning learners.
                </span>
              )}
            </div>

            {assignments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{assignments.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{activeCount}</p>
                  <p className="text-xs text-blue-600">Active</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{completedCount}</p>
                  <p className="text-xs text-emerald-600">Completed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-500">{cancelledCount}</p>
                  <p className="text-xs text-gray-400">Cancelled</p>
                </div>
              </div>
            )}

            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No learners assigned yet.</p>
                {path.status === "published" && (
                  <button
                    onClick={() => setShowAssign(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign your first learners
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((a) => {
                      const user = getUser(a.userId);
                      if (!user) return null;
                      const totalCrs = a.phaseProgress.reduce((s, p) => s + p.coursesTotal, 0);
                      const doneCrs = a.phaseProgress.reduce((s, p) => s + p.coursesCompleted, 0);
                      const pct = totalCrs > 0 ? Math.round((doneCrs / totalCrs) * 100) : 0;

                      const statusVariant: Record<string, "success" | "info" | "default" | "error"> = {
                        active: "info", completed: "success", cancelled: "default",
                      };
                      const statusLabel: Record<string, string> = {
                        active: "Active", completed: "Completed", cancelled: "Cancelled",
                      };

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/admin/users/${a.userId}`)}
                        >
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{getFullName(user)}</td>
                          <td className="px-4 py-2.5 text-sm">
                            <Badge variant={statusVariant[a.status] || "default"}>{statusLabel[a.status] || a.status}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">
                            {new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                                <div
                                  className={`h-full rounded-full ${a.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">
                            {a.completedAt ? new Date(a.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Phase Timeline */}
      {editing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhaseDragEnd}>
          <SortableContext items={path.phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {path.phases.map((phase, phIdx) => (
              <SortablePhase
                key={phase.id}
                phase={phase}
                phaseIndex={phIdx}
                pathId={pathId}
                editing={editing}
                editingPhaseId={editingPhaseId}
                editingCourseId={editingCourseId}
                startEditPhase={startEditPhase}
                setEditingPhaseId={setEditingPhaseId}
                handleDeletePhase={handleDeletePhase}
                editPhaseName={editPhaseName}
                setEditPhaseName={setEditPhaseName}
                editPhaseDesc={editPhaseDesc}
                setEditPhaseDesc={setEditPhaseDesc}
                editPhaseTimeline={editPhaseTimeline}
                setEditPhaseTimeline={setEditPhaseTimeline}
                editPhaseDayStart={editPhaseDayStart}
                setEditPhaseDayStart={setEditPhaseDayStart}
                editPhaseDayEnd={editPhaseDayEnd}
                setEditPhaseDayEnd={setEditPhaseDayEnd}
                savePhase={savePhase}
                startEditCourse={startEditCourse}
                setEditingCourseId={setEditingCourseId}
                handleDeleteCourse={handleDeleteCourse}
                editCourseTitle={editCourseTitle}
                setEditCourseTitle={setEditCourseTitle}
                editCourseCategory={editCourseCategory}
                setEditCourseCategory={setEditCourseCategory}
                editCourseMinutes={editCourseMinutes}
                setEditCourseMinutes={setEditCourseMinutes}
                editCourseScore={editCourseScore}
                setEditCourseScore={setEditCourseScore}
                editTodoNote={editTodoNote}
                setEditTodoNote={setEditTodoNote}
                saveCourse={saveCourse}
                sensors={sensors}
                handleCourseDragEnd={handleCourseDragEnd(phase.id)}
                allSkills={allSkills}
                getSkillName={getSkillName}
                getSourceTitle={getSourceTitle}
                skillsPickerCourseId={skillsPickerCourseId}
                setSkillsPickerCourseId={setSkillsPickerCourseId}
                sourcesPickerCourseId={sourcesPickerCourseId}
                setSourcesPickerCourseId={setSourcesPickerCourseId}
                skillPickerItems={skillPickerItems}
                sourcePickerItems={sourcePickerItems}
                onOpenCoursePicker={(phId) => setCoursePickerPhaseId(phId)}
                onOpenTrainingPicker={(phId) => setTrainingPickerPhaseId(phId)}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        // View mode — no DnD, no edit affordances
        path.phases.map((phase, phIdx) => (
          <ReadOnlyPhase
            key={phase.id}
            phase={phase}
            phaseIndex={phIdx}
            getSkillName={getSkillName}
            getSourceTitle={getSourceTitle}
            allSkills={allSkills}
            router={router}
          />
        ))
      )}

      {/* Add Phase button — edit only */}
      {editing && (
        <div className="mb-8">
          <button
            onClick={() => addOnboardingPhase(pathId)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors w-full justify-center"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Phase
          </button>
        </div>
      )}

      {/* Publish modal */}
      {showPublish && (
        <PublishConfirmModal
          path={path}
          onClose={() => setShowPublish(false)}
          onPublished={onBack}
        />
      )}

      {/* Assign learners modal */}
      {showAssign && (
        <AssignLearnersModal
          path={path}
          onClose={() => setShowAssign(false)}
          onAssigned={(count) => {
            setShowAssign(false);
            setAssignToast(`Assigned ${count} learner${count === 1 ? "" : "s"} to this path.`);
            window.setTimeout(() => setAssignToast(null), 3500);
          }}
        />
      )}

      {/* Toast */}
      {assignToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {assignToast}
        </div>
      )}

      {/* Course picker modal */}
      {coursePickerPhaseId && (
        <CoursePickerModal
          excludeCourseIds={linkedCourseIds}
          onPick={(courseId) => {
            addOnboardingCourse(pathId, coursePickerPhaseId, courseId);
            setCoursePickerPhaseId(null);
          }}
          onClose={() => setCoursePickerPhaseId(null)}
        />
      )}

      {/* Training picker modal */}
      {trainingPickerPhaseId && (
        <TrainingPickerModal
          excludeTrainingIds={linkedTrainingIds}
          onPick={(trainingId) => {
            addOnboardingTraining(pathId, trainingPickerPhaseId, trainingId);
            setTrainingPickerPhaseId(null);
          }}
          onClose={() => setTrainingPickerPhaseId(null)}
        />
      )}

      {/* Edit Metadata Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl max-w-lg w-full shadow-xl p-6">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Onboarding Path</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</label>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  rows={2}
                  placeholder="Any extra guidance for this path..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveMetadata}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ReadOnlyPhase — view-mode rendering for one phase (no DnD, no edit UI)
// ----------------------------------------------------------------------------

function ReadOnlyPhase({
  phase,
  phaseIndex,
  getSkillName,
  getSourceTitle,
  allSkills,
  router,
}: {
  phase: OnboardingPhase;
  phaseIndex: number;
  getSkillName: (id: string) => string;
  getSourceTitle: (id: string) => string;
  allSkills: ReturnType<typeof getActiveSkillsV2>;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="mb-8">
      <div className="bg-gray-100 border border-gray-200 rounded-t-lg px-5 py-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Phase {phaseIndex + 1}: {phase.timeline} — {phase.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
      </div>
      <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-100">
        {phase.courses.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No items in this phase.</p>
        ) : (
          phase.courses.map((item) => (
            <ReadOnlyItem
              key={item.id}
              item={item}
              getSkillName={getSkillName}
              getSourceTitle={getSourceTitle}
              allSkills={allSkills}
              router={router}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReadOnlyItem({
  item,
  getSkillName,
  getSourceTitle,
  allSkills,
  router,
}: {
  item: OnboardingPhaseCourse;
  getSkillName: (id: string) => string;
  getSourceTitle: (id: string) => string;
  allSkills: ReturnType<typeof getActiveSkillsV2>;
  router: ReturnType<typeof useRouter>;
}) {
  const kind = item.kind ?? "course";
  const linked = item.linkedCourseId ? getCourseById(item.linkedCourseId) : undefined;
  const linkedTraining = item.linkedTrainingId ? getTrainingById(item.linkedTrainingId) : undefined;

  if (kind === "todo") {
    return (
      <div className="p-5">
        <div className="flex items-start gap-2">
          <ClipboardList className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
            {item.todoNote && (
              <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{item.todoNote}</p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              To-do · {item.estimatedMinutes} min · outside the LMS
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "training") {
    const fmt = linkedTraining?.trainingFormat;
    const fmtLabel =
      fmt === "in-person" ? "In-person" :
      fmt === "classroom" ? "Classroom" :
      fmt === "on-site" ? "On-site" :
      fmt === "third-party-online" ? "Third-party online" :
      fmt === "other" ? (linkedTraining?.trainingFormatOther || "Other") :
      "Training";
    return (
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium">
                  {fmtLabel}
                </span>
                {linkedTraining?.vendor && <span>· {linkedTraining.vendor}</span>}
                <span>· {item.estimatedMinutes} min</span>
              </p>
            </div>
          </div>
          {linkedTraining && (
            <button
              onClick={() => router.push(`/admin/trainings/${linkedTraining.id}`)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 rounded transition-colors flex-shrink-0"
              type="button"
              title="Open training"
            >
              View training
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
        {item.skillsGranted.length > 0 && (
          <div className="text-xs text-gray-600 mt-2 flex items-start gap-2">
            <span className="text-gray-500 shrink-0">Skills:</span>
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {item.skillsGranted.map((sid) => (
                <span
                  key={sid}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded"
                >
                  {getSkillName(sid)}
                  {allSkills.find((s) => s.id === sid)?.type === "certification" && (
                    <Zap className="w-2.5 h-2.5 text-yellow-500" />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.category || "Uncategorized"} · {item.estimatedMinutes} min
              {linked && (
                <>
                  {" · "}
                  <span className="inline-flex items-center gap-0.5 text-blue-600">
                    <Link2 className="w-3 h-3" />
                    Linked to course library
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        {linked && (
          <button
            onClick={() => router.push(`/admin/courses/${linked.id}`)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
            type="button"
            title="Open course in library"
          >
            View course
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {item.skillsGranted.length > 0 && (
        <div className="text-xs text-gray-600 mt-2 flex items-start gap-2">
          <span className="text-gray-500 shrink-0">Skills:</span>
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {item.skillsGranted.map((sid) => (
              <span
                key={sid}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] rounded"
              >
                {getSkillName(sid)}
                {allSkills.find((s) => s.id === sid)?.type === "certification" && (
                  <Zap className="w-2.5 h-2.5 text-yellow-500" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.sourceAttributions.length > 0 && (
        <div className="text-xs text-gray-600 mt-1.5 flex items-start gap-2">
          <span className="text-gray-500 shrink-0">Sources:</span>
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {item.sourceAttributions.map((sid) => (
              <span
                key={sid}
                className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded"
                title={getSourceTitle(sid)}
              >
                {getSourceTitle(sid)}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.passingScore !== undefined && (
        <p className="text-xs text-gray-500 mt-2">
          Assessment: {item.passingScore}% passing score
        </p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// SortablePhase: edit-mode rendering with DnD, inline editing, add buttons
// ----------------------------------------------------------------------------

interface SortablePhaseProps {
  phase: OnboardingPhase;
  phaseIndex: number;
  pathId: string;
  editing: boolean;
  editingPhaseId: string | null;
  editingCourseId: string | null;
  startEditPhase: (phaseId: string) => void;
  setEditingPhaseId: (id: string | null) => void;
  handleDeletePhase: (phase: OnboardingPhase) => void;
  editPhaseName: string;
  setEditPhaseName: (v: string) => void;
  editPhaseDesc: string;
  setEditPhaseDesc: (v: string) => void;
  editPhaseTimeline: string;
  setEditPhaseTimeline: (v: string) => void;
  editPhaseDayStart: number;
  setEditPhaseDayStart: (v: number) => void;
  editPhaseDayEnd: number;
  setEditPhaseDayEnd: (v: number) => void;
  savePhase: () => void;
  startEditCourse: (courseId: string) => void;
  setEditingCourseId: (id: string | null) => void;
  handleDeleteCourse: (course: OnboardingPhaseCourse) => void;
  editCourseTitle: string;
  setEditCourseTitle: (v: string) => void;
  editCourseCategory: string;
  setEditCourseCategory: (v: string) => void;
  editCourseMinutes: number;
  setEditCourseMinutes: (v: number) => void;
  editCourseScore: number | undefined;
  setEditCourseScore: (v: number | undefined) => void;
  editTodoNote: string;
  setEditTodoNote: (v: string) => void;
  saveCourse: () => void;
  sensors: ReturnType<typeof useSensors>;
  handleCourseDragEnd: (event: DragEndEvent) => void;
  allSkills: ReturnType<typeof getActiveSkillsV2>;
  getSkillName: (id: string) => string;
  getSourceTitle: (id: string) => string;
  skillsPickerCourseId: string | null;
  setSkillsPickerCourseId: (id: string | null) => void;
  sourcesPickerCourseId: string | null;
  setSourcesPickerCourseId: (id: string | null) => void;
  skillPickerItems: { id: string; label: string; sub?: string }[];
  sourcePickerItems: { id: string; label: string; sub?: string }[];
  onOpenCoursePicker: (phaseId: string) => void;
  onOpenTrainingPicker: (phaseId: string) => void;
}

function SortablePhase(props: SortablePhaseProps) {
  const {
    phase,
    phaseIndex,
    pathId,
    editingPhaseId,
    editingCourseId,
    startEditPhase,
    setEditingPhaseId,
    handleDeletePhase,
    editPhaseName,
    setEditPhaseName,
    editPhaseDesc,
    setEditPhaseDesc,
    editPhaseTimeline,
    setEditPhaseTimeline,
    editPhaseDayStart,
    setEditPhaseDayStart,
    editPhaseDayEnd,
    setEditPhaseDayEnd,
    savePhase,
    startEditCourse,
    setEditingCourseId,
    handleDeleteCourse,
    editCourseTitle,
    setEditCourseTitle,
    editCourseCategory,
    setEditCourseCategory,
    editCourseMinutes,
    setEditCourseMinutes,
    editCourseScore,
    setEditCourseScore,
    editTodoNote,
    setEditTodoNote,
    saveCourse,
    sensors,
    handleCourseDragEnd,
    allSkills,
    getSkillName,
    getSourceTitle,
    skillsPickerCourseId,
    setSkillsPickerCourseId,
    sourcesPickerCourseId,
    setSourcesPickerCourseId,
    skillPickerItems,
    sourcePickerItems,
    onOpenCoursePicker,
    onOpenTrainingPicker,
  } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-8">
      {/* Phase header */}
      <div className="bg-gray-100 border border-gray-200 rounded-t-lg px-5 py-3">
        {editingPhaseId === phase.id ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Phase Name</label>
                <input
                  type="text"
                  value={editPhaseName}
                  onChange={(e) => setEditPhaseName(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Timeline Label</label>
                <input
                  type="text"
                  value={editPhaseTimeline}
                  onChange={(e) => setEditPhaseTimeline(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="e.g. Week 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Day Start</label>
                <input
                  type="number"
                  value={editPhaseDayStart}
                  onChange={(e) => setEditPhaseDayStart(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Day End</label>
                <input
                  type="number"
                  value={editPhaseDayEnd}
                  onChange={(e) => setEditPhaseDayEnd(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Description</label>
              <textarea
                value={editPhaseDesc}
                onChange={(e) => setEditPhaseDesc(e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={savePhase} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setEditingPhaseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                <XIcon className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                title="Drag to reorder phase"
                type="button"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Phase {phaseIndex + 1}: {phase.timeline} — {phase.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEditPhase(phase.id)}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit phase"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeletePhase(phase)}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete phase"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Item cards */}
      <div className="border-x border-b border-gray-200 rounded-b-lg">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCourseDragEnd}>
          <SortableContext items={phase.courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-gray-100">
              {phase.courses.map((course) => (
                <SortableItem
                  key={course.id}
                  course={course}
                  pathId={pathId}
                  isEditing={editingCourseId === course.id}
                  startEditCourse={startEditCourse}
                  setEditingCourseId={setEditingCourseId}
                  handleDeleteCourse={handleDeleteCourse}
                  editCourseTitle={editCourseTitle}
                  setEditCourseTitle={setEditCourseTitle}
                  editCourseCategory={editCourseCategory}
                  setEditCourseCategory={setEditCourseCategory}
                  editCourseMinutes={editCourseMinutes}
                  setEditCourseMinutes={setEditCourseMinutes}
                  editCourseScore={editCourseScore}
                  setEditCourseScore={setEditCourseScore}
                  editTodoNote={editTodoNote}
                  setEditTodoNote={setEditTodoNote}
                  saveCourse={saveCourse}
                  allSkills={allSkills}
                  getSkillName={getSkillName}
                  getSourceTitle={getSourceTitle}
                  skillsPickerCourseId={skillsPickerCourseId}
                  setSkillsPickerCourseId={setSkillsPickerCourseId}
                  sourcesPickerCourseId={sourcesPickerCourseId}
                  setSourcesPickerCourseId={setSourcesPickerCourseId}
                  skillPickerItems={skillPickerItems}
                  sourcePickerItems={sourcePickerItems}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {phase.courses.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">No items in this phase yet.</p>
        )}

        {/* Add item buttons */}
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onOpenCoursePicker(phase.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <BookOpen className="w-3.5 h-3.5" />
            Add Course
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onOpenTrainingPicker(phase.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <GraduationCap className="w-3.5 h-3.5" />
            Add Training
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => addOnboardingTodoItem(pathId, phase.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <ClipboardList className="w-3.5 h-3.5" />
            Add To-Do
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SortableItem — one item card (course OR todo) in edit mode
// ----------------------------------------------------------------------------

interface SortableItemProps {
  course: OnboardingPhaseCourse;
  pathId: string;
  isEditing: boolean;
  startEditCourse: (courseId: string) => void;
  setEditingCourseId: (id: string | null) => void;
  handleDeleteCourse: (course: OnboardingPhaseCourse) => void;
  editCourseTitle: string;
  setEditCourseTitle: (v: string) => void;
  editCourseCategory: string;
  setEditCourseCategory: (v: string) => void;
  editCourseMinutes: number;
  setEditCourseMinutes: (v: number) => void;
  editCourseScore: number | undefined;
  setEditCourseScore: (v: number | undefined) => void;
  editTodoNote: string;
  setEditTodoNote: (v: string) => void;
  saveCourse: () => void;
  allSkills: ReturnType<typeof getActiveSkillsV2>;
  getSkillName: (id: string) => string;
  getSourceTitle: (id: string) => string;
  skillsPickerCourseId: string | null;
  setSkillsPickerCourseId: (id: string | null) => void;
  sourcesPickerCourseId: string | null;
  setSourcesPickerCourseId: (id: string | null) => void;
  skillPickerItems: { id: string; label: string; sub?: string }[];
  sourcePickerItems: { id: string; label: string; sub?: string }[];
}

function SortableItem(props: SortableItemProps) {
  const {
    course,
    pathId,
    isEditing,
    startEditCourse,
    setEditingCourseId,
    handleDeleteCourse,
    editCourseTitle,
    setEditCourseTitle,
    editCourseCategory,
    setEditCourseCategory,
    editCourseMinutes,
    setEditCourseMinutes,
    editCourseScore,
    setEditCourseScore,
    editTodoNote,
    setEditTodoNote,
    saveCourse,
    allSkills,
    getSkillName,
    getSourceTitle,
    skillsPickerCourseId,
    setSkillsPickerCourseId,
    sourcesPickerCourseId,
    setSourcesPickerCourseId,
  } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const kind = course.kind ?? "course";
  const isTodo = kind === "todo";
  const isTraining = kind === "training";
  const linked: Course | undefined = course.linkedCourseId ? getCourseById(course.linkedCourseId) : undefined;
  const linkedTraining: Training | undefined = course.linkedTrainingId
    ? getTrainingById(course.linkedTrainingId)
    : undefined;
  const trainingFmtLabel = (() => {
    const fmt = linkedTraining?.trainingFormat;
    return fmt === "in-person" ? "In-person"
      : fmt === "classroom" ? "Classroom"
      : fmt === "on-site" ? "On-site"
      : fmt === "third-party-online" ? "Third-party online"
      : fmt === "other" ? (linkedTraining?.trainingFormatOther || "Other")
      : "Training";
  })();

  return (
    <div ref={setNodeRef} style={style} className="p-5">
      {isEditing ? (
        isTraining ? (
          // ----- Edit form: Training (mostly read-only, fields come from Trainings module) -----
          <div className="space-y-2">
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1.5 flex items-center gap-1.5">
              <Link2 className="w-3 h-3" />
              Linked to a training in the Trainings module — title, format, and skills are
              managed there.
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Training Title</label>
              <input
                type="text"
                value={course.title}
                disabled
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div className="max-w-[160px]">
              <label className="block text-xs text-gray-500 mb-0.5">Estimated Minutes</label>
              <input
                type="number"
                value={editCourseMinutes}
                onChange={(e) => setEditCourseMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveCourse} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setEditingCourseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                <XIcon className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : isTodo ? (
          // ----- Edit form: To-Do -----
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">To-Do Title</label>
              <input
                type="text"
                value={editCourseTitle}
                onChange={(e) => setEditCourseTitle(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="e.g. Pick up safety badge from facilities"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Note / Instructions (optional)</label>
              <textarea
                value={editTodoNote}
                onChange={(e) => setEditTodoNote(e.target.value)}
                rows={2}
                placeholder="Any extra context the new hire needs to complete this task..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="max-w-[120px]">
              <label className="block text-xs text-gray-500 mb-0.5">Estimated Minutes</label>
              <input
                type="number"
                value={editCourseMinutes}
                onChange={(e) => setEditCourseMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveCourse} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setEditingCourseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                <XIcon className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          // ----- Edit form: Course -----
          <div className="space-y-2">
            {linked && (
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1.5 flex items-center gap-1.5">
                <Link2 className="w-3 h-3" />
                Linked to library course — title, duration, and skills are managed from the course.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-0.5">Course Title</label>
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!!linked}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Category</label>
                <input
                  type="text"
                  value={editCourseCategory}
                  onChange={(e) => setEditCourseCategory(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g. Safety"
                  disabled={!!linked}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Minutes</label>
                <input
                  type="number"
                  value={editCourseMinutes}
                  onChange={(e) => setEditCourseMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!!linked}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Pass %</label>
                <input
                  type="number"
                  value={editCourseScore ?? ""}
                  onChange={(e) => setEditCourseScore(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="—"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveCourse} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setEditingCourseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                <XIcon className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )
      ) : (
        // ----- Display row -----
        <>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 mt-0.5"
                title="Drag to reorder"
                type="button"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  {isTodo ? (
                    <ClipboardList className="w-4 h-4 text-violet-500" />
                  ) : isTraining ? (
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  )}
                  {course.title}
                  {linked && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded"
                      title="Linked to a course in the library"
                    >
                      <Link2 className="w-2.5 h-2.5" />
                      Course
                    </span>
                  )}
                  {linkedTraining && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded"
                      title="Linked to a training in the Trainings module"
                    >
                      <Link2 className="w-2.5 h-2.5" />
                      Training
                    </span>
                  )}
                  {!isTodo && !linked && !linkedTraining && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded border border-amber-200"
                      title="Not linked to a real course or training yet — link one to make this trackable"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Unlinked
                    </span>
                  )}
                </h4>
                {isTodo ? (
                  <>
                    {course.todoNote && (
                      <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{course.todoNote}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      To-do · {course.estimatedMinutes} min · outside the LMS
                    </p>
                  </>
                ) : isTraining ? (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium">
                      {trainingFmtLabel}
                    </span>
                    {linkedTraining?.vendor && <span>· {linkedTraining.vendor}</span>}
                    <span>· {course.estimatedMinutes} min</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {course.category || "Uncategorized"} &bull; {course.estimatedMinutes} min
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEditCourse(course.id)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title={isTodo ? "Edit to-do" : "Edit course"}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteCourse(course)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                title={isTodo ? "Delete to-do" : "Delete course"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Skills for training items (read-only, sourced from Trainings module) */}
          {isTraining && course.skillsGranted.length > 0 && (
            <div className="text-xs text-gray-600 mt-2 flex items-start gap-2">
              <span className="text-gray-500 shrink-0">Skills:</span>
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {course.skillsGranted.map((sid) => (
                  <span
                    key={sid}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded"
                  >
                    {getSkillName(sid)}
                    {allSkills.find((s) => s.id === sid)?.type === "certification" && (
                      <Zap className="w-2.5 h-2.5 text-yellow-500" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills + sources — only for courses */}
          {!isTodo && !isTraining && (
            <>
              <div className="text-xs text-gray-600 mb-2 flex items-start gap-2">
                <span className="text-gray-500 shrink-0">Skills:</span>
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {course.skillsGranted.length === 0 ? (
                    <span className="text-gray-400 italic">No skills</span>
                  ) : (
                    course.skillsGranted.map((sid) => (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] rounded"
                      >
                        {getSkillName(sid)}
                        {allSkills.find((s) => s.id === sid)?.type === "certification" && (
                          <Zap className="w-2.5 h-2.5 text-yellow-500" />
                        )}
                      </span>
                    ))
                  )}
                  {!linked && (
                    <div className="relative">
                      <button
                        onClick={() => setSkillsPickerCourseId(skillsPickerCourseId === course.id ? null : course.id)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        type="button"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        Edit
                      </button>
                      {skillsPickerCourseId === course.id && (
                        <MultiPickerPopover
                          items={props.skillPickerItems}
                          selectedIds={course.skillsGranted}
                          onChange={(ids) =>
                            updateOnboardingCourse(pathId, course.id, { skillsGranted: ids })
                          }
                          onClose={() => setSkillsPickerCourseId(null)}
                          emptyLabel="No skills match your search."
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2 flex items-start gap-2">
                <span className="text-gray-500 shrink-0">Sources:</span>
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {course.sourceAttributions.length === 0 ? (
                    <span className="text-gray-400 italic">No sources</span>
                  ) : (
                    course.sourceAttributions.map((sid) => (
                      <span
                        key={sid}
                        className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] rounded"
                        title={getSourceTitle(sid)}
                      >
                        {getSourceTitle(sid)}
                      </span>
                    ))
                  )}
                  {!linked && (
                    <div className="relative">
                      <button
                        onClick={() => setSourcesPickerCourseId(sourcesPickerCourseId === course.id ? null : course.id)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        type="button"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        Edit
                      </button>
                      {sourcesPickerCourseId === course.id && (
                        <MultiPickerPopover
                          items={props.sourcePickerItems}
                          selectedIds={course.sourceAttributions}
                          onChange={(ids) =>
                            updateOnboardingCourse(pathId, course.id, { sourceAttributions: ids })
                          }
                          onClose={() => setSourcesPickerCourseId(null)}
                          emptyLabel="No AI-enabled sources match. Enable items in Learning Model → Sources."
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {course.passingScore !== undefined && (
                <p className="text-xs text-gray-500 mb-1">
                  Assessment: Certification Quiz — {course.passingScore}% passing score
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
