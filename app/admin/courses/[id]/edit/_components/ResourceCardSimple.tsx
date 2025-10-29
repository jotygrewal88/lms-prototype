// Epic 1E: Simplified resource card for stepper layout
"use client";

import React from "react";
import { GripVertical, Eye, Pencil, Trash2, FileText, Link as LinkIcon, FileImage, Video, File } from "lucide-react";
import { Resource } from "@/types";
import { formatFileSize } from "@/lib/uploads";

// Simple time ago formatter
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Get icon and styling for resource type
function getResourceIcon(type: Resource['type']) {
  switch (type) {
    case 'text':
      return <FileText className="w-5 h-5 text-indigo-600" />;
    case 'link':
      return <LinkIcon className="w-5 h-5 text-emerald-600" />;
    case 'image':
      return <FileImage className="w-5 h-5 text-sky-600" />;
    case 'video':
      return <Video className="w-5 h-5 text-rose-600" />;
    case 'pdf':
      return <File className="w-5 h-5 text-amber-600" />;
    default:
      return <File className="w-5 h-5 text-gray-600" />;
  }
}

// Get left accent color for resource type
function getAccentColor(type: Resource['type']): string {
  switch (type) {
    case 'text':
      return 'border-l-indigo-400';
    case 'link':
      return 'border-l-emerald-400';
    case 'image':
      return 'border-l-sky-400';
    case 'video':
      return 'border-l-rose-400';
    case 'pdf':
      return 'border-l-amber-400';
    default:
      return 'border-l-gray-400';
  }
}

// Get background color for type badge
function getTypeBadgeColor(type: Resource['type']): string {
  switch (type) {
    case 'text':
      return 'bg-indigo-50 text-indigo-700';
    case 'link':
      return 'bg-emerald-50 text-emerald-700';
    case 'image':
      return 'bg-sky-50 text-sky-700';
    case 'video':
      return 'bg-rose-50 text-rose-700';
    case 'pdf':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

interface ResourceCardSimpleProps {
  resource: Resource;
  isReadOnly: boolean;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export default function ResourceCardSimple({
  resource,
  isReadOnly,
  onEdit,
  onPreview,
  onDelete,
  dragHandleProps,
}: ResourceCardSimpleProps) {
  const metadata = [];
  if (resource.durationSec) {
    const mins = Math.floor(resource.durationSec / 60);
    const secs = resource.durationSec % 60;
    metadata.push(`${mins}:${secs.toString().padStart(2, '0')}`);
  }
  if (resource.fileSize) metadata.push(formatFileSize(resource.fileSize));
  metadata.push(timeAgo(resource.updatedAt));

  const accentColor = getAccentColor(resource.type);
  const typeBadgeColor = getTypeBadgeColor(resource.type);

  return (
    <div 
      className={`group flex items-center gap-4 p-4 bg-white rounded-lg border-l-2 ${accentColor} shadow-sm hover:shadow-md transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-bottom-2`}
    >
      {/* Drag Handle - Visible on hover */}
      {!isReadOnly && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        {getResourceIcon(resource.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="font-semibold text-gray-900 text-sm truncate">{resource.title}</div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColor}`}>
            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
          </span>
          {metadata.length > 0 && (
            <span className="text-xs text-gray-400">{metadata.join(' • ')}</span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onPreview}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Preview section"
          title="Preview"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
        {!isReadOnly && (
          <>
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-indigo-100 rounded-md transition-colors"
              aria-label="Edit section"
              title="Edit"
            >
              <Pencil className="w-4 h-4 text-indigo-600" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${resource.title}"?`)) {
                  onDelete();
                }
              }}
              className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
              aria-label="Delete section"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

