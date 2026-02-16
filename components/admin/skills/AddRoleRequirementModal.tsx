"use client";

import React, { useState, useMemo } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import {
  getActiveSkillsV2,
  createRoleSkillRequirement,
  getSites,
  getDepartments,
  getUsers,
} from "@/lib/store";
import type { EnforcementMode } from "@/types";

interface AddRoleRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ENFORCEMENT_MODES: { label: string; value: EnforcementMode }[] = [
  { label: "None", value: "none" },
  { label: "Warn", value: "warn" },
  { label: "Block", value: "block" },
];

export default function AddRoleRequirementModal({ isOpen, onClose }: AddRoleRequirementModalProps) {
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [required, setRequired] = useState(true);
  const [enforcementMode, setEnforcementMode] = useState<EnforcementMode>("warn");
  const [gracePeriodDays, setGracePeriodDays] = useState("");

  const skills = getActiveSkillsV2();
  const sites = getSites();
  const allDepartments = getDepartments();
  const users = getUsers();

  // Filter departments based on selected site
  const filteredDepartments = useMemo(() => {
    if (!siteId) return allDepartments;
    return allDepartments.filter((d) => d.siteId === siteId);
  }, [allDepartments, siteId]);

  // Get unique job titles from users, filtered by site/department selection
  const availableJobTitles = useMemo(() => {
    let filtered = users.filter((u) => u.jobTitleText);
    if (siteId) {
      filtered = filtered.filter((u) => u.siteId === siteId);
    }
    if (departmentId) {
      filtered = filtered.filter((u) => u.departmentId === departmentId);
    }
    const titles = [...new Set(filtered.map((u) => u.jobTitleText!))].sort();
    return titles;
  }, [users, siteId, departmentId]);

  // Group skills by category for easier browsing
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, typeof skills> = {};
    for (const skill of skills) {
      const cat = skill.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill);
    }
    return grouped;
  }, [skills]);

  const handleSiteChange = (newSiteId: string) => {
    setSiteId(newSiteId);
    // Clear department if it's no longer valid for the new site
    if (newSiteId && departmentId) {
      const deptValid = allDepartments.some(
        (d) => d.id === departmentId && d.siteId === newSiteId
      );
      if (!deptValid) {
        setDepartmentId("");
      }
    }
    // Clear job title since the pool changed
    setJobTitle("");
  };

  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    // Clear job title since the pool changed
    setJobTitle("");
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = () => {
    if (selectedSkillIds.length === 0) return;

    const grace = gracePeriodDays ? parseInt(gracePeriodDays, 10) : undefined;

    for (const skillId of selectedSkillIds) {
      createRoleSkillRequirement({
        siteId: siteId || undefined,
        departmentId: departmentId || undefined,
        jobTitle: jobTitle || undefined,
        skillId,
        required,
        enforcementMode,
        gracePeriodDays: grace,
      });
    }

    // Reset and close
    setSiteId("");
    setDepartmentId("");
    setJobTitle("");
    setSelectedSkillIds([]);
    setRequired(true);
    setEnforcementMode("warn");
    setGracePeriodDays("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Skill Requirement" size="large">
      <div className="space-y-5">
        {/* Scope: Site → Department → Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Scope
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Leave blank to apply to all. Selecting a site filters departments and job titles.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {/* Site */}
            <div>
              <label htmlFor="rsr-site" className="block text-xs font-medium text-gray-600 mb-1">
                Site
              </label>
              <select
                id="rsr-site"
                value={siteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.region ? ` (${s.region})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="rsr-dept" className="block text-xs font-medium text-gray-600 mb-1">
                Department
              </label>
              <select
                id="rsr-dept"
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">All Departments</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label htmlFor="rsr-jobtitle" className="block text-xs font-medium text-gray-600 mb-1">
                Job Title
              </label>
              <select
                id="rsr-jobtitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">All Job Titles</option>
                {availableJobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skill Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Skills <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Select one or more skills to require
          </p>
          <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                  {category}
                </div>
                {catSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkillIds.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{skill.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{skill.type}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          {selectedSkillIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedSkillIds.length} skill{selectedSkillIds.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Required Toggle + Enforcement Mode + Grace Period */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Required</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                {required ? "Mandatory" : "Recommended"}
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="enforcement" className="block text-sm font-medium text-gray-700 mb-1.5">
              Enforcement
            </label>
            <select
              id="enforcement"
              value={enforcementMode}
              onChange={(e) => setEnforcementMode(e.target.value as EnforcementMode)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {ENFORCEMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gracePeriod" className="block text-sm font-medium text-gray-700 mb-1.5">
              Grace Period (days)
            </label>
            <input
              type="number"
              id="gracePeriod"
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(e.target.value)}
              placeholder="e.g., 30"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedSkillIds.length === 0}
          >
            Add {selectedSkillIds.length > 0 ? `${selectedSkillIds.length} Requirement${selectedSkillIds.length !== 1 ? "s" : ""}` : "Requirement"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
