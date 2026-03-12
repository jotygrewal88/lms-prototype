"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  UserCircle,
  MoreHorizontal,
} from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  getCompletedOnboardingAssignments,
  getOnboardingPathById,
  getUser,
  getUserSkillRecordsByUserId,
} from "@/lib/store";
import { getFullName } from "@/types";

export default function CompletedTab() {
  const router = useRouter();
  const assignments = getCompletedOnboardingAssignments();
  const today = new Date();

  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [openMenuId]);

  const enriched = useMemo(() => {
    return assignments.map((a) => {
      const path = getOnboardingPathById(a.pathId);
      const user = getUser(a.userId);
      if (!path || !user) return null;

      const startDate = new Date(a.startDate);
      const completedDate = a.completedAt ? new Date(a.completedAt) : null;
      const totalDays = completedDate
        ? Math.max(1, Math.ceil((completedDate.getTime() - startDate.getTime()) / 86400000))
        : path.durationDays;

      const userRecords = getUserSkillRecordsByUserId(a.userId);
      const ninetyDaysMs = 90 * 86400000;
      let expiringCount = 0;
      for (const sid of a.skillsEarned) {
        const rec = userRecords.find((r) => r.skillId === sid && (r.status === "active" || r.status === "expired"));
        if (rec?.expiryDate) {
          const expMs = new Date(rec.expiryDate).getTime() - today.getTime();
          if (expMs < ninetyDaysMs) expiringCount++;
        }
      }

      return {
        assignment: a,
        path,
        user,
        userName: getFullName(user),
        completedDate,
        totalDays,
        expiringCount,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [assignments]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return enriched;
    const q = searchQuery.toLowerCase();
    return enriched.filter(
      (item) => item.userName.toLowerCase().includes(q) || item.path.title.toLowerCase().includes(q)
    );
  }, [enriched, searchQuery]);

  const hasActiveFilters = !!searchQuery;
  const clearFilters = () => setSearchQuery("");

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No completed onboarding assignments yet.</p>
      </div>
    );
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Completed Onboarding</h2>
        <span className="text-sm text-gray-500">{assignments.length} completed</span>
      </div>

      {/* Filters */}
      <Card>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Employee name or path title..."
            className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filtered.length} of {enriched.length} assignments</span>
            <button onClick={clearFilters} className="text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills Earned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cert Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No assignments match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.assignment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/users/${item.assignment.userId}`)}
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{item.userName}</div>
                      <div className="text-xs text-gray-500">{item.path.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.completedDate ? formatDate(item.completedDate) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.totalDays} days
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.assignment.skillsEarned.length}/{item.path.skillsCovered.length}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.expiringCount > 0 ? (
                        <Badge variant="warning">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {item.expiringCount} Expiring
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          All Current
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === item.assignment.id ? null : item.assignment.id);
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === item.assignment.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                router.push(`/admin/users/${item.assignment.userId}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <UserCircle className="w-3.5 h-3.5" />
                              View Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
