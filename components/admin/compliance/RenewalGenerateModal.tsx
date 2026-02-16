"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Zap,
  Loader2,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import {
  getSkillV2ById,
  getUser,
  getLibraryItems,
  getCurrentUser,
  createTrainingResponse,
} from "@/lib/store";
import { generateTrainingResponse } from "@/lib/mockTrainingGenerator";
import { getFullName } from "@/types";
import type { TrainingResponseType } from "@/types";

interface Props {
  userId: string;
  skillId: string;
  renewalType: "clean" | "delta" | "rebuilt";
  reason: string;
  onClose: () => void;
  onGenerated: (responseId: string) => void;
}

export default function RenewalGenerateModal({
  userId,
  skillId,
  renewalType,
  reason,
  onClose,
  onGenerated,
}: Props) {
  const currentUser = getCurrentUser();
  const user = getUser(userId);
  const skill = getSkillV2ById(skillId);
  const allSources = getLibraryItems();
  const [generating, setGenerating] = useState(false);
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  const [instructions, setInstructions] = useState("");

  const responseType: TrainingResponseType =
    renewalType === "delta"
      ? "delta_renewal"
      : renewalType === "rebuilt"
      ? "rebuilt_renewal"
      : "clean_renewal";

  const recommendedSourceIds = useMemo(() => {
    if (!skill) return [];
    const kw = skill.name.toLowerCase().split(/\s+/);
    return allSources
      .filter((src) => {
        if (!src.allowedForSynthesis) return false;
        const t = (src.title || "").toLowerCase();
        return kw.some((k) => t.includes(k));
      })
      .map((s) => s.id);
  }, [skill, allSources]);

  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(recommendedSourceIds);

  const toggleSource = (sid: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  const typeLabel =
    renewalType === "clean"
      ? "Clean Renewal"
      : renewalType === "delta"
      ? "Delta Renewal"
      : "Full Rebuild";
  const typeColor =
    renewalType === "clean"
      ? "success"
      : renewalType === "delta"
      ? "warning"
      : "error";

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateTrainingResponse({
        type: responseType,
        targetUserIds: [userId],
        sourceIds: selectedSourceIds,
        affectedSkillIds: [skillId],
        additionalInstructions: instructions || undefined,
        generatedByUserId: currentUser.id,
        triggerType: "renewal",
        triggeredByRenewalSkillId: skillId,
      });
      const created = createTrainingResponse(result);
      onGenerated(created.id);
    } catch {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-gray-900">Generate Renewal Training</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-gray-700 font-medium mb-1">Generating renewal training...</p>
            <p className="text-sm text-gray-500">Building content based on renewal analysis</p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* User & Skill */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {user ? getFullName(user) : userId}
                  </p>
                  <p className="text-xs text-gray-500">{user?.jobTitleText || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{skill?.name || skillId}</span>
                <Badge variant={typeColor as "success" | "warning" | "error"}>
                  {typeLabel}
                </Badge>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-800 mb-0.5">Renewal Analysis</p>
              <p className="text-xs text-blue-700">{reason}</p>
            </div>

            {/* Sources */}
            <div>
              <button
                onClick={() => setShowSourceSelect(!showSourceSelect)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <FileText className="w-4 h-4" />
                Knowledge Sources ({selectedSourceIds.length})
                {showSourceSelect ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {showSourceSelect && (
                <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
                  {allSources
                    .filter((s) => s.allowedForSynthesis)
                    .map((src) => (
                      <label
                        key={src.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSourceIds.includes(src.id)}
                          onChange={() => toggleSource(src.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-800">{src.title}</span>
                        {recommendedSourceIds.includes(src.id) && (
                          <Badge variant="success">Recommended</Badge>
                        )}
                      </label>
                    ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Instructions (optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="Any specific focus areas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleGenerate}>
                <Zap className="w-4 h-4" />
                Generate {typeLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
