// Epic 1D: Resource card with preview, inline editing, and actions
"use client";

import React, { useState, useEffect } from "react";
import { GripVertical, Trash2, Upload, ChevronDown, ChevronUp, Library, AlertCircle } from "lucide-react";
import { Resource } from "@/types";
import ResourcePreview from "./ResourcePreview";
import InlineEditable from "./InlineEditable";
import Badge from "./Badge";
import Button from "./Button";
import { formatFileSize } from "@/lib/uploads";
import { getNewerVersion, updateResource } from "@/lib/store";

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

interface ResourceCardProps {
  resource: Resource;
  onUpdate: (id: string, patch: Partial<Pick<Resource, 'title' | 'content'>>) => void;
  onDelete: (id: string) => void;
  onReplace?: (id: string) => void;
  isManager: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  onLibraryUpdate?: () => void;
}

export default function ResourceCard({
  resource,
  onUpdate,
  onDelete,
  onReplace,
  isManager,
  isDragging = false,
  dragHandleProps,
  onLibraryUpdate,
}: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewerVersion, setHasNewerVersion] = useState(false);
  
  useEffect(() => {
    if (resource.libraryItemId) {
      const newerVersion = getNewerVersion(resource.libraryItemId);
      setHasNewerVersion(!!newerVersion);
    } else {
      setHasNewerVersion(false);
    }
  }, [resource.libraryItemId]);
  
  const handleUpdateToNewerVersion = () => {
    if (!resource.libraryItemId) return;
    
    const newerVersion = getNewerVersion(resource.libraryItemId);
    if (newerVersion) {
      // Update resource to point to newer version
      updateResource(resource.id, {
        libraryItemId: newerVersion.id,
        title: newerVersion.title,
        url: newerVersion.url,
        content: newerVersion.description,
      });
      onLibraryUpdate?.();
    }
  };

  const canReplace = !isManager && 
    onReplace && 
    (resource.type === 'image' || resource.type === 'video' || resource.type === 'pdf') &&
    resource.url?.startsWith('/uploads/');

  const isText = resource.type === 'text';

  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all
        ${isDragging ? 'shadow-lg scale-105 opacity-50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {!isManager && dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing mt-0.5"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header: Title + Type Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <InlineEditable
                value={resource.title}
                onSave={(newTitle) => onUpdate(resource.id, { title: newTitle })}
                disabled={isManager}
                className="font-medium text-gray-900 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {resource.libraryItemId && (
                <Badge className="text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Library className="w-3 h-3" />
                  from Library
                </Badge>
              )}
              <Badge className="text-xs capitalize">{resource.type}</Badge>
            </div>
          </div>
          
          {/* Newer Version Warning */}
          {hasNewerVersion && !isManager && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs text-yellow-800 flex-1">Newer version available</span>
              <Button
                variant="secondary"
                onClick={handleUpdateToNewerVersion}
                className="text-xs py-1 px-2 h-auto"
              >
                Update
              </Button>
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            {resource.fileName && (
              <>
                <span className="truncate max-w-[200px]" title={resource.fileName}>
                  {resource.fileName}
                </span>
                <span>•</span>
              </>
            )}
            {resource.fileSize && (
              <>
                <span>{formatFileSize(resource.fileSize)}</span>
                <span>•</span>
              </>
            )}
            {resource.mimeType && (
              <>
                <span className="truncate max-w-[150px]" title={resource.mimeType}>
                  {resource.mimeType}
                </span>
                <span>•</span>
              </>
            )}
            {resource.durationSec && resource.durationSec > 0 && (
              <>
                <span>
                  {Math.floor(resource.durationSec / 60)}:{(resource.durationSec % 60).toString().padStart(2, '0')}
                </span>
                <span>•</span>
              </>
            )}
            <span title={new Date(resource.updatedAt).toLocaleString()}>
              Updated {timeAgo(resource.updatedAt)}
            </span>
          </div>

          {/* Preview */}
          {!isText && (
            <div className="mt-2">
              <ResourcePreview resource={resource} size="small" />
            </div>
          )}

          {/* Text Content (Expandable) */}
          {isText && (
            <div className="mt-2">
              {isExpanded ? (
                <div className="space-y-2">
                  <InlineEditable
                    value={resource.content || ''}
                    onSave={(newContent) => onUpdate(resource.id, { content: newContent })}
                    disabled={isManager}
                    multiline
                    placeholder="Enter content..."
                    className="text-sm text-gray-600"
                  />
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    <ChevronUp className="w-3 h-3" />
                    Collapse
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {resource.content || <span className="text-gray-400">No content</span>}
                  </div>
                  {!isManager && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <ChevronDown className="w-3 h-3" />
                      Expand to edit
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isManager && (
          <div className="flex-shrink-0 flex gap-1">
            {canReplace && (
              <button
                onClick={() => onReplace?.(resource.id)}
                className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                title="Replace file"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Delete "${resource.title}"?`)) {
                  onDelete(resource.id);
                }
              }}
              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

