/**
 * Manual Training Import Modal
 * Allows admins to manually create training completion records for employees.
 * Supports multi-employee, multi-training selection with status options.
 */
"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Search,
  X,
  Calendar,
  AlertCircle
} from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { getUsers, getTrainings, getSites, getDepartments, createCompletion } from "@/lib/store";
import { logChange } from "@/lib/changeLog";
import { User, Training, TrainingCompletion, CompletionStatus, getFullName } from "@/types";

interface ManualTrainingImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (created: number) => void;
}

interface TrainingDetails {
  trainingId: string;
  status: "ASSIGNED" | "COMPLETED";
  dueAt: string;
  completedAt?: string;
  expiresAt?: string;
  notes?: string;
}

type Step = 1 | 2 | 3;

export default function ManualTrainingImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ManualTrainingImportModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedTrainingIds, setSelectedTrainingIds] = useState<Set<string>>(new Set());
  const [trainingDetails, setTrainingDetails] = useState<Map<string, TrainingDetails>>(new Map());
  
  // Search/filter states
  const [userSearch, setUserSearch] = useState("");
  const [userSiteFilter, setUserSiteFilter] = useState("");
  const [userDeptFilter, setUserDeptFilter] = useState("");
  const [trainingSearch, setTrainingSearch] = useState("");

  const users = getUsers();
  const trainings = getTrainings();
  const sites = getSites();
  const departments = getDepartments();

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = userSearch === "" || 
        getFullName(user).toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesSite = userSiteFilter === "" || user.siteId === userSiteFilter;
      const matchesDept = userDeptFilter === "" || user.departmentId === userDeptFilter;
      return matchesSearch && matchesSite && matchesDept && user.role === "LEARNER";
    });
  }, [users, userSearch, userSiteFilter, userDeptFilter]);

  // Filter trainings based on search
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      return trainingSearch === "" || 
        training.title.toLowerCase().includes(trainingSearch.toLowerCase());
    });
  }, [trainings, trainingSearch]);

  const getSiteName = (siteId?: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return "—";
    return site.region ? `${site.name} (${site.region})` : site.name;
  };
  const getDeptName = (deptId?: string) => departments.find(d => d.id === deptId)?.name || "—";

  const handleUserToggle = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const handleTrainingToggle = (trainingId: string) => {
    const newSet = new Set(selectedTrainingIds);
    const newDetails = new Map(trainingDetails);
    
    if (newSet.has(trainingId)) {
      newSet.delete(trainingId);
      newDetails.delete(trainingId);
    } else {
      newSet.add(trainingId);
      // Initialize default details
      const training = trainings.find(t => t.id === trainingId);
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      
      newDetails.set(trainingId, {
        trainingId,
        status: "ASSIGNED",
        dueAt: defaultDueDate.toISOString().split("T")[0],
        completedAt: undefined,
        expiresAt: undefined,
        notes: "",
      });
    }
    
    setSelectedTrainingIds(newSet);
    setTrainingDetails(newDetails);
  };

  const handleDetailChange = (trainingId: string, field: keyof TrainingDetails, value: string) => {
    const newDetails = new Map(trainingDetails);
    const current = newDetails.get(trainingId);
    if (current) {
      const updated = { ...current, [field]: value };
      
      // Auto-calculate expiry date when completed date is set
      if (field === "completedAt" && value) {
        const training = trainings.find(t => t.id === trainingId);
        if (training?.retrainIntervalDays) {
          const completedDate = new Date(value);
          completedDate.setDate(completedDate.getDate() + training.retrainIntervalDays);
          updated.expiresAt = completedDate.toISOString().split("T")[0];
        }
      }
      
      // Clear completed date fields if switching to ASSIGNED
      if (field === "status" && value === "ASSIGNED") {
        updated.completedAt = undefined;
        updated.expiresAt = undefined;
      }
      
      newDetails.set(trainingId, updated);
      setTrainingDetails(newDetails);
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSelectAllTrainings = () => {
    if (selectedTrainingIds.size === filteredTrainings.length) {
      setSelectedTrainingIds(new Set());
      setTrainingDetails(new Map());
    } else {
      const newSet = new Set(filteredTrainings.map(t => t.id));
      const newDetails = new Map<string, TrainingDetails>();
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      
      filteredTrainings.forEach(training => {
        newDetails.set(training.id, {
          trainingId: training.id,
          status: "ASSIGNED",
          dueAt: defaultDueDate.toISOString().split("T")[0],
          completedAt: undefined,
          expiresAt: undefined,
          notes: "",
        });
      });
      
      setSelectedTrainingIds(newSet);
      setTrainingDetails(newDetails);
    }
  };

  const validateStep3 = (): boolean => {
    for (const [trainingId, details] of trainingDetails) {
      if (details.status === "ASSIGNED" && !details.dueAt) {
        return false;
      }
      if (details.status === "COMPLETED" && !details.completedAt) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    let createdCount = 0;
    const now = new Date().toISOString();

    selectedUserIds.forEach(userId => {
      trainingDetails.forEach((details, trainingId) => {
        const completionId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        const completion: TrainingCompletion = {
          id: completionId,
          trainingId,
          userId,
          status: details.status as CompletionStatus,
          dueAt: details.dueAt,
          completedAt: details.status === "COMPLETED" ? details.completedAt : undefined,
          expiresAt: details.expiresAt,
          notes: details.notes || undefined,
        };

        createCompletion(completion);
        
        const training = trainings.find(t => t.id === trainingId);
        const user = users.find(u => u.id === userId);
        
        logChange(
          completionId,
          `Manual Import: Created ${details.status.toLowerCase()} record for ${getFullName(user!)} - ${training?.title}`,
          { action: "historic_import" }
        );
        
        createdCount++;
      });
    });

    onImportComplete(createdCount);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedUserIds(new Set());
    setSelectedTrainingIds(new Set());
    setTrainingDetails(new Map());
    setUserSearch("");
    setUserSiteFilter("");
    setUserDeptFilter("");
    setTrainingSearch("");
    onClose();
  };

  const canProceed = () => {
    if (step === 1) return selectedUserIds.size > 0;
    if (step === 2) return selectedTrainingIds.size > 0;
    if (step === 3) return validateStep3();
    return false;
  };

  const totalRecords = selectedUserIds.size * selectedTrainingIds.size;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Training Record" size="xl">
      <div className="min-h-[500px] flex flex-col">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === 1 ? "bg-primary text-white" : step > 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              <span>Employees</span>
              {selectedUserIds.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{selectedUserIds.size}</span>}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === 2 ? "bg-primary text-white" : step > 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>Trainings</span>
              {selectedTrainingIds.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{selectedTrainingIds.size}</span>}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === 3 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            }`}>
              <ClipboardList className="w-4 h-4" />
              <span>Details</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {/* Step 1: Select Employees */}
          {step === 1 && (
            <div className="h-full flex flex-col">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <select
                  value={userSiteFilter}
                  onChange={(e) => setUserSiteFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Sites</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}{site.region && ` (${site.region})`}</option>
                  ))}
                </select>
                <select
                  value={userDeptFilter}
                  onChange={(e) => setUserDeptFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {filteredUsers.length} employee{filteredUsers.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={handleSelectAllUsers}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {selectedUserIds.size === filteredUsers.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No employees match your filters
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map(user => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedUserIds.has(user.id) ? "bg-primary/5" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{getFullName(user)}</div>
                          <div className="text-sm text-gray-500 truncate">{user.email}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-600">{getSiteName(user.siteId)}</div>
                          <div className="text-gray-400">{getDeptName(user.departmentId)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Trainings */}
          {step === 2 && (
            <div className="h-full flex flex-col">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trainings..."
                    value={trainingSearch}
                    onChange={(e) => setTrainingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {filteredTrainings.length} training{filteredTrainings.length !== 1 ? "s" : ""} available
                </span>
                <button
                  onClick={handleSelectAllTrainings}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {selectedTrainingIds.size === filteredTrainings.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredTrainings.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No trainings found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredTrainings.map(training => (
                      <label
                        key={training.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedTrainingIds.has(training.id) ? "bg-primary/5" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTrainingIds.has(training.id)}
                          onChange={() => handleTrainingToggle(training.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{training.title}</div>
                          {training.description && (
                            <div className="text-sm text-gray-500 truncate">{training.description}</div>
                          )}
                        </div>
                        {training.retrainIntervalDays && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            Retrain: {training.retrainIntervalDays}d
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Training Details */}
          {step === 3 && (
            <div className="h-full flex flex-col">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Configure details for <strong>{selectedTrainingIds.size}</strong> training{selectedTrainingIds.size !== 1 ? "s" : ""} × <strong>{selectedUserIds.size}</strong> employee{selectedUserIds.size !== 1 ? "s" : ""} = <strong>{totalRecords}</strong> record{totalRecords !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {Array.from(selectedTrainingIds).map(trainingId => {
                  const training = trainings.find(t => t.id === trainingId);
                  const details = trainingDetails.get(trainingId);
                  if (!training || !details) return null;

                  const isCompleted = details.status === "COMPLETED";

                  return (
                    <div key={trainingId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{training.title}</h4>
                          {training.retrainIntervalDays && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Retraining interval: {training.retrainIntervalDays} days
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleTrainingToggle(trainingId)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={details.status}
                            onChange={(e) => handleDetailChange(trainingId, "status", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          >
                            <option value="ASSIGNED">Assigned (Pending)</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>

                        {/* Due Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date {!isCompleted && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              value={details.dueAt}
                              onChange={(e) => handleDetailChange(trainingId, "dueAt", e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Completed Date - only shown when status is COMPLETED */}
                        {isCompleted && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Completed Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="date"
                                value={details.completedAt || ""}
                                onChange={(e) => handleDetailChange(trainingId, "completedAt", e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}

                        {/* Expiry Date - only shown when status is COMPLETED */}
                        {isCompleted && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                              {training.retrainIntervalDays && (
                                <span className="text-xs text-gray-400 ml-1">(auto-calculated)</span>
                              )}
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="date"
                                value={details.expiresAt || ""}
                                onChange={(e) => handleDetailChange(trainingId, "expiresAt", e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}

                        {/* Notes - full width */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes <span className="text-gray-400 text-xs">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={details.notes || ""}
                            onChange={(e) => handleDetailChange(trainingId, "notes", e.target.value)}
                            placeholder="Add any relevant notes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!validateStep3() && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Please fill in all required fields for each training.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div>
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep((step - 1) as Step)}>
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button 
                variant="primary" 
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={!canProceed()}
              >
                <Check className="w-4 h-4" />
                Create {totalRecords} Record{totalRecords !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
