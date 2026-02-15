// Skills V2: Multi-select skill picker for trainings/courses
"use client";

import React, { useState, useMemo } from "react";
import { Plus, X, Search } from "lucide-react";
import { getActiveSkillsV2 } from "@/lib/store";
import type { SkillV2 } from "@/types";

interface SkillGrant {
  skillId: string;
  level?: number;
  evidenceRequired: boolean;
}

interface SkillPickerV2Props {
  selectedSkills: SkillGrant[];
  onChange: (skills: SkillGrant[]) => void;
}

export default function SkillPickerV2({ selectedSkills, onChange }: SkillPickerV2Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const allSkills = getActiveSkillsV2();

  const selectedIds = new Set(selectedSkills.map((s) => s.skillId));

  const filtered = useMemo(() => {
    return allSkills.filter(
      (s) =>
        !selectedIds.has(s.id) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allSkills, search, selectedIds]);

  const addSkill = (skill: SkillV2) => {
    onChange([
      ...selectedSkills,
      { skillId: skill.id, evidenceRequired: skill.requiresEvidence },
    ]);
    setSearch("");
    setIsOpen(false);
  };

  const removeSkill = (skillId: string) => {
    onChange(selectedSkills.filter((s) => s.skillId !== skillId));
  };

  const getSkillName = (skillId: string) => {
    return allSkills.find((s) => s.id === skillId)?.name || skillId;
  };

  return (
    <div className="space-y-2">
      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((sg) => (
            <span
              key={sg.skillId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
            >
              {getSkillName(sg.skillId)}
              <button
                type="button"
                onClick={() => removeSkill(sg.skillId)}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search / Add */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search skills to add..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {allSkills.length === 0
                  ? "No skills available. Create skills first."
                  : "No matching skills found"}
              </div>
            ) : (
              filtered.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                    <div className="text-xs text-gray-500">
                      {skill.category} &middot; {skill.type === "certification" ? "Certification" : "Skill"}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Click-away handler */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
