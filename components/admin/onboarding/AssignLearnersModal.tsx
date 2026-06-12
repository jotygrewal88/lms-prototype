// Assign learners to an existing onboarding path. Multi-select with site,
// department, job-title, and free-text filters; shared start date.
"use client";

import React, { useMemo, useState } from "react";
import { X, Search, Users, Calendar, Building2, Briefcase, AlertTriangle, CheckCircle2 } from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  getUsers,
  getSites,
  getDepartments,
  getJobTitles,
  getOnboardingAssignmentsByPathId,
  getOnboardingAssignmentsByUserId,
  createOnboardingAssignment,
  getCurrentUser,
} from "@/lib/store";
import type { OnboardingPath, User } from "@/types";
import { getFullName } from "@/types";

interface Props {
  path: OnboardingPath;
  onClose: () => void;
  onAssigned: (count: number) => void;
}

export default function AssignLearnersModal({ path, onClose, onAssigned }: Props) {
  const sites = getSites();
  const departments = getDepartments();
  const jobTitles = getJobTitles();
  const currentUser = getCurrentUser();

  const [filterSiteId, setFilterSiteId] = useState<string>("");
  const [filterDeptId, setFilterDeptId] = useState<string>("");
  const [filterJobTitleId, setFilterJobTitleId] = useState<string>(path.jobTitleId || "");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  // Already actively assigned to THIS path — these are excluded from the list.
  const alreadyOnThisPath = useMemo(() => {
    const set = new Set<string>();
    for (const a of getOnboardingAssignmentsByPathId(path.id)) {
      if (a.status === "active") set.add(a.userId);
    }
    return set;
  }, [path.id]);

  // Eligible users — non-admins, active, not already on this path
  const eligibleUsers = useMemo<User[]>(() => {
    return getUsers().filter((u) => {
      if (!u.active) return false;
      if (u.role === "ADMIN") return false;
      if (alreadyOnThisPath.has(u.id)) return false;
      return true;
    });
  }, [alreadyOnThisPath]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return eligibleUsers.filter((u) => {
      if (filterSiteId && u.siteId !== filterSiteId) return false;
      if (filterDeptId && u.departmentId !== filterDeptId) return false;
      if (filterJobTitleId && u.jobTitleId !== filterJobTitleId) return false;
      if (!q) return true;
      const text = `${getFullName(u)} ${u.email} ${u.jobTitleText || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [eligibleUsers, filterSiteId, filterDeptId, filterJobTitleId, search]);

  // Available dept options scope down to the selected site (if any)
  const availableDepartments = useMemo(() => {
    if (!filterSiteId) return departments;
    return departments.filter((d) => d.siteId === filterSiteId);
  }, [departments, filterSiteId]);

  // For showing "already on path X" warnings inline
  const otherActivePathByUser = useMemo(() => {
    const map = new Map<string, string>(); // userId -> pathId (other path)
    for (const u of eligibleUsers) {
      const userAssignments = getOnboardingAssignmentsByUserId(u.id);
      const active = userAssignments.find((a) => a.status === "active");
      if (active) map.set(u.id, active.pathId);
    }
    return map;
  }, [eligibleUsers]);

  const toggleUser = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const handleAssign = () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    let count = 0;
    for (const userId of selected) {
      createOnboardingAssignment({
        pathId: path.id,
        userId,
        status: "active",
        startDate,
        phaseProgress: path.phases.map((ph, i) => ({
          phaseId: ph.id,
          status: i === 0 ? "in_progress" : "locked",
          coursesCompleted: 0,
          coursesTotal: ph.courses.length,
        })),
        skillsEarned: [],
        assignedByUserId: currentUser.id,
      });
      count++;
    }
    setSubmitting(false);
    onAssigned(count);
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Assign Learners
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Assigning to: <span className="font-medium text-gray-700">{path.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={filterSiteId}
              onChange={(e) => { setFilterSiteId(e.target.value); setFilterDeptId(""); }}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="">All sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filterDeptId}
              onChange={(e) => setFilterDeptId(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
              disabled={availableDepartments.length === 0}
            >
              <option value="">All departments</option>
              {availableDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterJobTitleId}
              onChange={(e) => setFilterJobTitleId(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="">All job titles</option>
              {jobTitles.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                  {j.id === path.jobTitleId ? " ★" : ""}
                </option>
              ))}
            </select>
          </div>
          {filterJobTitleId === path.jobTitleId && path.jobTitleId && (
            <p className="text-[11px] text-gray-500">
              ★ Pre-filtered to this path&apos;s job title. Change the dropdown to assign learners from other roles too.
            </p>
          )}
        </div>

        {/* Selection summary + toggle all */}
        <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-gray-600">
            {selected.size} of {filtered.length} selected
            {filtered.length !== eligibleUsers.length && ` (${eligibleUsers.length} eligible total)`}
          </span>
          {filtered.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-blue-600 hover:text-blue-700 font-medium"
              type="button"
            >
              {allSelected ? "Clear selection" : `Select all ${filtered.length}`}
            </button>
          )}
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              {eligibleUsers.length === 0 ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Every eligible learner is already on this path.
                  </p>
                </>
              ) : (
                <>
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No learners match these filters.</p>
                </>
              )}
            </div>
          ) : (
            filtered.map((u) => {
              const isSelected = selected.has(u.id);
              const site = sites.find((s) => s.id === u.siteId);
              const dept = departments.find((d) => d.id === u.departmentId);
              const jt = jobTitles.find((j) => j.id === u.jobTitleId);
              const otherPathId = otherActivePathByUser.get(u.id);
              return (
                <label
                  key={u.id}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(u.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{getFullName(u)}</span>
                      <Badge variant={u.role === "MANAGER" ? "info" : "default"}>
                        {u.role === "MANAGER" ? "Manager" : "Learner"}
                      </Badge>
                      {otherPathId && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded"
                          title="This user already has an active onboarding path"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Already on another path
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{u.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 flex-wrap">
                      {jt && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {jt.name}
                        </span>
                      )}
                      {(site || dept) && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {[site?.name, dept?.name].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer — start date + assign button */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            Start date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={selected.size === 0 || submitting}
            >
              {selected.size === 0
                ? "Select learners"
                : `Assign ${selected.size} learner${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
