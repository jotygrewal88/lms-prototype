"use client";

import { useState } from "react";
import { X, RotateCcw, Clock, User, Sparkles, AlertTriangle } from "lucide-react";
import { VersionSnapshot, AuditEvent, VersionedEntityType, AiAction } from "@/types";
import { listHistory, restoreVersion, getCurrentUser } from "@/lib/store";
import Button from "../Button";
import Badge from "../Badge";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: VersionedEntityType;
  entityId: string;
  isReadOnly: boolean;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  entityType,
  entityId,
  isReadOnly,
}: HistoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<'versions' | 'audit'>('versions');
  const { snapshots, audits } = listHistory(entityType, entityId);

  const handleRestore = (snapshotId: string, summary: string) => {
    if (isReadOnly) return;
    
    if (confirm(`Restore to: "${summary}"?\n\nThis will replace the current state.`)) {
      const result = restoreVersion(snapshotId);
      if (result) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">History</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} version history and audit trail
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('versions')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'versions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Versions ({snapshots.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Audit Log ({audits.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'versions' ? (
            <VersionsList
              snapshots={snapshots}
              onRestore={handleRestore}
              isReadOnly={isReadOnly}
            />
          ) : (
            <AuditList audits={audits} />
          )}
        </div>
      </div>
    </div>
  );
}

// Time ago helper
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Versions List Sub-component
function VersionsList({
  snapshots,
  onRestore,
  isReadOnly,
}: {
  snapshots: VersionSnapshot[];
  onRestore: (id: string, summary: string) => void;
  isReadOnly: boolean;
}) {
  if (snapshots.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No version history yet</h3>
        <p className="text-sm text-gray-500">
          Versions will be saved when AI generates or modifies content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {snapshots.map((snapshot, index) => (
        <div
          key={snapshot.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-center gap-2 mb-2">
                {snapshot.cause === 'ai' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                )}
                {snapshot.cause === 'manual' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    <User className="w-3 h-3" />
                    Manual
                  </span>
                )}
                {snapshot.aiAction && (
                  <span className="text-xs text-gray-500">
                    {formatAiAction(snapshot.aiAction)}
                  </span>
                )}
              </div>

              {/* Summary */}
              <p className="text-sm font-medium text-gray-900 mb-1">{snapshot.summary}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{timeAgo(snapshot.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {snapshot.createdBy}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              {!isReadOnly ? (
                <Button
                  variant="secondary"
                  onClick={() => onRestore(snapshot.id, snapshot.summary)}
                  className="text-xs px-3 py-1.5"
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Restore
                </Button>
              ) : (
                <div className="text-xs text-gray-400 italic">Read-only</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Audit List Sub-component
function AuditList({ audits }: { audits: AuditEvent[] }) {
  if (audits.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit events yet</h3>
        <p className="text-sm text-gray-500">
          Audit trail will track all actions performed on this entity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {audits.map((audit) => (
        <div
          key={audit.id}
          className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Action Badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                  getActionBadgeColor(audit.action)
                }`}>
                  {formatAuditAction(audit.action)}
                </span>
              </div>

              {/* Meta Info */}
              {audit.meta && Object.keys(audit.meta).length > 0 && (
                <div className="text-xs text-gray-600 mb-1.5">
                  {audit.meta.prompt && (
                    <div className="truncate">
                      <strong>Prompt:</strong> "{audit.meta.prompt.substring(0, 80)}{audit.meta.prompt.length > 80 ? '...' : ''}"
                    </div>
                  )}
                  {audit.meta.filename && (
                    <div>
                      <strong>File:</strong> {audit.meta.filename}
                    </div>
                  )}
                  {audit.meta.lessonCount !== undefined && (
                    <div>
                      <strong>Lessons:</strong> {audit.meta.lessonCount}
                    </div>
                  )}
                  {audit.meta.hasQuiz !== undefined && (
                    <div>
                      <strong>Quiz:</strong> {audit.meta.hasQuiz ? 'Yes' : 'No'}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{timeAgo(audit.at)}</span>
                <span>•</span>
                <User className="w-3 h-3" />
                <span>{audit.byUserId}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function formatAiAction(action: AiAction): string {
  const labels: Record<AiAction, string> = {
    ai_generate_course: 'Generate Course',
    ai_generate_from_file: 'Generate from File',
    ai_regenerate: 'Regenerate',
    ai_rewrite: 'Rewrite',
    ai_expand: 'Expand',
    ai_simplify: 'Simplify',
    ai_add_quiz: 'Add Quiz',
    ai_autofill_metadata: 'Autofill Metadata',
  };
  return labels[action] || action;
}

function formatAuditAction(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getActionBadgeColor(action: string): string {
  if (action.startsWith('ai_')) {
    return 'bg-purple-50 text-purple-700';
  }
  if (action === 'undo') {
    return 'bg-amber-50 text-amber-700';
  }
  if (action === 'redo') {
    return 'bg-blue-50 text-blue-700';
  }
  if (action === 'manual_edit') {
    return 'bg-gray-100 text-gray-700';
  }
  return 'bg-gray-100 text-gray-600';
}

