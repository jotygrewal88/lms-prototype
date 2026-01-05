// Assign Course Modal - Select and assign courses to a user
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { getCourses, assignCoursesToUser, getCurrentUser, subscribe } from "@/lib/store";
import { User, Course, getFullName } from "@/types";
import { BookOpen, Calendar, Check, Clock, Search, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  existingCourseIds: string[];
  onAssigned?: () => void;
}

type DuePreset = "1week" | "2weeks" | "30days" | "custom" | "none";

export default function AssignCourseModal({ isOpen, onClose, user, existingCourseIds, onAssigned }: Props) {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [duePreset, setDuePreset] = useState<DuePreset>("2weeks");
  const [customDueDate, setCustomDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = () => {
      // Get all published courses, excluding already assigned
      const allCourses = getCourses().filter(
        c => c.status === "published" && !existingCourseIds.includes(c.id)
      );
      setAvailableCourses(allCourses);
    };

    if (isOpen) {
      loadCourses();
      setSelectedCourseIds(new Set());
      setSearchQuery("");
      setDuePreset("2weeks");
      setCustomDueDate("");
      setError(null);
    }

    const unsubscribe = subscribe(loadCourses);
    return unsubscribe;
  }, [isOpen, existingCourseIds]);

  const filteredCourses = availableCourses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.category?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    );
  });

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourseIds);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourseIds(newSelected);
  };

  const selectAll = () => {
    setSelectedCourseIds(new Set(filteredCourses.map(c => c.id)));
  };

  const deselectAll = () => {
    setSelectedCourseIds(new Set());
  };

  const getDueDate = (): string | undefined => {
    if (duePreset === "none") return undefined;
    if (duePreset === "custom" && customDueDate) {
      return new Date(customDueDate).toISOString();
    }
    
    const now = new Date();
    switch (duePreset) {
      case "1week":
        now.setDate(now.getDate() + 7);
        break;
      case "2weeks":
        now.setDate(now.getDate() + 14);
        break;
      case "30days":
        now.setDate(now.getDate() + 30);
        break;
    }
    return now.toISOString();
  };

  const handleSubmit = async () => {
    if (selectedCourseIds.size === 0) {
      setError("Please select at least one course");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const currentUser = getCurrentUser();
      const dueAt = getDueDate();
      
      assignCoursesToUser(
        user.id,
        Array.from(selectedCourseIds),
        currentUser.id,
        dueAt
      );

      onAssigned?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to assign courses");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Courses to ${getFullName(user)}`}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Selection controls */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {selectedCourseIds.size} of {availableCourses.length} courses selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-gray-600 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Course list */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No available courses to assign</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            filteredCourses.map(course => {
              const isSelected = selectedCourseIds.has(course.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => toggleCourse(course.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? "bg-emerald-500 border-emerald-500" 
                      : "border-gray-300"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {course.category && (
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">{course.category}</span>
                      )}
                      {course.estimatedMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(course.estimatedMinutes)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Due date selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            Due Date
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { value: "1week", label: "1 Week" },
              { value: "2weeks", label: "2 Weeks" },
              { value: "30days", label: "30 Days" },
              { value: "custom", label: "Custom" },
              { value: "none", label: "No Due Date" },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuePreset(option.value as DuePreset)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  duePreset === option.value
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {duePreset === "custom" && (
            <input
              type="date"
              value={customDueDate}
              onChange={(e) => setCustomDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={selectedCourseIds.size === 0 || isSubmitting}
          >
            {isSubmitting ? "Assigning..." : `Assign ${selectedCourseIds.size} Course${selectedCourseIds.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


