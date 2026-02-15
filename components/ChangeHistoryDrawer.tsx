/**
 * PHASE I POLISH PACK ACCEPTANCE CHECKLIST:
 * ✓ Displays timeline of changes for a TrainingCompletion
 * ✓ Shows timestamp, user, action, summary
 * ✓ Styled with icons for different action types
 * ✓ Real-time updates via store subscription
 * ✓ UI Refresh v2: lucide icons, no emojis
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  RefreshCw, 
  Calendar, 
  CheckCircle, 
  Ban, 
  Paperclip, 
  Package, 
  FileText 
} from "lucide-react";
import { getChangeLogsByEntityId, getUser, subscribe } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { getFullName } from "@/types";

interface ChangeHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  completionId: string;
}

export default function ChangeHistoryDrawer({
  isOpen,
  onClose,
  completionId,
}: ChangeHistoryDrawerProps) {
  const [logs, setLogs] = useState(getChangeLogsByEntityId(completionId));

  useEffect(() => {
    if (!isOpen) return;

    setLogs(getChangeLogsByEntityId(completionId));

    const unsubscribe = subscribe(() => {
      setLogs(getChangeLogsByEntityId(completionId));
    });

    return unsubscribe;
  }, [isOpen, completionId]);

  if (!isOpen) return null;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const getActionIcon = (action?: string) => {
    const iconClass = "w-5 h-5";
    switch (action) {
      case "status_change":
        return <RefreshCw className={iconClass + " text-blue-500"} />;
      case "due_date_change":
        return <Calendar className={iconClass + " text-purple-500"} />;
      case "completion_logged":
        return <CheckCircle className={iconClass + " text-green-500"} />;
      case "exempt":
        return <Ban className={iconClass + " text-orange-500"} />;
      case "proof_added":
        return <Paperclip className={iconClass + " text-teal-500"} />;
      case "bulk_op":
        return <Package className={iconClass + " text-indigo-500"} />;
      default:
        return <FileText className={iconClass + " text-gray-500"} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Change History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close drawer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {sortedLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No history recorded for this completion.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedLogs.map((log) => {
                const user = getUser(log.byUserId);
                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {getActionIcon(log.metadata?.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.summary}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user ? <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">{getFullName(user)}</Link> : "Unknown User"} • {formatDate(log.at)}
                      </p>
                      {log.metadata?.reason && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          Reason: {log.metadata.reason}
                        </p>
                      )}
                      {log.metadata?.oldValue && log.metadata?.newValue && (
                        <p className="text-xs text-gray-600 mt-1">
                          Changed from <span className="font-mono bg-gray-100 px-1 rounded">{log.metadata.oldValue}</span> to{" "}
                          <span className="font-mono bg-gray-100 px-1 rounded">{log.metadata.newValue}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
