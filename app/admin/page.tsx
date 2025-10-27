// Phase I Epic 1 & 2: Admin Dashboard
// ✅ Epic 2 Acceptance: Dashboard shows real training/compliance stats
// ✅ Permissions: Admin/Manager can access; Learner blocked by RouteGuard
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Progress from "@/components/Progress";
import Badge from "@/components/Badge";
import { getUsers, getTrainings, getCompletions, subscribe } from "@/lib/store";

export default function AdminDashboard() {
  const [users, setUsers] = useState(getUsers());
  const [trainings, setTrainings] = useState(getTrainings());
  const [completions, setCompletions] = useState(getCompletions());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setUsers(getUsers());
      setTrainings(getTrainings());
      setCompletions(getCompletions());
    });
    return unsubscribe;
  }, []);

  const totalUsers = users.length;
  const totalTrainings = trainings.length;
  
  const completedCount = completions.filter(c => c.status === "COMPLETED").length;
  const totalCount = completions.length;
  const complianceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const overdueCount = completions.filter(c => c.status === "OVERDUE").length;
  const assignedCount = completions.filter(c => c.status === "ASSIGNED").length;

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Total Users</span>
              <span className="text-3xl font-bold text-gray-900">{totalUsers}</span>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Active Trainings</span>
              <span className="text-3xl font-bold text-gray-900">{totalTrainings}</span>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Compliance Rate</span>
              <span className="text-3xl font-bold text-gray-900">{complianceRate}%</span>
              <div className="mt-2">
                <Progress value={complianceRate} showLabel={false} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Total Completions</span>
              <span className="text-3xl font-bold text-gray-900">{totalCount}</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500">Completed</span>
                <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
              </div>
              <Badge variant="success">{completedCount}</Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500">Assigned</span>
                <p className="text-2xl font-bold text-blue-600 mt-1">{assignedCount}</p>
              </div>
              <Badge variant="info">{assignedCount}</Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500">Overdue</span>
                <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
              </div>
              <Badge variant="error">{overdueCount}</Badge>
            </div>
          </Card>
        </div>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to UpKeep LMS</h2>
          <p className="text-gray-600">
            Your compliance-focused learning management system is now tracking {totalTrainings} training programs 
            across {totalUsers} users with a {complianceRate}% compliance rate.
          </p>
        </Card>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}

