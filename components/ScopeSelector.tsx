/**
 * PHASE I SCOPE FILTERING:
 * ✓ Site and Department dropdowns with store-based state
 * ✓ Manager: pre-selected to their scope, cannot exceed it
 * ✓ Admin: can select any scope
 * ✓ Persists to localStorage
 * ✓ Pill-style selectors with visible current values
 */
"use client";

import React from "react";
import { useScope } from "@/hooks/useScope";
import { getSites, getDepartments, getCurrentUser } from "@/lib/store";
import HeaderPill from "./HeaderPill";

export default function ScopeSelector() {
  const { scope, setScope } = useScope();
  const currentUser = getCurrentUser();
  const sites = getSites();
  const departments = getDepartments();

  // Only show for Admin/Manager
  if (currentUser.role === "LEARNER") return null;

  // Site options
  const siteOptions = [
    { id: "ALL", name: "All Sites" },
    ...sites.map((s) => ({ id: s.id, name: s.name })),
  ];

  // Department options (filtered by selected site if not ALL)
  const deptOptions = [
    { id: "ALL", name: "All Departments" },
    ...departments
      .filter((d) => scope.siteId === "ALL" || d.siteId === scope.siteId)
      .map((d) => ({ id: d.id, name: d.name })),
  ];

  // Manager restrictions
  const isManager = currentUser.role === "MANAGER";
  const canChangeSite = !isManager || !currentUser.siteId;
  const canChangeDept = !isManager || !currentUser.departmentId;

  const handleSiteChange = (siteId: string) => {
    if (!canChangeSite) return;
    setScope({ siteId, deptId: "ALL" });
  };

  const handleDeptChange = (deptId: string) => {
    if (!canChangeDept) return;
    setScope({ ...scope, deptId });
  };

  return (
    <div className="flex items-center gap-2">
      <HeaderPill
        label="Site"
        value={scope.siteId}
        options={siteOptions}
        onSelect={handleSiteChange}
        disabled={!canChangeSite}
        ariaLabel="Select site"
        isFiltered={scope.siteId !== "ALL"}
      />
      <HeaderPill
        label="Department"
        value={scope.deptId}
        options={deptOptions}
        onSelect={handleDeptChange}
        disabled={!canChangeDept}
        ariaLabel="Select department"
        isFiltered={scope.deptId !== "ALL"}
      />
    </div>
  );
}
