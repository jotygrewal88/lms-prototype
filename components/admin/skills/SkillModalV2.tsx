// Skills V2: Create/Edit Skill Modal (placeholder — full implementation in follow-up)
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { createSkillV2, updateSkillV2 } from "@/lib/store";
import type { SkillV2 } from "@/types";

interface SkillModalV2Props {
  skill?: SkillV2;
  onClose: () => void;
}

const CATEGORIES = ["Safety", "Equipment", "Technical", "Compliance", "Leadership", "Other"];

export default function SkillModalV2({ skill, onClose }: SkillModalV2Props) {
  const [name, setName] = useState(skill?.name || "");
  const [category, setCategory] = useState(skill?.category || "");
  const [type, setType] = useState<"skill" | "certification">(skill?.type || "skill");
  const [description, setDescription] = useState(skill?.description || "");
  const [regulatoryRef, setRegulatoryRef] = useState(skill?.regulatoryRef || "");
  const [expiryDays, setExpiryDays] = useState<number | "">(skill?.expiryDays || "");
  const [requiresEvidence, setRequiresEvidence] = useState(skill?.requiresEvidence || false);
  const [requiresAssessment, setRequiresAssessment] = useState(skill?.requiresAssessment || false);
  const [level, setLevel] = useState<number | "">(skill?.level || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      category: category || undefined,
      type,
      description: description || undefined,
      regulatoryRef: regulatoryRef || undefined,
      expiryDays: expiryDays ? Number(expiryDays) : undefined,
      requiresEvidence,
      requiresAssessment,
      level: level ? Number(level) : undefined,
      active: true,
    };

    if (skill) {
      updateSkillV2(skill.id, data);
    } else {
      createSkillV2({ id: `skl_${Date.now()}`, ...data });
    }

    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={skill ? "Edit Skill" : "Create Skill"} size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., LOTO Certified"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "skill" | "certification")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="skill">Skill</option>
              <option value="certification">Certification</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Reference</label>
            <input
              type="text"
              value={regulatoryRef}
              onChange={(e) => setRegulatoryRef(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., OSHA 1910.147"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {type === "certification" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (days)</label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 365"
                min={1}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level (optional)</label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1, 2, or 3"
              min={1}
              max={3}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={requiresEvidence}
              onChange={(e) => setRequiresEvidence(e.target.checked)}
              className="rounded border-gray-300"
            />
            Requires Evidence
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={requiresAssessment}
              onChange={(e) => setRequiresAssessment(e.target.checked)}
              className="rounded border-gray-300"
            />
            Requires Assessment
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{skill ? "Update Skill" : "Create Skill"}</Button>
        </div>
      </form>
    </Modal>
  );
}
