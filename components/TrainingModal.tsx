// Phase I Epic 2: Training create/edit modal
// ✅ Epic 2 Acceptance: Create training with assignment criteria; auto-generates TrainingCompletion rows
// ✅ Demo: Save triggers getUsersForTraining() → creates completions with status=ASSIGNED, dueAt=today+30d
// ✅ Individual User Assignment: Can now assign trainings to specific users by name
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Training, TrainingAssignment, Role, TrainingCompletion, User, getFullName, TrainingCategory, TrainingStatus } from "@/types";
import { getUsers, getSites, getDepartments, createTraining, updateTraining, createCompletion } from "@/lib/store";
import { getUsersForTraining } from "@/lib/assignment";
import { today, addDays } from "@/lib/utils";
import { Search, X, UserPlus, Check, Tag } from "lucide-react";
import Button from "./Button";

const TRAINING_CATEGORIES: TrainingCategory[] = ["Safety", "Compliance", "Onboarding", "Technical", "HR", "Other"];
const TRAINING_STATUSES: TrainingStatus[] = ["active", "draft", "archived"];

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training?: Training;
  onSave: () => void;
}

export default function TrainingModal({ isOpen, onClose, training, onSave }: TrainingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [standardRef, setStandardRef] = useState("");
  const [retrainIntervalDays, setRetrainIntervalDays] = useState<number>(365);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Category, Status, and Tags state
  const [category, setCategory] = useState<TrainingCategory | "">("");
  const [status, setStatus] = useState<TrainingStatus>("active");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();
  
  // Filter departments based on selected sites
  const filteredDepartments = useMemo(() => {
    if (selectedSites.length === 0) {
      // No sites selected - show all departments
      return departments;
    }
    // Filter departments to only those belonging to selected sites
    return departments.filter(dept => selectedSites.includes(dept.siteId));
  }, [departments, selectedSites]);
  
  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users.filter(u => u.role === "LEARNER");
    const query = userSearchQuery.toLowerCase();
    return users.filter(u => {
      const fullName = getFullName(u).toLowerCase();
      const email = u.email.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [users, userSearchQuery]);
  
  // Get selected user objects
  const selectedUserObjects = useMemo(() => {
    return users.filter(u => selectedUsers.includes(u.id));
  }, [users, selectedUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (training) {
      setTitle(training.title);
      setDescription(training.description || "");
      setStandardRef(training.standardRef || "");
      setRetrainIntervalDays(training.retrainIntervalDays || 365);
      setSelectedRoles(training.assignment.roles || []);
      setSelectedSites(training.assignment.sites || []);
      setSelectedDepartments(training.assignment.departments || []);
      setSelectedUsers(training.assignment.users || []);
      setCategory(training.category || "");
      setStatus(training.status || "active");
      setTags(training.tags || []);
    } else {
      resetForm();
    }
  }, [training, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStandardRef("");
    setRetrainIntervalDays(365);
    setSelectedRoles([]);
    setSelectedSites([]);
    setSelectedDepartments([]);
    setSelectedUsers([]);
    setCategory("");
    setStatus("active");
    setTags([]);
    setTagInput("");
    setUserSearchQuery("");
    setShowUserDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignment: TrainingAssignment = {
      roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      sites: selectedSites.length > 0 ? selectedSites : undefined,
      departments: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      users: selectedUsers.length > 0 ? selectedUsers : undefined,
    };

    if (training) {
      // Update existing training
      updateTraining(training.id, {
        title,
        description,
        standardRef,
        retrainIntervalDays,
        assignment,
        category: category || undefined,
        status,
        tags: tags.length > 0 ? tags : undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new training
      const newTraining: Training = {
        id: `tng_${Date.now()}`,
        title,
        description,
        standardRef,
        assignment,
        retrainIntervalDays,
        ownerManagerId: "usr_admin_1", // TODO: use current user
        category: category || undefined,
        status,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createTraining(newTraining);

      // Auto-generate completions for matched users
      const matchedUsers = getUsersForTraining(newTraining, users);
      matchedUsers.forEach(user => {
        const completion: TrainingCompletion = {
          id: `cmp_${Date.now()}_${user.id}`,
          trainingId: newTraining.id,
          userId: user.id,
          status: "ASSIGNED",
          dueAt: addDays(today(), 30), // Default 30 days from today
        };
        createCompletion(completion);
      });
    }

    onSave();
    onClose();
    resetForm();
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites(prev => {
      const newSites = prev.includes(siteId) 
        ? prev.filter(s => s !== siteId) 
        : [...prev, siteId];
      
      // Clear any selected departments that are no longer valid for the new site selection
      if (newSites.length > 0) {
        const validDeptIds = departments
          .filter(d => newSites.includes(d.siteId))
          .map(d => d.id);
        setSelectedDepartments(current => 
          current.filter(deptId => validDeptIds.includes(deptId))
        );
      }
      
      return newSites;
    });
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]
    );
  };
  
  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u !== userId));
  };
  
  // Tag handling
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
    }
    setTagInput("");
  };
  
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };
  
  const getSiteName = (siteId?: string) => {
    if (!siteId) return "";
    const site = sites.find(s => s.id === siteId);
    return site?.name || "";
  };
  
  const getDeptName = (deptId?: string) => {
    if (!deptId) return "";
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div
          className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {training ? "Edit Training" : "Create New Training"}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., Forklift Safety Training"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the training content and objectives..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="standardRef" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Standard Reference
                </label>
                <input
                  type="text"
                  id="standardRef"
                  value={standardRef}
                  onChange={(e) => setStandardRef(e.target.value)}
                  placeholder="e.g., OSHA 1910.147"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="retrainInterval" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Retrain Interval (days)
                </label>
                <input
                  type="number"
                  id="retrainInterval"
                  value={retrainIntervalDays}
                  onChange={(e) => setRetrainIntervalDays(parseInt(e.target.value))}
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TrainingCategory | "")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select category...</option>
                  {TRAINING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TrainingStatus)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {TRAINING_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tags
              </label>
              
              {/* Display existing tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="px-4"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter or click Add to add a tag
              </p>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Assignment Criteria
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Select who should complete this training. You can combine multiple criteria.
              </p>

              <div className="space-y-4">
                {/* Individual Users Section */}
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Specific Users
                  </label>
                  
                  {/* Selected users display */}
                  {selectedUserObjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedUserObjects.map(user => (
                        <span
                          key={user.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          <span>{getFullName(user)}</span>
                          <button
                            type="button"
                            onClick={() => removeUser(user.id)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* User search input */}
                  <div className="relative" ref={userSearchRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Search users by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    
                    {/* User dropdown */}
                    {showUserDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map(user => {
                            const isSelected = selectedUsers.includes(user.id);
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  toggleUser(user.id);
                                  setUserSearchQuery("");
                                }}
                                className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                                  isSelected ? "bg-blue-50" : ""
                                }`}
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {getFullName(user)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {user.email}
                                    {user.siteId && ` • ${getSiteName(user.siteId)}`}
                                    {user.departmentId && ` • ${getDeptName(user.departmentId)}`}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Roles */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">By Role</label>
                  <div className="flex flex-wrap gap-2">
                    {(["ADMIN", "MANAGER", "LEARNER"] as Role[]).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedRoles.includes(role)
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sites */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">By Site</label>
                  <div className="flex flex-wrap gap-2">
                    {sites.map(site => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => toggleSite(site.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSites.includes(site.id)
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {site.name}{site.region && ` (${site.region})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departments - Dynamic based on selected sites */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    By Department
                    {selectedSites.length > 0 && (
                      <span className="ml-2 text-blue-600 font-normal">
                        (filtered by selected sites)
                      </span>
                    )}
                  </label>
                  {filteredDepartments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Select a site above to see available departments
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredDepartments.map(dept => {
                        const site = sites.find(s => s.id === dept.siteId);
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDepartment(dept.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedDepartments.includes(dept.id)
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {dept.name} {site && <span className="opacity-70">({site.name}{site.region && ` - ${site.region}`})</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {training ? "Update Training" : "Create Training"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
