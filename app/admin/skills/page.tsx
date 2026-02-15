// Skills V2: Admin Skills Management Page
"use client";

import React, { useState, useEffect } from "react";
import { Shield, Plus, Search } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Modal from "@/components/Modal";
import {
  getActiveSkillsV2,
  getUserSkillRecords,
  getCurrentUser,
  deleteSkillV2,
  subscribe,
} from "@/lib/store";
import SkillModalV2 from "@/components/admin/skills/SkillModalV2";
import UserSkillsPanel from "@/components/admin/skills/UserSkillsPanel";
import RequirementsPanel from "@/components/admin/skills/RequirementsPanel";
import type { SkillV2 } from "@/types";

type Tab = "library" | "user-skills" | "requirements";

export default function SkillsAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [skills, setSkills] = useState(getActiveSkillsV2());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "skill" | "certification">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillV2 | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setSkills(getActiveSkillsV2());
    });
    return unsubscribe;
  }, []);

  // Get unique categories
  const categories = Array.from(
    new Set(skills.map((s) => s.category).filter(Boolean))
  ) as string[];

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.regulatoryRef?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || skill.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || skill.category === categoryFilter;
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
      alert(
        `Cannot delete this skill. ${userRecords.length} user(s) have this skill.`
      );
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

  // Count users per skill
  const getUserCountForSkill = (skillId: string) => {
    return getUserSkillRecords().filter(
      (r) => r.skillId === skillId && r.status === "active"
    ).length;
  };

  const formatExpiry = (days?: number) => {
    if (!days) return "No expiry";
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
    return `${days} days`;
  };

  return (
    <RouteGuard>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
              </div>
              <p className="text-gray-500 mt-1">
                Manage skills, certifications, and user competencies
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {[
                { id: "library" as Tab, label: "Skills Library" },
                { id: "user-skills" as Tab, label: "User Skills" },
                { id: "requirements" as Tab, label: "Requirements" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "library" && (
            <div className="space-y-4">
              {/* Filters */}
              <Card>
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

              {/* Results count */}
              <div className="text-sm text-gray-500">
                Showing {filteredSkills.length} of {skills.length} skills
              </div>

              {/* Skills Table */}
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
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
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
                              <div className="text-xs text-blue-600 mt-0.5">
                                {skill.regulatoryRef}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={skill.type === "certification" ? "info" : "default"}
                          >
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
          )}

          {activeTab === "user-skills" && <UserSkillsPanel />}
          {activeTab === "requirements" && <RequirementsPanel />}
        </div>

        {/* Create/Edit Skill Modal */}
        {showSkillModal && (
          <SkillModalV2
            skill={editingSkill}
            onClose={() => {
              setShowSkillModal(false);
              setEditingSkill(undefined);
            }}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Modal
            isOpen={true}
            onClose={() => setShowDeleteConfirm(null)}
            title="Delete Skill"
          >
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
      </AdminLayout>
    </RouteGuard>
  );
}
