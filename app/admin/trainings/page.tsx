// Phase I Epic 2 & UI Refresh v2: Trainings management
// ✅ Epic 2 Acceptance: Create training with assignment criteria, auto-generates completions
// ✅ Permissions: Admin/Manager can CRUD trainings; Learner blocked
// ✅ Demo: Create training → see auto-generated completions in compliance table
// ✅ Scope Filtering: Trainings filtered by selected scope
// ✅ Filters: Status, Category, Tags filtering with pills
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Paperclip, X, ChevronDown, Tag } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Button from "@/components/Button";
import TrainingModal from "@/components/TrainingModal";
import { getCompletionsByTrainingId, deleteTraining, subscribe } from "@/lib/store";
import { Training, TrainingCategory, TrainingStatus } from "@/types";
import { useScope } from "@/hooks/useScope";
import { getScopedData } from "@/lib/stats";

const TRAINING_CATEGORIES: TrainingCategory[] = ["Safety", "Compliance", "Onboarding", "Technical", "HR", "Other"];
const TRAINING_STATUSES: TrainingStatus[] = ["active", "draft", "archived"];

// Category color mapping for visual distinction
const CATEGORY_COLORS: Record<TrainingCategory, { bg: string; text: string }> = {
  Safety: { bg: "bg-red-100", text: "text-red-800" },
  Compliance: { bg: "bg-amber-100", text: "text-amber-800" },
  Onboarding: { bg: "bg-green-100", text: "text-green-800" },
  Technical: { bg: "bg-blue-100", text: "text-blue-800" },
  HR: { bg: "bg-purple-100", text: "text-purple-800" },
  Other: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function TrainingsPage() {
  const { scope } = useScope();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<"" | TrainingStatus>("");
  const [filterCategory, setFilterCategory] = useState<"" | TrainingCategory>("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const { trainings: scopedTrainings } = getScopedData(scope);
      setTrainings(scopedTrainings);
    };
    
    updateData();
    const unsubscribe = subscribe(updateData);
    return unsubscribe;
  }, [scope]);

  // Close tags dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-tags-dropdown]')) {
        setIsTagsDropdownOpen(false);
      }
    };
    
    if (isTagsDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isTagsDropdownOpen]);

  const handleCreate = () => {
    setSelectedTraining(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (training: Training) => {
    setSelectedTraining(training);
    setIsModalOpen(true);
  };

  const handleDelete = (trainingId: string) => {
    if (confirm("Are you sure you want to delete this training? All associated completions will be removed.")) {
      deleteTraining(trainingId);
    }
  };

  const handleModalSave = () => {
    const { trainings: scopedTrainings } = getScopedData(scope);
    setTrainings(scopedTrainings);
  };

  const getAssignmentText = (training: Training): string => {
    const parts: string[] = [];
    
    if (training.assignment.roles && training.assignment.roles.length > 0) {
      parts.push(`Roles: ${training.assignment.roles.join(", ")}`);
    }
    
    if (training.assignment.departments && training.assignment.departments.length > 0) {
      parts.push(`${training.assignment.departments.length} Dept(s)`);
    }
    
    if (training.assignment.users && training.assignment.users.length > 0) {
      parts.push(`${training.assignment.users.length} User(s)`);
    }

    return parts.join("   ") || "Not assigned";
  };

  const getCompletionStats = (trainingId: string) => {
    const completions = getCompletionsByTrainingId(trainingId);
    const assigned = completions.filter(c => c.status === "ASSIGNED").length;
    const completed = completions.filter(c => c.status === "COMPLETED").length;
    const overdue = completions.filter(c => c.status === "OVERDUE").length;
    
    return { assigned, completed, overdue };
  };

  // Get all unique tags from trainings
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    trainings.forEach(t => {
      t.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [trainings]);

  // Check if any filters are active
  const hasActiveFilters = filterStatus || filterCategory || filterTags.length > 0 || searchQuery.trim();

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterTags([]);
    setSearchQuery("");
  };

  // Toggle a tag filter
  const toggleTagFilter = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Filter trainings by search and filters
  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      // By default, hide archived trainings unless explicitly filtered
      if (!filterStatus && t.status === "archived") return false;
      
      // Status filter
      if (filterStatus && t.status !== filterStatus) return false;
      
      // Category filter
      if (filterCategory && t.category !== filterCategory) return false;
      
      // Tags filter (training must have ALL selected tags)
      if (filterTags.length > 0) {
        const trainingTags = t.tags || [];
        if (!filterTags.every(tag => trainingTags.includes(tag))) return false;
      }
      
      // Search filter - matches title, standardRef, description, or tags
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesStandard = t.standardRef?.toLowerCase().includes(query);
        const matchesDescription = t.description?.toLowerCase().includes(query);
        const matchesTags = t.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesStandard && !matchesDescription && !matchesTags) return false;
      }
      
      return true;
    });
  }, [trainings, searchQuery, filterStatus, filterCategory, filterTags]);

  return (
    <RouteGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trainings</h1>
              <p className="text-gray-500 mt-1">Define training requirements and assign them to your workforce</p>
            </div>
            <Button variant="primary" onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Training
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainings by name, standard, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "" | TrainingStatus)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Statuses</option>
                {TRAINING_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as "" | TrainingCategory)}
                className="w-full appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Categories</option>
                {TRAINING_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Tags Filter (Multi-select dropdown) */}
            <div className="relative" data-tags-dropdown>
              <button
                type="button"
                onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <span className={filterTags.length > 0 ? "text-gray-900" : "text-gray-500"}>
                  {filterTags.length > 0 ? `${filterTags.length} tag${filterTags.length > 1 ? 's' : ''} selected` : "All Tags"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isTagsDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {allTags.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No tags available</div>
                  ) : (
                    allTags.map(tag => (
                      <label
                        key={tag}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filterTags.includes(tag)}
                          onChange={() => toggleTagFilter(tag)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters & Results Count */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {filteredTrainings.length} of {trainings.filter(t => filterStatus === "archived" || t.status !== "archived").length} trainings
            </span>
            
            {hasActiveFilters && (
              <>
                <span className="text-gray-300">|</span>
                
                {/* Active filter pills */}
                {filterStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    <button onClick={() => setFilterStatus("")} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filterCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Category: {filterCategory}
                    <button onClick={() => setFilterCategory("")} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filterTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button onClick={() => toggleTagFilter(tag)} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Search: &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear All
                </button>
              </>
            )}
          </div>

          {/* Training List */}
          <div className="space-y-4">
            {filteredTrainings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No trainings found" : "No trainings yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : "Get started by creating your first training program."}
                </p>
                {!searchQuery && (
                  <Button variant="primary" onClick={handleCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Training
                  </Button>
                )}
              </div>
            ) : (
              filteredTrainings.map((training) => {
                const stats = getCompletionStats(training.id);
                
                return (
                  <div 
                    key={training.id} 
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title Row with Status & Category */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {training.title}
                          </h3>
                          {/* Training Status Badge */}
                          {training.status === "active" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {training.status === "draft" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                          {training.status === "archived" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              Archived
                            </span>
                          )}
                          {/* Category Badge */}
                          {training.category && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[training.category].bg} ${CATEGORY_COLORS[training.category].text}`}>
                              {training.category}
                            </span>
                          )}
                        </div>
                        {training.standardRef && (
                          <p className="text-sm font-medium text-blue-600 mt-0.5">
                            {training.standardRef}
                          </p>
                        )}
                        
                        {/* Description */}
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-2">{training.description}</p>
                        )}

                        {/* Tags */}
                        {training.tags && training.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {training.tags.map(tag => (
                              <span
                                key={tag}
                                onClick={() => toggleTagFilter(tag)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Assignment & Retrain Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                          <span>
                            <span className="text-gray-500">Assignment:</span>{" "}
                            {getAssignmentText(training)}
                          </span>
                          {training.retrainIntervalDays && (
                            <span>
                              <span className="text-gray-500">Retrain:</span>{" "}
                              {training.retrainIntervalDays} days
                            </span>
                          )}
                          {training.policyUrl && (
                            <a
                              href={training.policyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              Policy
                            </a>
                          )}
                        </div>
                        
                        {/* Completion Status Badges */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {stats.assigned} Assigned
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {stats.completed} Completed
                          </span>
                          {stats.overdue > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                              {stats.overdue} Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(training)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(training.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <TrainingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            training={selectedTraining}
            onSave={handleModalSave}
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
