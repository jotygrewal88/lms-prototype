// Skills tab — migrated from /admin/skills
// Top section: Skills Library (catalog)
// Bottom section: Work Context Requirements
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import {
  getActiveSkillsV2,
  getUserSkillRecords,
  deleteSkillV2,
  getWorkContextSkillRequirements,
  getSkillV2ById,
  deleteWorkContextSkillRequirement,
  getCurrentUser,
  subscribe,
} from "@/lib/store";
import SkillModalV2 from "@/components/admin/skills/SkillModalV2";
import AddWorkContextRequirementModal from "@/components/admin/skills/AddWorkContextRequirementModal";
import type { SkillV2, WorkContextSkillRequirement, WorkContextType, EnforcementMode } from "@/types";

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
  ct
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function SkillsTab() {
  const [skills, setSkills] = useState(getActiveSkillsV2());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "skill" | "certification">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillV2 | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Work context state
  const [contextReqs, setContextReqs] = useState<WorkContextSkillRequirement[]>([]);
  const [showWorkContextModal, setShowWorkContextModal] = useState(false);
  const [contextSearch, setContextSearch] = useState("");
  const [contextTypeFilter, setContextTypeFilter] = useState("");
  const [contextEnforcementFilter, setContextEnforcementFilter] = useState("");

  const isAdmin = getCurrentUser()?.role === "ADMIN";

  useEffect(() => {
    const update = () => {
      setSkills(getActiveSkillsV2());
      setContextReqs(getWorkContextSkillRequirements());
    };
    update();
    return subscribe(update);
  }, []);

  // ─── Skills Library ──────────────────────────────────────────────

  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean))
  ) as string[];

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.regulatoryRef?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || skill.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleCreateSkill = () => {
    setEditingSkill(undefined);
    setShowSkillModal(true);
  };

  const handleEditSkill = (skill: SkillV2) => {
    setEditingSkill(skill);
    setShowSkillModal(true);
  };

  const handleDeleteSkill = (skillId: string) => {
    const userRecords = getUserSkillRecords().filter((r) => r.skillId === skillId);
    if (userRecords.length > 0) {
      alert(`Cannot delete this skill. ${userRecords.length} user(s) have this skill.`);
      return;
    }
    setShowDeleteConfirm(skillId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteSkillV2(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const getUserCountForSkill = (skillId: string) =>
    getUserSkillRecords().filter((r) => r.skillId === skillId && r.status === "active").length;

  const formatExpiry = (days?: number) => {
    if (!days) return "No expiry";
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
    return `${days} days`;
  };

  // ─── Work Context ────────────────────────────────────────────────

  const filteredContextReqs = useMemo(() => {
    return contextReqs.filter((req) => {
      const skill = getSkillV2ById(req.skillId);
      if (contextSearch) {
        const q = contextSearch.toLowerCase();
        const skillMatch = skill?.name.toLowerCase().includes(q);
        const keyMatch = req.contextKey.toLowerCase().includes(q);
        if (!skillMatch && !keyMatch) return false;
      }
      if (contextTypeFilter && req.contextType !== contextTypeFilter) return false;
      if (contextEnforcementFilter && req.enforcementMode !== contextEnforcementFilter) return false;
      return true;
    });
  }, [contextReqs, contextSearch, contextTypeFilter, contextEnforcementFilter]);

  const hasContextFilters = contextSearch || contextTypeFilter || contextEnforcementFilter;

  const handleDeleteContextReq = (id: string) => {
    if (confirm("Delete this work context requirement?")) {
      deleteWorkContextSkillRequirement(id);
    }
  };

  const contextHeaders = isAdmin
    ? ["Context Type", "Context Key", "Skill", "Required", "Enforcement", "Actions"]
    : ["Context Type", "Context Key", "Skill", "Required", "Enforcement"];

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ═══════ Skills Library Section ═══════ */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Skills Library</h2>
          <p className="text-sm text-gray-500">All skills and certifications in your organization</p>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "skill" | "certification")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="skill">Skills</option>
              <option value="certification">Certifications</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {isAdmin && (
              <Button onClick={handleCreateSkill} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Skill
              </Button>
            )}
          </div>
        </Card>

        <div className="text-sm text-gray-500 mb-3">
          Showing {filteredSkills.length} of {skills.length} skills
        </div>

        <Card>
          <Table
            headers={[
              "Name",
              "Type",
              "Category",
              "Expiry",
              "Users",
              "Evidence Required",
              ...(isAdmin ? ["Actions"] : []),
            ]}
          >
            {filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? "No skills found matching your search" : "No skills available"}
                </td>
              </tr>
            ) : (
              filteredSkills.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                      {skill.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                      )}
                      {skill.regulatoryRef && (
                        <div className="text-xs text-blue-600 mt-0.5">{skill.regulatoryRef}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={skill.type === "certification" ? "info" : "default"}>
                      {skill.type === "certification" ? "Certification" : "Skill"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{skill.category || "General"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatExpiry(skill.expiryDays)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getUserCountForSkill(skill.id)}
                  </td>
                  <td className="px-6 py-4">
                    {skill.requiresEvidence ? (
                      <Badge variant="success">Required</Badge>
                    ) : (
                      <Badge variant="default">Optional</Badge>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSkill(skill)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>

      {/* ═══════ Work Context Requirements Section ═══════ */}
      <div>
        <div className="border-t border-gray-200 pt-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Work Context Requirements</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Skills required for specific types of work (for future CMMS integration)
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowWorkContextModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contextSearch}
                  onChange={(e) => setContextSearch(e.target.value)}
                  placeholder="Search skill or context key..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={contextTypeFilter}
                onChange={(e) => setContextTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {CONTEXT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <select
                value={contextEnforcementFilter}
                onChange={(e) => setContextEnforcementFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {ENFORCEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
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
        </div>
      </div>

      {/* ═══════ Modals ═══════ */}
      {showSkillModal && (
        <SkillModalV2
          skill={editingSkill}
          onClose={() => {
            setShowSkillModal(false);
            setEditingSkill(undefined);
          }}
        />
      )}

      {showDeleteConfirm && (
        <Modal isOpen={true} onClose={() => setShowDeleteConfirm(null)} title="Delete Skill">
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this skill? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <AddWorkContextRequirementModal
        isOpen={showWorkContextModal}
        onClose={() => setShowWorkContextModal(false)}
      />
    </div>
  );
}
