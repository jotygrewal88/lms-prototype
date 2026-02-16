"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Plus, Search, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import {
  getActiveSkillsV2,
  getJobTitles,
  createJobTitle,
  updateJobTitle,
} from "@/lib/store";
import type { JobTitle, JobTitleSkillRequirement, SkillPriority } from "@/types";

interface JobTitleModalProps {
  editJobTitle?: JobTitle;
  onClose: () => void;
  onSaved: (jt: JobTitle) => void;
}

const PRIORITY_OPTIONS: { value: SkillPriority; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "text-red-600" },
  { value: "high", label: "High", color: "text-yellow-600" },
  { value: "medium", label: "Medium", color: "text-orange-500" },
  { value: "low", label: "Low", color: "text-green-600" },
];

const TIMELINE_OPTIONS = [3, 7, 14, 21, 30, 60, 90];

const DEPARTMENTS = ["Maintenance", "EHS", "Warehouse", "Operations", "Facilities", "Quality", "Engineering"];
const SITES = ["Plant A", "Plant B", "All Sites"];

export default function JobTitleModal({ editJobTitle, onClose, onSaved }: JobTitleModalProps) {
  const [name, setName] = useState(editJobTitle?.name || "");
  const [description, setDescription] = useState(editJobTitle?.description || "");
  const [department, setDepartment] = useState(editJobTitle?.department || "");
  const [site, setSite] = useState(editJobTitle?.site || "");
  const [requiredSkills, setRequiredSkills] = useState<JobTitleSkillRequirement[]>(
    editJobTitle?.requiredSkills || []
  );
  const [skillSearch, setSkillSearch] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

  const allSkills = getActiveSkillsV2();
  const selectedSkillIds = new Set(requiredSkills.map((s) => s.skillId));

  const filteredSkills = useMemo(() => {
    return allSkills.filter(
      (s) =>
        !selectedSkillIds.has(s.id) &&
        (s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
          s.category?.toLowerCase().includes(skillSearch.toLowerCase()))
    );
  }, [allSkills, skillSearch, selectedSkillIds]);

  const getSkillName = (skillId: string) =>
    allSkills.find((s) => s.id === skillId)?.name || skillId;

  const addSkill = (skillId: string) => {
    setRequiredSkills([
      ...requiredSkills,
      { skillId, required: true, priority: "high", targetTimelineDays: 30 },
    ]);
    setSkillSearch("");
    setSkillDropdownOpen(false);
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s.skillId !== skillId));
  };

  const updateSkillReq = (skillId: string, updates: Partial<JobTitleSkillRequirement>) => {
    setRequiredSkills(
      requiredSkills.map((s) => (s.skillId === skillId ? { ...s, ...updates } : s))
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      description: description.trim(),
      department,
      site,
      requiredSkills,
      active: true,
    };

    if (editJobTitle) {
      const updated = updateJobTitle(editJobTitle.id, data);
      if (updated) onSaved(updated);
    } else {
      const created = createJobTitle(data);
      onSaved(created);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editJobTitle ? "Edit Job Title" : "Create Job Title"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maintenance Technician - HVAC"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What this role does..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
            />
          </div>

          {/* Department + Site */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="">Select...</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="">Select...</option>
                {SITES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Required Skills</label>
              <span className="text-xs text-gray-500">{requiredSkills.length} skill{requiredSkills.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Skills table */}
            {requiredSkills.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left px-3 py-2 font-medium">Skill</th>
                      <th className="text-left px-3 py-2 font-medium w-28">Priority</th>
                      <th className="text-left px-3 py-2 font-medium w-28">Timeline</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {requiredSkills.map((req) => (
                      <tr key={req.skillId} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {getSkillName(req.skillId)}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={req.priority}
                            onChange={(e) =>
                              updateSkillReq(req.skillId, {
                                priority: e.target.value as SkillPriority,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {PRIORITY_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={req.targetTimelineDays}
                            onChange={(e) =>
                              updateSkillReq(req.skillId, {
                                targetTimelineDays: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {TIMELINE_OPTIONS.map((d) => (
                              <option key={d} value={d}>
                                {d} days
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeSkill(req.skillId)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Skill */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setSkillDropdownOpen(true);
                  }}
                  onFocus={() => setSkillDropdownOpen(true)}
                  placeholder="Search skills to add..."
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              {skillDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setSkillDropdownOpen(false)} />
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                    {filteredSkills.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No matching skills</div>
                    ) : (
                      filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => addSkill(skill.id)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                            <div className="text-xs text-gray-500">
                              {skill.category} &middot;{" "}
                              {skill.type === "certification" ? "Certification" : "Skill"}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
            {editJobTitle ? "Save Changes" : "Create Job Title"}
          </Button>
        </div>
      </div>
    </div>
  );
}
