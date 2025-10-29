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
  onUpdateTitle: (title: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddResource: () => void;
  onEditResource: (resource: Resource) => void;
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
  onUpdateTitle,
  onMoveUp,
  onMoveDown,
  onAddResource,
  onEditResource,
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
    <div className="flex flex-col h-full">
      {/* Manager Banner */}
      {isReadOnly && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <strong>Manager mode</strong> – read only
        </div>
      )}

      {/* Title Section */}
      <div className="mb-8">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          disabled={isReadOnly}
          className={`
            w-full text-3xl font-bold px-0 py-2 border-0 border-b-2 bg-transparent
            ${isReadOnly 
              ? 'border-gray-200 cursor-not-allowed text-gray-600' 
              : 'border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400'
            }
          `}
          placeholder="Untitled Lesson"
        />
      </div>

      {/* Metadata Row with Autosave Indicator */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">#{lesson.order + 1} of {totalLessons}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{resources.length} section{resources.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-400">•</span>
          
          {/* Autosave Indicator */}
          {!isReadOnly && isSaving ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : !isReadOnly && lastSaved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Saved • {timeAgo(lastSaved.toISOString())}
            </span>
          ) : (
            <span className="text-gray-600">Updated {timeAgo(lesson.updatedAt)}</span>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`
                p-2 rounded hover:bg-gray-100 transition-colors
                ${!canMoveUp ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              title="Move lesson up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`
                p-2 rounded hover:bg-gray-100 transition-colors
                ${!canMoveDown ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              title="Move lesson down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
          {!isReadOnly && (
            <Button variant="primary" onClick={onAddResource}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="mb-4 text-4xl">📚</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Start your lesson below 👇</h4>
            {!isReadOnly && (
              <>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Add a Text Section or Upload a Video to begin building your lesson content
                </p>
                <Button variant="primary" onClick={onAddResource}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Section
                </Button>
              </>
            )}
          </div>
        ) : (
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
              <div className="space-y-2">
                {resources.map((resource) => (
                  <SortableResourceCard
                    key={resource.id}
                    resource={resource}
                    isReadOnly={isReadOnly}
                    onEdit={() => onEditResource(resource)}
                    onPreview={() => onPreviewResource(resource)}
                    onDelete={() => onDeleteResource(resource.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 mt-6 pt-4 border-t bg-white flex items-center justify-between">
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
  onEdit,
  onPreview,
  onDelete,
}: {
  resource: Resource;
  isReadOnly: boolean;
  onEdit: () => void;
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

  return (
    <div ref={setNodeRef} style={style}>
      <ResourceCardSimple
        resource={resource}
        isReadOnly={isReadOnly}
        onEdit={onEdit}
        onPreview={onPreview}
        onDelete={onDelete}
        dragHandleProps={isReadOnly ? undefined : { ...attributes, ...listeners }}
      />
    </div>
  );
}

