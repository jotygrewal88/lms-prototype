// Skills V2: Requirements management tab — with filters, modals, and delete
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Table from "@/components/Table";
import Button from "@/components/Button";
import {
  getRoleSkillRequirements,
  getWorkContextSkillRequirements,
  getSkillV2ById,
  deleteRoleSkillRequirement,
  deleteWorkContextSkillRequirement,
  subscribe,
  getCurrentUser,
  getSites,
  getDepartments,
} from "@/lib/store";
import type { RoleSkillRequirement, WorkContextSkillRequirement, EnforcementMode, WorkContextType } from "@/types";
import AddRoleRequirementModal from "./AddRoleRequirementModal";
import AddWorkContextRequirementModal from "./AddWorkContextRequirementModal";

const ENFORCEMENT_OPTIONS: { label: string; value: EnforcementMode | "" }[] = [
  { label: "All Enforcement", value: "" },
  { label: "None", value: "none" },
  { label: "Warn", value: "warn" },
  { label: "Block", value: "block" },
];

const CONTEXT_TYPE_OPTIONS: { label: string; value: WorkContextType | "" }[] = [
  { label: "All Types", value: "" },
  { label: "Asset Type", value: "asset_type" },
  { label: "Work Order Type", value: "work_order_type" },
  { label: "Permit Type", value: "permit_type" },
  { label: "Inspection Type", value: "inspection_type" },
  { label: "Training Type", value: "training_type" },
];

const formatContextType = (ct: string) =>
  ct.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RequirementsPanel() {
  const [roleReqs, setRoleReqs] = useState<RoleSkillRequirement[]>([]);
  const [contextReqs, setContextReqs] = useState<WorkContextSkillRequirement[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showWorkContextModal, setShowWorkContextModal] = useState(false);

  // Scope filters
  const [scopeSearch, setScopeSearch] = useState("");
  const [scopeSiteFilter, setScopeSiteFilter] = useState("");
  const [scopeEnforcementFilter, setScopeEnforcementFilter] = useState("");
  const [scopeRequiredFilter, setScopeRequiredFilter] = useState("");

  // Work context filters
  const [contextSearch, setContextSearch] = useState("");
  const [contextTypeFilter, setContextTypeFilter] = useState("");
  const [contextEnforcementFilter, setContextEnforcementFilter] = useState("");

  const isAdmin = getCurrentUser()?.role === "ADMIN";
  const sites = getSites();
  const departments = getDepartments();

  useEffect(() => {
    const update = () => {
      setRoleReqs(getRoleSkillRequirements());
      setContextReqs(getWorkContextSkillRequirements());
    };
    update();
    return subscribe(update);
  }, []);

  // --- Scope-based filtering ---
  const filteredRoleReqs = useMemo(() => {
    return roleReqs.filter((req) => {
      const skill = getSkillV2ById(req.skillId);

      // Text search — matches skill name, job title, site name, dept name
      if (scopeSearch) {
        const q = scopeSearch.toLowerCase();
        const skillMatch = skill?.name.toLowerCase().includes(q);
        const jobMatch = req.jobTitle?.toLowerCase().includes(q);
        const siteMatch = getSiteName(req.siteId)?.toLowerCase().includes(q);
        const deptMatch = getDeptName(req.departmentId)?.toLowerCase().includes(q);
        if (!skillMatch && !jobMatch && !siteMatch && !deptMatch) return false;
      }

      // Site filter
      if (scopeSiteFilter && req.siteId !== scopeSiteFilter) return false;

      // Enforcement filter
      if (scopeEnforcementFilter && req.enforcementMode !== scopeEnforcementFilter) return false;

      // Required filter
      if (scopeRequiredFilter === "required" && !req.required) return false;
      if (scopeRequiredFilter === "recommended" && req.required) return false;

      return true;
    });
  }, [roleReqs, scopeSearch, scopeSiteFilter, scopeEnforcementFilter, scopeRequiredFilter]);

  // --- Work context filtering ---
  const filteredContextReqs = useMemo(() => {
    return contextReqs.filter((req) => {
      const skill = getSkillV2ById(req.skillId);

      // Text search — matches skill name or context key
      if (contextSearch) {
        const q = contextSearch.toLowerCase();
        const skillMatch = skill?.name.toLowerCase().includes(q);
        const keyMatch = req.contextKey.toLowerCase().includes(q);
        if (!skillMatch && !keyMatch) return false;
      }

      // Context type filter
      if (contextTypeFilter && req.contextType !== contextTypeFilter) return false;

      // Enforcement filter
      if (contextEnforcementFilter && req.enforcementMode !== contextEnforcementFilter) return false;

      return true;
    });
  }, [contextReqs, contextSearch, contextTypeFilter, contextEnforcementFilter]);

  const handleDeleteRoleReq = (id: string) => {
    if (confirm("Delete this requirement?")) {
      deleteRoleSkillRequirement(id);
    }
  };

  const handleDeleteContextReq = (id: string) => {
    if (confirm("Delete this work context requirement?")) {
      deleteWorkContextSkillRequirement(id);
    }
  };

  const getSiteName = (siteId?: string) => {
    if (!siteId) return null;
    return sites.find((s) => s.id === siteId)?.name || siteId;
  };

  const getDeptName = (deptId?: string) => {
    if (!deptId) return null;
    return departments.find((d) => d.id === deptId)?.name || deptId;
  };

  const hasScopeFilters = scopeSearch || scopeSiteFilter || scopeEnforcementFilter || scopeRequiredFilter;
  const hasContextFilters = contextSearch || contextTypeFilter || contextEnforcementFilter;

  const roleHeaders = isAdmin
    ? ["Scope", "Skill", "Required", "Enforcement", "Grace Period", "Actions"]
    : ["Scope", "Skill", "Required", "Enforcement", "Grace Period"];

  const contextHeaders = isAdmin
    ? ["Context Type", "Context Key", "Skill", "Required", "Enforcement", "Actions"]
    : ["Context Type", "Context Key", "Skill", "Required", "Enforcement"];

  return (
    <div className="space-y-6">
      {/* ===== Scope Requirements ===== */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Skill Requirements by Scope</h3>
            <p className="text-sm text-gray-500 mt-1">
              Define which skills are required by site, department, or job title
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowRoleModal(true)}>
              <Plus className="w-4 h-4" />
              Add Requirement
            </Button>
          )}
        </div>

        {/* Scope Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={scopeSearch}
              onChange={(e) => setScopeSearch(e.target.value)}
              placeholder="Search skill, job title, site..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={scopeSiteFilter}
            onChange={(e) => setScopeSiteFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={scopeRequiredFilter}
            onChange={(e) => setScopeRequiredFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">Required & Recommended</option>
            <option value="required">Required only</option>
            <option value="recommended">Recommended only</option>
          </select>

          <select
            value={scopeEnforcementFilter}
            onChange={(e) => setScopeEnforcementFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {ENFORCEMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasScopeFilters && (
            <button
              type="button"
              onClick={() => {
                setScopeSearch("");
                setScopeSiteFilter("");
                setScopeEnforcementFilter("");
                setScopeRequiredFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {hasScopeFilters && (
          <p className="text-xs text-gray-500 mb-3">
            Showing {filteredRoleReqs.length} of {roleReqs.length} requirements
          </p>
        )}

        {roleReqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No skill requirements configured yet.</p>
          </div>
        ) : filteredRoleReqs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No requirements match your filters.</p>
          </div>
        ) : (
          <Table headers={roleHeaders}>
            {filteredRoleReqs.map((req) => {
              const skill = getSkillV2ById(req.skillId);
              return (
                <tr key={req.id}>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {req.siteId && (
                        <Badge variant="info">{getSiteName(req.siteId)}</Badge>
                      )}
                      {req.departmentId && (
                        <Badge variant="default">{getDeptName(req.departmentId)}</Badge>
                      )}
                      {req.jobTitle && (
                        <Badge variant="exempt">{req.jobTitle}</Badge>
                      )}
                      {!req.siteId && !req.departmentId && !req.jobTitle && (
                        <Badge variant="default">All</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {skill?.name || req.skillId}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={req.required ? "error" : "warning"}>
                      {req.required ? "Required" : "Recommended"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        req.enforcementMode === "block"
                          ? "error"
                          : req.enforcementMode === "warn"
                          ? "warning"
                          : "default"
                      }
                    >
                      {req.enforcementMode}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {req.gracePeriodDays ? `${req.gracePeriodDays}d` : "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteRoleReq(req.id)}
                        className="px-2 py-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* ===== Work Context Requirements ===== */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Work Context Requirements</h3>
            <p className="text-sm text-gray-500 mt-1">
              Define skill requirements for specific work contexts (e.g., LOTO, confined spaces)
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowWorkContextModal(true)}>
              <Plus className="w-4 h-4" />
              Add Requirement
            </Button>
          )}
        </div>

        {/* Work Context Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={contextSearch}
              onChange={(e) => setContextSearch(e.target.value)}
              placeholder="Search skill or context key..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={contextTypeFilter}
            onChange={(e) => setContextTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {CONTEXT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={contextEnforcementFilter}
            onChange={(e) => setContextEnforcementFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {ENFORCEMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasContextFilters && (
            <button
              type="button"
              onClick={() => {
                setContextSearch("");
                setContextTypeFilter("");
                setContextEnforcementFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {hasContextFilters && (
          <p className="text-xs text-gray-500 mb-3">
            Showing {filteredContextReqs.length} of {contextReqs.length} requirements
          </p>
        )}

        {contextReqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No work context requirements configured yet.</p>
          </div>
        ) : filteredContextReqs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No requirements match your filters.</p>
          </div>
        ) : (
          <Table headers={contextHeaders}>
            {filteredContextReqs.map((req) => {
              const skill = getSkillV2ById(req.skillId);
              return (
                <tr key={req.id}>
                  <td className="px-6 py-4">
                    <Badge variant="exempt">{formatContextType(req.contextType)}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {req.contextKey}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {skill?.name || req.skillId}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={req.required ? "error" : "warning"}>
                      {req.required ? "Required" : "Recommended"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        req.enforcementMode === "block"
                          ? "error"
                          : req.enforcementMode === "warn"
                          ? "warning"
                          : "default"
                      }
                    >
                      {req.enforcementMode}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteContextReq(req.id)}
                        className="px-2 py-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Modals */}
      <AddRoleRequirementModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
      <AddWorkContextRequirementModal
        isOpen={showWorkContextModal}
        onClose={() => setShowWorkContextModal(false)}
      />
    </div>
  );
}
