// Phase I Epic 2 & UI Refresh v2: Trainings management
// ✅ Epic 2 Acceptance: Create training with assignment criteria, auto-generates completions
// ✅ Permissions: Admin/Manager can CRUD trainings; Learner blocked
// ✅ Demo: Create training → see auto-generated completions in compliance table
// ✅ Scope Filtering: Trainings filtered by selected scope
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Paperclip } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Button from "@/components/Button";
import TrainingModal from "@/components/TrainingModal";
import { getCompletionsByTrainingId, deleteTraining, subscribe } from "@/lib/store";
import { Training } from "@/types";
import { useScope } from "@/hooks/useScope";
import { getScopedData } from "@/lib/stats";

export default function TrainingsPage() {
  const { scope } = useScope();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updateData = () => {
      const { trainings: scopedTrainings } = getScopedData(scope);
      setTrainings(scopedTrainings);
    };
    
    updateData();
    const unsubscribe = subscribe(updateData);
    return unsubscribe;
  }, [scope]);

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

  // Filter trainings by search
  const filteredTrainings = useMemo(() => {
    if (!searchQuery.trim()) return trainings;
    const query = searchQuery.toLowerCase();
    return trainings.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.standardRef?.toLowerCase().includes(query)) ||
      (t.description?.toLowerCase().includes(query))
    );
  }, [trainings, searchQuery]);

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
              placeholder="Search trainings by name, standard, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
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
                        {/* Title & Standard */}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {training.title}
                        </h3>
                        {training.standardRef && (
                          <p className="text-sm font-medium text-blue-600 mt-0.5">
                            {training.standardRef}
                          </p>
                        )}
                        
                        {/* Description */}
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-2">{training.description}</p>
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
                        
                        {/* Status Badges */}
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
