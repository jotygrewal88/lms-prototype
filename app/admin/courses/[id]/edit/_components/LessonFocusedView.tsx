// Epic 1E: Focused lesson view with resources
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Plus, Eye, Save } from "lucide-react";
import { Lesson, Resource } from "@/types";
import ResourceCardSimple from "./ResourceCardSimple";
import Button from "@/components/Button";

// Simple time ago formatter
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'today';
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface LessonFocusedViewProps {
  lesson: Lesson;
  resources: Resource[];
  totalLessons: number;
  isReadOnly: boolean;
  isAIDraft?: boolean;
  sourceLabels?: string[];  // Resolved source attribution labels for AI lessons
  onUpdateTitle: (title: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddResource: () => void;
  onEditResource: (resource: Resource) => void;
  onUpdateResource: (updatedResource: Resource) => void; // For inline editing (text sections)
  onPreviewResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
  onReorderResources: (fromIndex: number, toIndex: number) => void;
  onPreviewLesson: () => void;
  onSave: () => void;
  onSaveAndNext: () => void;
}

export default function LessonFocusedView({
  lesson,
  resources,
  totalLessons,
  isReadOnly,
  isAIDraft,
  sourceLabels,
  onUpdateTitle,
  onMoveUp,
  onMoveDown,
  onAddResource,
  onEditResource,
  onUpdateResource,
  onPreviewResource,
  onDeleteResource,
  onReorderResources,
  onPreviewLesson,
  onSave,
  onSaveAndNext,
}: LessonFocusedViewProps) {
  const [title, setTitle] = useState(lesson.title);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync title when lesson changes
  useEffect(() => {
    setTitle(lesson.title);
    // Set initial lastSaved when lesson loads (so indicator shows immediately)
    if (lesson.updatedAt) {
      setLastSaved(new Date(lesson.updatedAt));
    }
  }, [lesson.id, lesson.title, lesson.updatedAt]);

  // Debounced save
  const debouncedSave = useMemo(
    () =>
      debounce((newTitle: string) => {
        if (newTitle.trim() && newTitle !== lesson.title) {
          console.log('🔄 Autosave triggered:', newTitle);
          setIsSaving(true);
          onUpdateTitle(newTitle);
          setTimeout(() => {
            console.log('✅ Autosave complete');
            setIsSaving(false);
            setLastSaved(new Date());
          }, 800); // Slightly longer to show the indicator
        }
      }, 1500),
    [lesson.title, onUpdateTitle]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isReadOnly) {
      debouncedSave(newTitle);
    }
  };

  const handleTitleBlur = () => {
    if (!isReadOnly && title.trim() && title !== lesson.title) {
      onUpdateTitle(title);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resources.findIndex((r) => r.id === active.id);
      const newIndex = resources.findIndex((r) => r.id === over.id);

      onReorderResources(oldIndex, newIndex);
    }
  };

  const currentIndex = lesson.order;
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < totalLessons - 1;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Manager Banner */}
      {isReadOnly && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span>🔒</span>
            <strong className="text-yellow-900">Manager mode</strong>
            <span className="text-yellow-700">– read only</span>
          </div>
        </div>
      )}

      {/* Title + Metadata Row — compact */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {lesson.order + 1} / {totalLessons}
            </span>
            {/* Autosave Indicator */}
            {!isReadOnly && isSaving ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving…
              </span>
            ) : !isReadOnly && lastSaved ? (
              <span className="text-[11px] text-emerald-600 font-medium">
                ✓ Saved {timeAgo(lastSaved.toISOString())}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">
                Updated {timeAgo(lesson.updatedAt)}
              </span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            disabled={isReadOnly}
            className={`
              w-full text-2xl font-bold px-0 py-0 border-0 bg-transparent
              ${isReadOnly 
                ? 'cursor-not-allowed text-gray-600' 
                : 'focus:outline-none text-gray-900 placeholder-gray-400'
              }
            `}
            placeholder="Untitled Lesson"
          />
          {/* Source attribution for AI-generated lessons */}
          {isAIDraft && sourceLabels && sourceLabels.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1.5">
              <span className="flex-shrink-0">📚</span>
              <span>{sourceLabels.length === 1 ? "Source" : "Sources"}: {sourceLabels.join(", ")}</span>
            </p>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${!canMoveUp ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Move lesson up"
            >
              <ArrowUp className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${!canMoveDown ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Move lesson down"
            >
              <ArrowDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Sections
          </h3>
          {!isReadOnly && (
            <Button variant="primary" onClick={onAddResource} className="!text-xs !py-1.5 !px-3">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Section
            </Button>
          )}
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="mb-3 text-4xl">📚</div>
            <h4 className="text-base font-semibold text-gray-700 mb-1">Start building your lesson</h4>
            {!isReadOnly && (
              <>
                <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                  Add text sections, videos, links, or files. Drag to reorder.
                </p>
                <Button variant="primary" onClick={onAddResource} className="!text-xs !py-1.5 !px-3">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add First Section
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={resources.map(r => r.id)}
                strategy={verticalListSortingStrategy}
                disabled={isReadOnly}
              >
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="relative">
                      <SortableResourceCard
                        resource={resource}
                        isReadOnly={isReadOnly}
                        isAIDraft={isAIDraft}
                        onEdit={() => onEditResource(resource)}
                        onUpdate={onUpdateResource}
                        onPreview={() => onPreviewResource(resource)}
                        onDelete={() => onDeleteResource(resource.id)}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Section button at the bottom of the list */}
            {!isReadOnly && (
              <button
                onClick={onAddResource}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Section (Text, Video, Image, Link, PDF)
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t bg-white flex items-center justify-between">
        <Button variant="secondary" onClick={onPreviewLesson}>
          <Eye className="w-4 h-4 mr-2" />
          Preview Lesson
        </Button>

        {!isReadOnly && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="primary" onClick={onSaveAndNext}>
              Save & Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableResourceCard({
  resource,
  isReadOnly,
  isAIDraft,
  onEdit,
  onUpdate,
  onPreview,
  onDelete,
}: {
  resource: Resource;
  isReadOnly: boolean;
  isAIDraft?: boolean;
  onEdit: () => void;
  onUpdate: (updatedResource: Resource) => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
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

  // For text sections, use inline update; for others, open sidebar
  const handleEdit = (updatedResource: Resource) => {
    if (resource.type === 'text') {
      // Text sections are inline-editable, update directly
      onUpdate(updatedResource);
    } else {
      // Other types open the sidebar
      onEdit();
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ResourceCardSimple
        resource={resource}
        isReadOnly={isReadOnly}
        isAIDraft={isAIDraft}
        onEdit={handleEdit}
        onPreview={onPreview}
        onDelete={onDelete}
        dragHandleProps={isReadOnly ? undefined : { ...attributes, ...listeners }}
      />
    </div>
  );
}

