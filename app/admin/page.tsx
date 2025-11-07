// Phase I Epic 1, 2, Polish Pack & Scope Filtering: Dashboard with scoped KPIs
"use client";

import React, { useState, useEffect } from "react";
import { Circle, TrendingUp, TrendingDown, Users, Award, AlertCircle, Clock, CheckCircle, Target } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import SmartComplianceCoach from "@/components/SmartComplianceCoach";
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
  const onTimeStats = onTimePctLast30d(scoped.completions);
  const avgOverdue = avgDaysOverdueLast30d(scoped.completions);

  const totalUsers = scoped.users.length;
  const totalTrainings = scoped.trainings.length;
  const totalCount = scoped.completions.length;
  const complianceRate = totalCount > 0 ? distribution.completedPct : 0;

  // KPI calculations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-[16px] text-gray-600">Track training compliance across your organization</p>
        </div>

        {/* KPI Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Compliance Rate - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-white opacity-90" />
                <div className={`flex items-center gap-1 text-white text-sm font-medium px-2 py-1 rounded-full ${
                  complianceRate >= 80 ? "bg-green-500/30" : "bg-yellow-500/30"
                }`}>
                  {complianceRate >= 80 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {complianceRate >= 80 ? "Great" : "Low"}
                </div>
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Compliance Rate</div>
              <div className="text-white text-5xl font-bold mb-2">{complianceRate}%</div>
              <div className="text-white text-sm opacity-75">{distribution.completed} of {totalCount} completed</div>
              <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-2 rounded-full bg-white transition-all duration-1000" style={{ width: `${complianceRate}%` }} />
              </div>
            </div>
          </div>

          {/* On-Time Completions - Green Gradient */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-white opacity-90" />
                <Award className="w-6 h-6 text-white opacity-60" />
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">On-Time Rate (30d)</div>
              <div className="text-white text-5xl font-bold mb-2">{onTimeStats.pct}%</div>
              <div className="text-white text-sm opacity-75">{onTimeStats.onTimeCount} of {onTimeStats.totalCompletions} on time</div>
              <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-2 rounded-full bg-white transition-all duration-1000" style={{ width: `${onTimeStats.pct}%` }} />
              </div>
            </div>
          </div>

          {/* Overdue Trainings - Red/Orange Gradient */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-orange-600 to-pink-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-white opacity-90 animate-pulse" />
                {distribution.overdue > 10 && (
                  <div className="text-white text-xs font-bold px-2 py-1 rounded-full bg-white/20 animate-bounce">
                    ACTION NEEDED
                  </div>
                )}
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Overdue Trainings</div>
              <div className="text-white text-5xl font-bold mb-2">{distribution.overdue}</div>
              <div className="text-white text-sm opacity-75">Requires attention</div>
            </div>
          </div>

          {/* Avg Days Overdue - Amber Gradient */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-white opacity-90" />
                <div className="text-white text-xs font-medium opacity-75">30 days</div>
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Avg Days Overdue</div>
              <div className="text-white text-5xl font-bold mb-2">{avgOverdue}</div>
              <div className="text-white text-sm opacity-75">{overdueLast30d.length} items tracked</div>
            </div>
          </div>

          {/* Total Users - Purple Gradient */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-white opacity-90" />
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Total Users</div>
              <div className="text-white text-5xl font-bold mb-2">{totalUsers}</div>
              <div className="text-white text-sm opacity-75">Active employees</div>
            </div>
          </div>

          {/* Active Trainings - Cyan Gradient */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-white opacity-90" />
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Active Trainings</div>
              <div className="text-white text-5xl font-bold mb-2">{totalTrainings}</div>
              <div className="text-white text-sm opacity-75">Programs running</div>
            </div>
          </div>

          {/* Total Completions - Gradient spanning 2 columns */}
          <div className="group relative overflow-hidden md:col-span-2 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-40 w-40 rounded-full bg-white opacity-5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-10 h-10 text-white opacity-90" />
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Growing</span>
                </div>
              </div>
              <div className="text-white text-sm font-medium mb-2 opacity-90">Total Completions</div>
              <div className="text-white text-6xl font-bold mb-2">{totalCount}</div>
              <div className="text-white text-sm opacity-75">All assignments across organization</div>
            </div>
          </div>
        </div>

        {/* Smart Compliance Coach */}
        <SmartComplianceCoach />

        {/* Compliance Summary - Enhanced */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-50 blur-3xl"></div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-6">📊 Compliance Overview</h2>
          <div className="grid grid-cols-12 gap-6">
            {/* Distribution Bar */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex h-4 rounded-full shadow-inner bg-gray-100 overflow-hidden mb-6">
                {distribution.completedPct > 0 && (
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" 
                    style={{ width: `${distribution.completedPct}%` }}
                  />
                )}
                {distribution.assignedPct > 0 && (
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000" 
                    style={{ width: `${distribution.assignedPct}%` }}
                  />
                )}
                {distribution.dueSoonPct > 0 && (
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-1000" 
                    style={{ width: `${distribution.dueSoonPct}%` }}
                  />
                )}
                {distribution.overduePct > 0 && (
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000" 
                    style={{ width: `${distribution.overduePct}%` }}
                  />
                )}
                {distribution.exemptPct > 0 && (
                  <div 
                    className="bg-gray-400 transition-all duration-1000" 
                    style={{ width: `${distribution.exemptPct}%` }}
                  />
                )}
              </div>

              {/* Legend - Enhanced with badges */}
              <div className="grid grid-cols-2 gap-3 text-[14px]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Completed</span>
                  <span className="ml-auto text-gray-900 font-bold">{distribution.completed}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Assigned</span>
                  <span className="ml-auto text-gray-900 font-bold">{distribution.assigned}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Due Soon</span>
                  <span className="ml-auto text-gray-900 font-bold">{distribution.dueSoon}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-sm animate-pulse"></div>
                  <span className="text-gray-700 font-medium">Overdue</span>
                  <span className="ml-auto text-gray-900 font-bold">{distribution.overdue}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gray-400 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Exempt</span>
                  <span className="ml-auto text-gray-900 font-bold">{distribution.exempt}</span>
                </div>
              </div>
            </div>

            {/* Insights - Enhanced with icons */}
            <div className="col-span-12 lg:col-span-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                  {distribution.overdue > 5 ? (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-[14px] text-gray-700 font-medium">
                    {distribution.overdue > 5 
                      ? `${distribution.overdue} trainings overdue - review reminders and escalation flows`
                      : "✨ Compliance is on track! Great work!"
                    }
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  {onTimeStats.pct >= 80 ? (
                    <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-[14px] text-gray-700 font-medium">
                    {onTimeStats.pct >= 80
                      ? "🎯 Strong on-time completion rate maintained!"
                      : "⏰ Consider adjusting due dates for better on-time rates"
                    }
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <Users className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[14px] text-gray-700 font-medium">
                    {totalTrainings} active programs across {totalUsers} employees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}
