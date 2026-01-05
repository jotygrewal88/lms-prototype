/**
 * RecipientPicker - Searchable user picker with compliance stats
 * Used in the enhanced notification composer for adding individual recipients
 */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Plus, X, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { getUsers, getCompletionsByUserId } from "@/lib/store";
import { User, getFullName } from "@/types";
import { useScope } from "@/hooks/useScope";
import { getScopedData } from "@/lib/stats";
import { buildRecipientContext, RecipientContext } from "@/lib/notifyAI";

export interface RecipientWithStats {
  userId: string;
  name: string;
  email: string;
  role: string;
  stats: {
    overdueCount: number;
    dueSoonCount: number;
    completedCount: number;
    assignedCount: number;
  };
}

interface RecipientPickerProps {
  selectedRecipients: RecipientWithStats[];
  onAddRecipient: (recipient: RecipientWithStats) => void;
  onRemoveRecipient: (userId: string) => void;
  onSelectForPreview: (recipient: RecipientWithStats) => void;
  previewRecipientId?: string;
  maxRecipients?: number;
}

/**
 * Get compliance badge color based on stats
 */
function getComplianceBadgeColor(stats: RecipientWithStats["stats"]): string {
  if (stats.overdueCount > 0) return "text-red-600 bg-red-100";
  if (stats.dueSoonCount > 0) return "text-amber-600 bg-amber-100";
  if (stats.completedCount > 0) return "text-green-600 bg-green-100";
  return "text-gray-400 bg-gray-100";
}

/**
 * Build recipient stats from user
 */
function buildRecipientStats(userId: string): RecipientWithStats["stats"] {
  const ctx = buildRecipientContext(userId);
  if (!ctx) {
    return { overdueCount: 0, dueSoonCount: 0, completedCount: 0, assignedCount: 0 };
  }
  return {
    overdueCount: ctx.overdueCount,
    dueSoonCount: ctx.dueSoonCount,
    completedCount: ctx.completedCount,
    assignedCount: ctx.assignedCount,
  };
}

export default function RecipientPicker({
  selectedRecipients,
  onAddRecipient,
  onRemoveRecipient,
  onSelectForPreview,
  previewRecipientId,
  maxRecipients = 50,
}: RecipientPickerProps) {
  const { scope } = useScope();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all users in scope
  const scopedUsers = useMemo(() => {
    const scoped = getScopedData(scope);
    return scoped.users.filter(u => u.active);
  }, [scope]);

  // Filter users based on search query and exclude already selected
  const filteredUsers = useMemo(() => {
    const selectedIds = new Set(selectedRecipients.map(r => r.userId));
    let users = scopedUsers.filter(u => !selectedIds.has(u.id));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(u => 
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        getFullName(u).toLowerCase().includes(query)
      );
    }

    return users.slice(0, 20); // Limit to 20 results
  }, [scopedUsers, selectedRecipients, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddUser = (user: User) => {
    if (selectedRecipients.length >= maxRecipients) return;

    const stats = buildRecipientStats(user.id);
    const recipient: RecipientWithStats = {
      userId: user.id,
      name: getFullName(user),
      email: user.email,
      role: user.role,
      stats,
    };
    onAddRecipient(recipient);
    setSearchQuery("");
    setIsDropdownOpen(false);
    searchRef.current?.focus();
  };

  const handleAddAllInScope = () => {
    const selectedIds = new Set(selectedRecipients.map(r => r.userId));
    const newRecipients = scopedUsers
      .filter(u => !selectedIds.has(u.id) && u.role === "LEARNER")
      .slice(0, maxRecipients - selectedRecipients.length);

    for (const user of newRecipients) {
      const stats = buildRecipientStats(user.id);
      onAddRecipient({
        userId: user.id,
        name: getFullName(user),
        email: user.email,
        role: user.role,
        stats,
      });
    }
    setIsDropdownOpen(false);
  };

  // Navigate preview through recipients
  const currentPreviewIndex = selectedRecipients.findIndex(r => r.userId === previewRecipientId);
  
  const handlePrevPreview = () => {
    if (currentPreviewIndex > 0) {
      onSelectForPreview(selectedRecipients[currentPreviewIndex - 1]);
    }
  };

  const handleNextPreview = () => {
    if (currentPreviewIndex < selectedRecipients.length - 1) {
      onSelectForPreview(selectedRecipients[currentPreviewIndex + 1]);
    }
  };

  const visibleRecipients = showAllRecipients 
    ? selectedRecipients 
    : selectedRecipients.slice(0, 8);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dropdown Results */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* Add All in Scope Option */}
            {!searchQuery && selectedRecipients.length < maxRecipients && (
              <button
                onClick={handleAddAllInScope}
                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add all learners in scope ({scopedUsers.filter(u => u.role === "LEARNER").length})
              </button>
            )}

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const stats = buildRecipientStats(user.id);
                const badgeColor = getComplianceBadgeColor(stats);
                
                return (
                  <button
                    key={user.id}
                    onClick={() => handleAddUser(user)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Compliance Badge */}
                      <div className={`p-1.5 rounded ${badgeColor}`}>
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getFullName(user)}
                          <span className="ml-2 text-xs text-gray-500 font-normal">{user.role}</span>
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    {/* Stats on hover */}
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stats.overdueCount > 0 && <span className="text-red-600">{stats.overdueCount} overdue</span>}
                      {stats.overdueCount > 0 && stats.dueSoonCount > 0 && " · "}
                      {stats.dueSoonCount > 0 && <span className="text-amber-600">{stats.dueSoonCount} due soon</span>}
                      {(stats.overdueCount === 0 && stats.dueSoonCount === 0 && stats.completedCount > 0) && (
                        <span className="text-green-600">{stats.completedCount} complete</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? "No users found" : "Type to search users"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Recipients */}
      {selectedRecipients.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? "s" : ""} selected</span>
            {selectedRecipients.length > 1 && previewRecipientId && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPreview}
                  disabled={currentPreviewIndex <= 0}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">
                  {currentPreviewIndex + 1} / {selectedRecipients.length}
                </span>
                <button
                  onClick={handleNextPreview}
                  disabled={currentPreviewIndex >= selectedRecipients.length - 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            {visibleRecipients.map((recipient) => {
              const badgeColor = getComplianceBadgeColor(recipient.stats);
              const isPreview = recipient.userId === previewRecipientId;

              return (
                <div
                  key={recipient.userId}
                  onClick={() => onSelectForPreview(recipient)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-all ${
                    isPreview
                      ? "bg-blue-100 text-blue-800 ring-2 ring-blue-500"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                  title={`${recipient.stats.overdueCount} overdue, ${recipient.stats.dueSoonCount} due soon, ${recipient.stats.completedCount} complete`}
                >
                  <div className={`p-0.5 rounded ${badgeColor}`}>
                    <Shield className="w-2.5 h-2.5" />
                  </div>
                  <span>{recipient.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecipient(recipient.userId);
                    }}
                    className="hover:text-red-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {selectedRecipients.length > 8 && !showAllRecipients && (
              <button
                onClick={() => setShowAllRecipients(true)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
              >
                +{selectedRecipients.length - 8} more
              </button>
            )}
            {showAllRecipients && selectedRecipients.length > 8 && (
              <button
                onClick={() => setShowAllRecipients(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedRecipients.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          Search and add recipients above
        </div>
      )}
    </div>
  );
}

