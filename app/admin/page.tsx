// Phase I Epic 1, 2, Polish Pack & Scope Filtering: Dashboard with scoped KPIs
"use client";

import React, { useState, useEffect } from "react";
import { Circle } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import { useScope } from "@/hooks/useScope";
import { subscribe } from "@/lib/store";
import {
  getScopedData,
  calculateDistribution,
  onTimePctLast30d,
  avgDaysOverdueLast30d,
} from "@/lib/stats";

export default function AdminDashboard() {
  const { scope } = useScope();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  // Get scoped data
  const scoped = getScopedData(scope);
  
  // Calculate stats from scoped data
  const distribution = calculateDistribution(scoped.completions);
  const onTimePct = onTimePctLast30d(scoped.completions);
  const avgOverdue = avgDaysOverdueLast30d(scoped.completions);

  const totalUsers = scoped.users.length;
  const totalTrainings = scoped.trainings.length;
  const totalCount = scoped.completions.length;
  const complianceRate = totalCount > 0 ? distribution.completedPct : 0;

  // KPI calculations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedLast30d = scoped.completions.filter(c => 
    c.status === "COMPLETED" && 
    c.completedAt && 
    new Date(c.completedAt) >= thirtyDaysAgo
  );
  const onTimeCompletions = completedLast30d.filter(c => 
    c.completedAt && new Date(c.completedAt) <= new Date(c.dueAt)
  ).length;

  const overdueLast30d = scoped.completions.filter(c => 
    c.status === "OVERDUE" && 
    c.overdueDays &&
    c.overdueDays > 0 &&
    new Date(c.dueAt) >= thirtyDaysAgo
  );

  return (
    <RouteGuard>
      <AdminLayout>
      <div className="px-8 py-6 space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-[14px] text-gray-500">Track training compliance across your organization</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Compliance Rate */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">Compliance Rate</div>
            <div className={`text-[28px] leading-none font-semibold mb-1 ${
              complianceRate >= 80 ? "text-green-600" : complianceRate >= 60 ? "text-yellow-600" : "text-red-600"
            }`}>
              {complianceRate}%
            </div>
            <div className="text-[12px] text-gray-500 mb-3">{distribution.completed} of {totalCount}</div>
            <div className="h-2 rounded bg-gray-100">
              <div className="h-2 rounded bg-[#2563EB]" style={{ width: `${complianceRate}%` }} />
            </div>
          </Card>

          {/* On-Time Completions */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">On-Time (Last 30d)</div>
            <div className={`text-[28px] leading-none font-semibold mb-1 ${
              onTimePct >= 80 ? "text-green-600" : "text-yellow-600"
            }`}>
              {onTimePct}%
            </div>
            <div className="text-[12px] text-gray-500 mb-3">{onTimeCompletions} of {completedLast30d.length}</div>
            <div className="h-2 rounded bg-gray-100">
              <div className="h-2 rounded bg-green-500" style={{ width: `${onTimePct}%` }} />
            </div>
          </Card>

          {/* Overdue Trainings */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">Overdue Trainings</div>
            <div className="text-[28px] leading-none font-semibold mb-1 text-red-600">
              {distribution.overdue}
            </div>
            <div className="text-[12px] text-gray-500">Requires attention</div>
          </Card>

          {/* Avg Days Overdue */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">Avg Days Overdue (30d)</div>
            <div className="text-[28px] leading-none font-semibold mb-1 text-orange-600">
              {avgOverdue}
            </div>
            <div className="text-[12px] text-gray-500">{overdueLast30d.length} items</div>
          </Card>

          {/* Total Users */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">Total Users</div>
            <div className="text-[28px] leading-none font-semibold mb-1 text-gray-900">
              {totalUsers}
            </div>
            <div className="text-[12px] text-gray-500">Active employees</div>
          </Card>

          {/* Active Trainings */}
          <Card>
            <div className="text-[12px] text-gray-600 mb-2">Active Trainings</div>
            <div className="text-[28px] leading-none font-semibold mb-1 text-gray-900">
              {totalTrainings}
            </div>
            <div className="text-[12px] text-gray-500">Programs</div>
          </Card>

          {/* Total Completions */}
          <Card className="col-span-2">
            <div className="text-[12px] text-gray-600 mb-2">Total Completions</div>
            <div className="text-[28px] leading-none font-semibold mb-1 text-gray-900">
              {totalCount}
            </div>
            <div className="text-[12px] text-gray-500">All assignments</div>
          </Card>
        </div>

        {/* Compliance Summary */}
        <Card className="col-span-full">
          <h2 className="text-[16px] font-semibold text-gray-900 mb-4">Compliance Summary</h2>
          <div className="grid grid-cols-12 gap-6">
            {/* Distribution Bar */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex h-3 rounded bg-gray-100 overflow-hidden mb-4">
                {distribution.completedPct > 0 && (
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${distribution.completedPct}%` }}
                  />
                )}
                {distribution.assignedPct > 0 && (
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${distribution.assignedPct}%` }}
                  />
                )}
                {distribution.dueSoonPct > 0 && (
                  <div 
                    className="bg-amber-500" 
                    style={{ width: `${distribution.dueSoonPct}%` }}
                  />
                )}
                {distribution.overduePct > 0 && (
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${distribution.overduePct}%` }}
                  />
                )}
                {distribution.exemptPct > 0 && (
                  <div 
                    className="bg-gray-400" 
                    style={{ width: `${distribution.exemptPct}%` }}
                  />
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-gray-700">Completed: {distribution.completed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                  <span className="text-gray-700">Assigned: {distribution.assigned}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
                  <span className="text-gray-700">Due Soon: {distribution.dueSoon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                  <span className="text-gray-700">Overdue: {distribution.overdue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                  <span className="text-gray-700">Exempt: {distribution.exempt}</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="col-span-12 lg:col-span-5">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Circle className="w-2 h-2 text-gray-400 mt-1.5 flex-shrink-0" />
                  <span className="text-[13px] text-gray-700">
                    {distribution.overdue > 5 
                      ? `${distribution.overdue} trainings overdue - review reminders and escalation flows`
                      : "Compliance is on track"
                    }
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Circle className="w-2 h-2 text-gray-400 mt-1.5 flex-shrink-0" />
                  <span className="text-[13px] text-gray-700">
                    {onTimePct >= 80
                      ? "Strong on-time completion rate maintained"
                      : "Consider adjusting due dates for improved on-time rates"
                    }
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Circle className="w-2 h-2 text-gray-400 mt-1.5 flex-shrink-0" />
                  <span className="text-[13px] text-gray-700">
                    {totalTrainings} active programs across {totalUsers} employees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}
