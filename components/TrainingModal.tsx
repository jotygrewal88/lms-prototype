// Phase I Epic 2: Training create/edit modal
// ✅ Epic 2 Acceptance: Create training with assignment criteria; auto-generates TrainingCompletion rows
// ✅ Demo: Save triggers getUsersForTraining() → creates completions with status=ASSIGNED, dueAt=today+30d
"use client";

import React, { useState, useEffect } from "react";
import { Training, TrainingAssignment, Role, TrainingCompletion } from "@/types";
import { getUsers, getSites, getDepartments, createTraining, updateTraining, createCompletion } from "@/lib/store";
import { getUsersForTraining } from "@/lib/assignment";
import { today, addDays } from "@/lib/utils";
import Button from "./Button";

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

  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

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
    setSelectedSites(prev =>
      prev.includes(siteId) ? prev.filter(s => s !== siteId) : [...prev, siteId]
    );
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {training ? "Edit Training" : "Create New Training"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="standardRef" className="block text-sm font-medium text-gray-700 mb-1">
                Standard Reference
              </label>
              <input
                type="text"
                id="standardRef"
                value={standardRef}
                onChange={(e) => setStandardRef(e.target.value)}
                placeholder="e.g., OSHA 1910.147"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="retrainInterval" className="block text-sm font-medium text-gray-700 mb-1">
                Retrain Interval (days)
              </label>
              <input
                type="number"
                id="retrainInterval"
                value={retrainIntervalDays}
                onChange={(e) => setRetrainIntervalDays(parseInt(e.target.value))}
                min="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Criteria *
              </label>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {(["ADMIN", "MANAGER", "LEARNER"] as Role[]).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          selectedRoles.includes(role)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sites</label>
                  <div className="flex flex-wrap gap-2">
                    {sites.map(site => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => toggleSite(site.id)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          selectedSites.includes(site.id)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {site.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Departments</label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map(dept => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => toggleDepartment(dept.id)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          selectedDepartments.includes(dept.id)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {dept.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary">
                {training ? "Update Training" : "Create Training"}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

