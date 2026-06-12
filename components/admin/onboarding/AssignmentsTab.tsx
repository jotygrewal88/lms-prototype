// Org-wide view of every onboarding assignment for /admin/onboarding.
// Admins see everything; managers see only their direct reports.
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Search,
  UserCircle,
  Users,
  X as XIcon,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import AssignOnboardingPathModal from "@/components/users/AssignOnboardingPathModal";
import {
  getOnboardingAssignments,
  getOnboardingPathById,
  getUser,
  getCurrentUser,
  getSiteById,
  getDepartmentById,
  cancelOnboardingAssignment,
} from "@/lib/store";
import { getFullName } from "@/types";
import type { OnboardingAssignment, User } from "@/types";

type StatusFilter = "" | "active" | "completed" | "cancelled";

function daysBetween(start: string, today: Date) {
  return Math.max(1, Math.ceil((today.getTime() - new Date(start).getTime()) / 86400000));
}

function getInitials(user: User) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
}

export default function AssignmentsTab() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === "ADMIN";
  const today = useMemo(() => new Date(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Dialogs
  const [cancelTarget, setCancelTarget] = useState<OnboardingAssignment | null>(null);
  const [reassignUser, setReassignUser] = useState<User | null>(null);
  const [pendingPreviousAssignmentId, setPendingPreviousAssignmentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  // Scope to viewer permissions: ADMIN sees everything; MANAGER sees only
  // assignments whose owning user reports directly to them.
  const visibleAssignments = useMemo(() => {
    const all = getOnboardingAssignments();
    if (isAdmin) return all;
    return all.filter((a) => {
      const u = getUser(a.userId);
      return u?.managerId === currentUser.id;
    });
  }, [isAdmin, currentUser.id]);

  // Enrich each assignment with derived fields for display + filtering.
  const enriched = useMemo(() => {
    return visibleAssignments
      .map((a) => {
        const path = getOnboardingPathById(a.pathId);
        const user = getUser(a.userId);
        if (!path || !user) return null;

        const site = user.siteId ? getSiteById(user.siteId) : undefined;
        const dept = user.departmentId ? getDepartmentById(user.departmentId) : undefined;

        const totalItems = path.phases.reduce((sum, ph) => sum + ph.courses.length, 0);
        const completedItems = a.phaseProgress.reduce((sum, p) => sum + p.coursesCompleted, 0);
        const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const dayNum = daysBetween(a.startDate, today);
        const currentPhaseProgress =
          a.phaseProgress.find((p) => p.status === "in_progress") ||
          a.phaseProgress.find((p) => p.status === "locked");
        const currentPhaseIndex = currentPhaseProgress
          ? path.phases.findIndex((ph) => ph.id === currentPhaseProgress.phaseId)
          : path.phases.length - 1;
        const currentPathPhase = currentPhaseIndex >= 0 ? path.phases[currentPhaseIndex] : null;
        const currentPhaseNumber = currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : path.phases.length;

        const behindSchedule =
          a.status === "active" &&
          currentPathPhase != null &&
          dayNum > currentPathPhase.dayEnd;

        return {
          assignment: a,
          path,
          user,
          userName: getFullName(user),
          siteName: site?.name || "",
          deptName: dept?.name || "",
          progressPct,
          completedItems,
          totalItems,
          dayNum,
          currentPhaseName: currentPathPhase?.name || "—",
          currentPhaseNumber,
          totalPhases: path.phases.length,
          behindSchedule,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [visibleAssignments, today]);

  // Build filter dropdown options from the *visible* assignments only.
  const pathOptions = useMemo(() => {
    const map = new Map<string, string>();
    enriched.forEach((e) => map.set(e.path.id, e.path.title));
    return Array.from(map, ([id, title]) => ({ id, title })).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [enriched]);

  const siteOptions = useMemo(() => {
    return Array.from(new Set(enriched.map((e) => e.siteName).filter(Boolean))).sort();
  }, [enriched]);

  const deptOptions = useMemo(() => {
    return Array.from(new Set(enriched.map((e) => e.deptName).filter(Boolean))).sort();
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.userName.toLowerCase().includes(q)) return false;
      }
      if (pathFilter && item.path.id !== pathFilter) return false;
      if (deptFilter && item.deptName !== deptFilter) return false;
      if (siteFilter && item.siteName !== siteFilter) return false;
      if (statusFilter && item.assignment.status !== statusFilter) return false;
      return true;
    });
  }, [enriched, searchQuery, pathFilter, deptFilter, siteFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery || pathFilter || deptFilter || siteFilter || statusFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setPathFilter("");
    setDeptFilter("");
    setSiteFilter("");
    setStatusFilter("");
  };

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const confirmCancel = () => {
    if (!cancelTarget) return;
    const user = getUser(cancelTarget.userId);
    cancelOnboardingAssignment(cancelTarget.id);
    setToast({
      message: `${user ? getFullName(user) : "User"} removed from their onboarding path. Progress was saved.`,
      type: "success",
    });
    setCancelTarget(null);
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Reassign ─────────────────────────────────────────────────────────────
  const openReassign = (a: OnboardingAssignment) => {
    const u = getUser(a.userId);
    if (!u) return;
    // Capture the previous assignment so we can cancel it after the new one
    // is successfully created via the modal.
    setPendingPreviousAssignmentId(a.id);
    setReassignUser(u);
    setOpenMenuId(null);
  };

  const handleReassigned = (pathTitle: string) => {
    if (pendingPreviousAssignmentId) {
      cancelOnboardingAssignment(pendingPreviousAssignmentId);
    }
    const userName = reassignUser ? getFullName(reassignUser) : "User";
    setReassignUser(null);
    setPendingPreviousAssignmentId(null);
    setToast({
      message: `${userName} reassigned to "${pathTitle}". Previous onboarding cancelled, progress saved.`,
      type: "success",
    });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Empty states ─────────────────────────────────────────────────────────
  if (visibleAssignments.length === 0) {
    return (
      <Card>
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1 font-medium">
            No onboarding assignments yet.
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Assignments are created when a new hire is added with a job title that
            has a published onboarding path.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Onboarding Assignments
        </h2>
        <span className="text-sm text-gray-500">
          {filtered.length} of {enriched.length}
        </span>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search learner
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Path</label>
            <select
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All paths</option>
              {pathOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All departments</option>
              {deptOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Site</label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All sites</option>
              {siteOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Path
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    No assignments match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.assignment.id} className="hover:bg-gray-50">
                    {/* Learner */}
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/users/${item.user.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {getInitials(item.user)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {item.userName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.user.jobTitleText || "—"}
                          </div>
                        </div>
                      </Link>
                    </td>
                    {/* Path */}
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/onboarding?preview=${item.path.id}`,
                          )
                        }
                        className="text-left text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {item.path.title}
                      </button>
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{item.deptName || "—"}</div>
                      <div className="text-xs text-gray-400">
                        {item.siteName || "—"}
                      </div>
                    </td>
                    {/* Phase */}
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-900">{item.currentPhaseName}</div>
                      <div className="text-xs text-gray-500">
                        Phase {item.currentPhaseNumber} of {item.totalPhases}
                      </div>
                    </td>
                    {/* Progress */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.assignment.status === "cancelled"
                                ? "bg-gray-400"
                                : item.behindSchedule
                                  ? "bg-amber-500"
                                  : item.assignment.status === "completed"
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                            }`}
                            style={{ width: `${item.progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-10 text-right">
                          {item.progressPct}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.completedItems} of {item.totalItems} items
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <StatusPill status={item.assignment.status} />
                        {item.behindSchedule && (
                          <Badge variant="warning">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Behind
                          </Badge>
                        )}
                      </div>
                    </td>
                    {/* Started */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.assignment.startDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === item.assignment.id
                                ? null
                                : item.assignment.id,
                            );
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === item.assignment.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                router.push(`/admin/users/${item.user.id}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <UserCircle className="w-3.5 h-3.5" />
                              View Profile
                            </button>
                            {item.assignment.status === "active" && (
                              <>
                                <button
                                  onClick={() => openReassign(item.assignment)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                  Reassign Path
                                </button>
                                <div className="my-1 border-t border-gray-100" />
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setCancelTarget(item.assignment);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Cancel Onboarding
                                </button>
                              </>
                            )}
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

      {/* Cancel Confirmation */}
      {cancelTarget && (() => {
        const user = getUser(cancelTarget.userId);
        const userName = user ? getFullName(user) : "this user";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setCancelTarget(null)}
            />
            <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
              <button
                onClick={() => setCancelTarget(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Cancel Onboarding
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This will remove {userName} from their onboarding path. Their
                progress will be saved but they will no longer be assigned.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => setCancelTarget(null)}>
                  Keep assignment
                </Button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Cancel Onboarding
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reassign Modal */}
      {reassignUser && (
        <AssignOnboardingPathModal
          user={reassignUser}
          onClose={() => {
            setReassignUser(null);
            setPendingPreviousAssignmentId(null);
          }}
          onAssigned={handleReassigned}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type as any}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "active" | "completed" | "cancelled";
}) {
  if (status === "active") {
    return <Badge variant="info">Active</Badge>;
  }
  if (status === "completed") {
    return (
      <Badge variant="success">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    );
  }
  return <Badge variant="default">Cancelled</Badge>;
}
