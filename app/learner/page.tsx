// Phase I Epic 1 & 2: Learner home page
// ✅ Epic 2 Acceptance: Learner sees personal compliance dashboard (read-only)
// ✅ Permissions: No admin access; completions marked by manager/admin only
"use client";

import React, { useState, useEffect } from "react";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Progress from "@/components/Progress";
import { getCurrentUser, getCompletionsByUserId, getTrainingById, subscribe } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function LearnerPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [completions, setCompletions] = useState(getCompletionsByUserId(getCurrentUser().id));

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setCompletions(getCompletionsByUserId(user.id));
    });
    return unsubscribe;
  }, []);

  const totalAssigned = completions.length;
  const completedCount = completions.filter(c => c.status === "COMPLETED").length;
  const overdueCount = completions.filter(c => c.status === "OVERDUE").length;
  const assignedCount = completions.filter(c => c.status === "ASSIGNED").length;
  const complianceRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  const upcomingDeadlines = completions
    .filter(c => c.status === "ASSIGNED")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);

  return (
    <RouteGuard>
      <LearnerLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {currentUser.name}
        </h1>
        <p className="text-gray-600 mb-6">Your learning dashboard</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">My Compliance</span>
              <span className="text-3xl font-bold text-gray-900">{complianceRate}%</span>
              <div className="mt-2">
                <Progress value={complianceRate} showLabel={false} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Completed</span>
              <span className="text-3xl font-bold text-green-600">{completedCount}</span>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Assigned</span>
              <span className="text-3xl font-bold text-blue-600">{assignedCount}</span>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Overdue</span>
              <span className="text-3xl font-bold text-red-600">{overdueCount}</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Trainings</h2>
            {completions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No trainings assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completions.slice(0, 5).map(completion => {
                  const training = getTrainingById(completion.trainingId);
                  return (
                    <div key={completion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{training?.title}</p>
                        {training?.standardRef && (
                          <p className="text-xs text-gray-500 mt-1">{training.standardRef}</p>
                        )}
                      </div>
                      <div className="ml-3">
                        {completion.status === "COMPLETED" && <Badge variant="success">Done</Badge>}
                        {completion.status === "ASSIGNED" && <Badge variant="info">To Do</Badge>}
                        {completion.status === "OVERDUE" && <Badge variant="error">Overdue</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No upcoming deadlines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(completion => {
                  const training = getTrainingById(completion.trainingId);
                  return (
                    <div key={completion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{training?.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {formatDate(completion.dueAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Training completions are marked by your manager or admin. 
              If you&apos;ve completed a training, please notify your supervisor to update your status.
            </p>
          </div>
        </Card>
      </div>
      </LearnerLayout>
    </RouteGuard>
  );
}

