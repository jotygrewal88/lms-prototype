"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Users,
  MoreHorizontal,
  Send,
  CalendarClock,
  UserCircle,
  Trash2,
  X as XIcon,
} from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import {
  getActiveOnboardingAssignments,
  getOnboardingPathById,
  getUser,
  updateOnboardingAssignment,
} from "@/lib/store";
import { getFullName } from "@/types";
import type { OnboardingAssignment } from "@/types";

function daysBetween(a: string, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - new Date(a).getTime()) / 86400000));
}

export default function ActiveTab() {
  const router = useRouter();
  const assignments = getActiveOnboardingAssignments();
  const today = new Date();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "on-track" | "behind">("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [dialogAssignment, setDialogAssignment] = useState<OnboardingAssignment | null>(null);
  const [dialogType, setDialogType] = useState<"reminder" | "deadline" | "remove" | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineReason, setDeadlineReason] = useState("");

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

      const dayNum = daysBetween(a.startDate, today);
      const totalCompletedCourses = a.phaseProgress.reduce((s, p) => s + p.coursesCompleted, 0);
      const totalCourses = a.phaseProgress.reduce((s, p) => s + p.coursesTotal, 0);
      const progressPct = totalCourses > 0 ? Math.round((totalCompletedCourses / totalCourses) * 100) : 0;

      const currentPhase = a.phaseProgress.find((p) => p.status === "in_progress");
      const currentPathPhase = currentPhase ? path.phases.find((ph) => ph.id === currentPhase.phaseId) : null;

      let behindSchedule = false;
      if (currentPathPhase) {
        if (dayNum > currentPathPhase.dayEnd) {
          behindSchedule = true;
        } else if (currentPhase && currentPhase.coursesCompleted === 0) {
          const daysSincePhaseStart = dayNum - currentPathPhase.dayStart + 1;
          const phaseDuration = currentPathPhase.dayEnd - currentPathPhase.dayStart + 1;
          if (daysSincePhaseStart > phaseDuration * 0.5) behindSchedule = true;
        }
      }

      return {
        assignment: a,
        path,
        user,
        userName: getFullName(user),
        dayNum,
        progressPct,
        currentPhaseName: currentPathPhase?.name || "Complete",
        behindSchedule,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [assignments]);

  const filtered = useMemo(() => {
    return enriched.filter((item) => {
      if (filterStatus === "on-track" && item.behindSchedule) return false;
      if (filterStatus === "behind" && !item.behindSchedule) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.userName.toLowerCase().includes(q) && !item.path.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [enriched, searchQuery, filterStatus]);

  const hasActiveFilters = searchQuery || filterStatus;
  const clearFilters = () => { setSearchQuery(""); setFilterStatus(""); };

  const openDialog = (a: OnboardingAssignment, type: "reminder" | "deadline" | "remove") => {
    setDialogAssignment(a);
    setDialogType(type);
    setOpenMenuId(null);
    if (type === "deadline") {
      const path = getOnboardingPathById(a.pathId);
      if (path) {
        const deadline = new Date(new Date(a.startDate).getTime() + path.durationDays * 86400000);
        setDeadlineDate(deadline.toISOString().split("T")[0]);
      }
      setDeadlineReason("");
    }
  };

  const closeDialog = () => { setDialogAssignment(null); setDialogType(null); };

  const handleSendReminder = () => {
    if (!dialogAssignment) return;
    const user = getUser(dialogAssignment.userId);
    closeDialog();
    setToast({ message: `Reminder sent to ${user ? getFullName(user) : "user"}`, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdjustDeadline = () => {
    if (!deadlineDate || !dialogAssignment) return;
    closeDialog();
    const user = getUser(dialogAssignment.userId);
    setToast({ message: `Deadline adjusted for ${user ? getFullName(user) : "user"}`, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemove = () => {
    if (!dialogAssignment) return;
    const user = getUser(dialogAssignment.userId);
    const path = getOnboardingPathById(dialogAssignment.pathId);
    updateOnboardingAssignment(dialogAssignment.id, { status: "cancelled" });
    closeDialog();
    setToast({ message: `${user ? getFullName(user) : "User"} removed from ${path?.title || "path"}`, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No employees are currently onboarding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Active Onboarding</h2>
        <span className="text-sm text-gray-500">{assignments.length} in progress</span>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Employee name or path title..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="on-track">On Track</option>
              <option value="behind">Behind Schedule</option>
            </select>
          </div>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Phase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No assignments match your filters.
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
                      Day {item.dayNum} of {item.path.durationDays}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full transition-all ${item.behindSchedule ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${item.progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-8">{item.progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.currentPhaseName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.behindSchedule ? (
                        <Badge variant="error">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Behind
                        </Badge>
                      ) : (
                        <Badge variant="success">On Track</Badge>
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
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDialog(item.assignment, "reminder");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send Reminder
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDialog(item.assignment, "deadline");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <CalendarClock className="w-3.5 h-3.5" />
                              Adjust Deadline
                            </button>
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
                            <div className="my-1 border-t border-gray-100" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDialog(item.assignment, "remove");
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove from Path
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

      {/* Send Reminder Dialog */}
      {dialogType === "reminder" && dialogAssignment && (() => {
        const user = getUser(dialogAssignment.userId);
        const userName = user ? getFullName(user) : "this user";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={closeDialog} />
            <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
              <button onClick={closeDialog} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <XIcon className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Send Reminder</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send {userName} a reminder about their upcoming training?
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
                <Button variant="primary" onClick={handleSendReminder}>Send</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Adjust Deadline Dialog */}
      {dialogType === "deadline" && dialogAssignment && (() => {
        const path = getOnboardingPathById(dialogAssignment.pathId);
        const originalDeadline = path
          ? new Date(new Date(dialogAssignment.startDate).getTime() + path.durationDays * 86400000)
          : new Date();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={closeDialog} />
            <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
              <button onClick={closeDialog} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <XIcon className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Adjust Deadline</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Current deadline</label>
                  <p className="text-sm text-gray-700">{originalDeadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">New deadline</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={deadlineReason}
                    onChange={(e) => setDeadlineReason(e.target.value)}
                    placeholder="e.g., Extended leave"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
                <Button variant="primary" onClick={handleAdjustDeadline}>Save</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Remove Confirmation */}
      {dialogType === "remove" && dialogAssignment && (() => {
        const user = getUser(dialogAssignment.userId);
        const path = getOnboardingPathById(dialogAssignment.pathId);
        const userName = user ? getFullName(user) : "this user";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={closeDialog} />
            <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
              <button onClick={closeDialog} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <XIcon className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Remove from Path</h3>
              <p className="text-sm text-gray-600 mb-4">
                Remove {userName} from {path?.title || "this path"}? Their progress will be saved but the assignment will be cancelled.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
