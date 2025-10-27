// Phase I Epic 2: Trainings management page
// ✅ Epic 2 Acceptance: Create training with assignment criteria, auto-generates completions
// ✅ Permissions: Admin/Manager can CRUD trainings; Learner blocked
// ✅ Demo: Create training → see auto-generated completions in compliance table
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import TrainingModal from "@/components/TrainingModal";
import { getTrainings, getCompletionsByTrainingId, deleteTraining, subscribe } from "@/lib/store";
import { Training } from "@/types";

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState(getTrainings());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | undefined>();

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setTrainings(getTrainings());
    });
    return unsubscribe;
  }, []);

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
    setTrainings(getTrainings());
  };

  const getAssignmentSummary = (training: Training): string => {
    const parts: string[] = [];
    
    if (training.assignment.roles && training.assignment.roles.length > 0) {
      parts.push(`Roles: ${training.assignment.roles.join(", ")}`);
    }
    
    if (training.assignment.sites && training.assignment.sites.length > 0) {
      parts.push(`${training.assignment.sites.length} Site(s)`);
    }
    
    if (training.assignment.departments && training.assignment.departments.length > 0) {
      parts.push(`${training.assignment.departments.length} Dept(s)`);
    }
    
    if (training.assignment.users && training.assignment.users.length > 0) {
      parts.push(`${training.assignment.users.length} User(s)`);
    }

    return parts.join(" • ");
  };

  const getCompletionStats = (trainingId: string): { assigned: number; completed: number; overdue: number } => {
    const completions = getCompletionsByTrainingId(trainingId);
    return {
      assigned: completions.filter(c => c.status === "ASSIGNED").length,
      completed: completions.filter(c => c.status === "COMPLETED").length,
      overdue: completions.filter(c => c.status === "OVERDUE").length,
    };
  };

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Trainings</h1>
          <Button variant="primary" onClick={handleCreate}>
            New Training
          </Button>
        </div>

        {trainings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No trainings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new training.
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={handleCreate}>
                  Create First Training
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {trainings.map((training) => {
              const stats = getCompletionStats(training.id);
              return (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                          {training.standardRef && (
                            <p className="text-sm text-primary font-medium mt-1">
                              {training.standardRef}
                            </p>
                          )}
                          {training.description && (
                            <p className="text-sm text-gray-600 mt-2">{training.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Assignment:</span> {getAssignmentSummary(training)}
                        </div>
                        {training.retrainIntervalDays && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Retrain:</span> {training.retrainIntervalDays} days
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="info">{stats.assigned} Assigned</Badge>
                        <Badge variant="success">{stats.completed} Completed</Badge>
                        {stats.overdue > 0 && (
                          <Badge variant="error">{stats.overdue} Overdue</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(training)}
                        className="text-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(training.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

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
