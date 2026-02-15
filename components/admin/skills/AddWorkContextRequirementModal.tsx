"use client";

import React, { useState, useMemo } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { getActiveSkillsV2, createWorkContextSkillRequirement } from "@/lib/store";
import type { EnforcementMode, WorkContextType } from "@/types";

interface AddWorkContextRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTEXT_TYPES: { label: string; value: WorkContextType }[] = [
  { label: "Asset Type", value: "asset_type" },
  { label: "Work Order Type", value: "work_order_type" },
  { label: "Permit Type", value: "permit_type" },
  { label: "Inspection Type", value: "inspection_type" },
  { label: "Training Type", value: "training_type" },
];

const ENFORCEMENT_MODES: { label: string; value: EnforcementMode }[] = [
  { label: "None", value: "none" },
  { label: "Warn", value: "warn" },
  { label: "Block", value: "block" },
];

export default function AddWorkContextRequirementModal({
  isOpen,
  onClose,
}: AddWorkContextRequirementModalProps) {
  const [contextType, setContextType] = useState<WorkContextType>("asset_type");
  const [contextKey, setContextKey] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [required, setRequired] = useState(true);
  const [enforcementMode, setEnforcementMode] = useState<EnforcementMode>("warn");

  const skills = getActiveSkillsV2();

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

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = () => {
    if (selectedSkillIds.length === 0 || !contextKey.trim()) return;

    for (const skillId of selectedSkillIds) {
      createWorkContextSkillRequirement({
        contextType,
        contextKey: contextKey.trim(),
        skillId,
        required,
        enforcementMode,
      });
    }

    // Reset and close
    setContextType("asset_type");
    setContextKey("");
    setSelectedSkillIds([]);
    setRequired(true);
    setEnforcementMode("warn");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Work Context Requirement" size="medium">
      <div className="space-y-5">
        {/* Context Type + Key row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contextType" className="block text-sm font-medium text-gray-700 mb-1.5">
              Context Type <span className="text-red-500">*</span>
            </label>
            <select
              id="contextType"
              value={contextType}
              onChange={(e) => setContextType(e.target.value as WorkContextType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {CONTEXT_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contextKey" className="block text-sm font-medium text-gray-700 mb-1.5">
              Context Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contextKey"
              value={contextKey}
              onChange={(e) => setContextKey(e.target.value)}
              placeholder="e.g., LOTO, ConfinedSpace, HotWork"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Skill Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Skills <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Select one or more skills required for this work context
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

        {/* Required Toggle + Enforcement Mode row */}
        <div className="grid grid-cols-2 gap-4">
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
                {required ? "Mandatory for context" : "Recommended only"}
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="wcEnforcement" className="block text-sm font-medium text-gray-700 mb-1.5">
              Enforcement Mode
            </label>
            <select
              id="wcEnforcement"
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
            disabled={selectedSkillIds.length === 0 || !contextKey.trim()}
          >
            Add {selectedSkillIds.length > 0 ? `${selectedSkillIds.length} Requirement${selectedSkillIds.length !== 1 ? "s" : ""}` : "Requirement"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
