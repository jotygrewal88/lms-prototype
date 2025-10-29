// Epic 1E: Horizontal lesson stepper with drag-drop and keyboard navigation
"use client";

import React, { useEffect } from "react";
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from "lucide-react";
import { Lesson } from "@/types";
import { getLessonStatus } from "@/lib/store";

interface LessonStepperProps {
  courseId: string;
  lessons: Lesson[];
  activeLessonId: string;
  onSetActive: (lessonId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddLesson: () => void;
  isReadOnly: boolean;
}

export default function LessonStepper({
  courseId,
  lessons,
  activeLessonId,
  onSetActive,
  onReorder,
  onAddLesson,
  isReadOnly,
}: LessonStepperProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      
      onReorder(oldIndex, newIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
      
      // Arrow keys
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onSetActive(lessons[currentIndex - 1].id);
      } else if (e.key === 'ArrowRight' && currentIndex < lessons.length - 1) {
        onSetActive(lessons[currentIndex + 1].id);
      }
      
      // Cmd/Ctrl + Shift + [ or ]
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === '[' && currentIndex > 0) {
          e.preventDefault();
          onSetActive(lessons[currentIndex - 1].id);
        } else if (e.key === ']' && currentIndex < lessons.length - 1) {
          e.preventDefault();
          onSetActive(lessons[currentIndex + 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLessonId, lessons, onSetActive]);

  return (
    <div className="flex items-center gap-4 px-6 py-4 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map(l => l.id)}
          strategy={horizontalListSortingStrategy}
          disabled={isReadOnly}
        >
          <div className="flex items-center gap-3">
            {lessons.map((lesson, index) => (
              <SortableStep
                key={lesson.id}
                lesson={lesson}
                index={index}
                isActive={lesson.id === activeLessonId}
                onClick={() => onSetActive(lesson.id)}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!isReadOnly && (
        <button
          onClick={onAddLesson}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      )}
    </div>
  );
}

function SortableStep({
  lesson,
  index,
  isActive,
  onClick,
  isReadOnly,
}: {
  lesson: Lesson;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isReadOnly: boolean;
}) {
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

  const status = getLessonStatus(lesson.id);
  const statusConfig = {
    empty: { color: 'bg-gray-200 text-gray-500', label: 'Empty' },
    in_progress: { color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
    ready: { color: 'bg-green-100 text-green-700', label: 'Ready' },
  };
  const config = statusConfig[status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 group relative
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
      `}
    >
      {/* Drag Handle */}
      {!isReadOnly && (
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Step Button */}
      <button
        onClick={onClick}
        className={`
          flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all min-w-[120px]
          ${isActive 
            ? 'bg-indigo-50 border-2 border-indigo-600' 
            : 'border-2 border-gray-200 hover:border-gray-300 bg-white'
          }
        `}
      >
        {/* Number Circle */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
          ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
          {index + 1}
        </div>

        {/* Title */}
        <div className={`text-sm font-medium truncate max-w-[100px] ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
          {lesson.title}
        </div>

        {/* Status Chip */}
        <div className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
          {config.label}
        </div>
      </button>
    </div>
  );
}

