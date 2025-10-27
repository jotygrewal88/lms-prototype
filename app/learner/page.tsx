// Phase I Epic 4: Learner Dashboard (Basic)
/**
 * ACCEPTANCE CHECKLIST (Epic 4):
 * ✓ Dashboard shows only current learner's trainings with status, due info, site/department
 * ✓ Progress ring and stat chips compute correctly
 * ✓ Filters (All/Due Soon/Overdue/Completed) work with empty states
 * ✓ "View details" links to training detail page
 * ✓ Confetti fires at 100% completion
 * ✓ Permissions: Learner cannot access admin routes
 * ✓ No Phase II features
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import ProgressRing from "@/components/ProgressRing";
import Confetti from "@/components/Confetti";
import { 
  getCurrentUser, 
  getCompletionsByUserId, 
  getTrainingById,
  getUsers,
  getSites,
  getDepartments,
  subscribe 
} from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { 
  calculateProgress, 
  getStatusCounts, 
  filterCompletions, 
  sortByPriority,
  FilterType 
} from "@/lib/learnerStats";

export default function LearnerPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [completions, setCompletions] = useState(getCompletionsByUserId(getCurrentUser().id));
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setCompletions(getCompletionsByUserId(user.id));
    });
    return unsubscribe;
  }, []);

  const progress = calculateProgress(completions);
  const statusCounts = getStatusCounts(completions);
  const filteredList = sortByPriority(filterCompletions(completions, activeFilter));

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const getSite = (siteId?: string) => siteId ? sites.find(s => s.id === siteId) : undefined;
  const getDept = (deptId?: string) => deptId ? departments.find(d => d.id === deptId) : undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "ASSIGNED":
        return <Badge variant="info">Assigned</Badge>;
      case "OVERDUE":
        return <Badge variant="error">Overdue</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getEmptyStateMessage = (filter: FilterType) => {
    switch (filter) {
      case "due-soon":
        return "No trainings due soon. Great job staying ahead!";
      case "overdue":
        return "No overdue trainings. You're all caught up!";
      case "completed":
        return "No completed trainings yet. Keep working!";
      default:
        return "No trainings assigned yet.";
    }
  };

  return (
    <RouteGuard>
      <LearnerLayout>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trainings</h1>
          <p className="text-gray-600 mb-6">Track your progress and stay compliant</p>

          {/* Hero Section with Progress */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8 p-4">
              <div className="flex-shrink-0">
                <ProgressRing progress={progress} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.assigned}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-700 mb-1">Due Soon</p>
                  <p className="text-2xl font-bold text-amber-600">{statusCounts.dueSoon}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700 mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
              style={activeFilter === "all" ? { backgroundColor: "var(--primary-color)" } : undefined}
            >
              All ({completions.length})
            </button>
            <button
              onClick={() => setActiveFilter("due-soon")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === "due-soon"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Due Soon ({statusCounts.dueSoon})
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === "overdue"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Overdue ({statusCounts.overdue})
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Completed ({statusCounts.completed})
            </button>
          </div>

          {/* Training List */}
          {filteredList.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{getEmptyStateMessage(activeFilter)}</h3>
                {activeFilter !== "all" && (
                  <Button variant="secondary" className="mt-4" onClick={() => setActiveFilter("all")}>
                    Back to All
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredList.map(completion => {
                const training = getTrainingById(completion.trainingId);
                const user = getUser(completion.userId);
                const site = getSite(user?.siteId);
                const dept = getDept(user?.departmentId);

                return (
                  <Card key={completion.id}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{training?.title}</h3>
                            {training?.standardRef && (
                              <p className="text-sm text-gray-500 mt-1">{training.standardRef}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span>Site: {site?.name || "—"}</span>
                              <span>•</span>
                              <span>Dept: {dept?.name || "—"}</span>
                            </div>
                          </div>
                          <div>{getStatusBadge(completion.status)}</div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          {completion.status === "COMPLETED" ? (
                            <span className="text-green-600">
                              Completed on {formatDate(completion.completedAt!)}
                            </span>
                          ) : (
                            <>
                              <span className={completion.status === "OVERDUE" ? "text-red-600 font-medium" : "text-gray-600"}>
                                Due: {formatDate(completion.dueAt)}
                              </span>
                              {completion.overdueDays && completion.overdueDays > 0 && (
                                <span className="text-red-600 font-medium">
                                  ({completion.overdueDays} days overdue)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <Link href={`/learner/training/${completion.id}`}>
                          <Button variant="secondary">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Note */}
          <Card className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Note:</span> Training completions are marked by your manager or admin.
                If you&apos;ve completed a training, please notify your supervisor to update your status.
              </p>
            </div>
          </Card>

          {/* Confetti for 100% completion */}
          <Confetti trigger={progress === 100 && completions.length > 0} />
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}

