"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  AlertTriangle,
  Users,
  FileText,
  Zap,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import {
  getActiveSkillsV2,
  getUserSkillRecordsBySkillId,
  getLibraryItems,
  getUser,
  getCurrentUser,
  createTrainingResponse,
  acknowledgeSignal,
} from "@/lib/store";
import { generateTrainingResponse } from "@/lib/mockTrainingGenerator";
import type {
  OperationalSignal,
  TrainingResponseType,
  TrainingResponseTrigger,
} from "@/types";
import { getFullName } from "@/types";

const SIGNAL_TO_RESPONSE_TYPE: Record<string, TrainingResponseType> = {
  individual_retraining: "incident_retraining",
  corrective_training: "corrective_training",
  micro_lesson: "near_miss_briefing",
  delta_renewal: "regulatory_update",
  content_review: "corrective_training",
  full_regeneration: "rebuilt_renewal",
};

const RESPONSE_TYPE_LABELS: Record<string, string> = {
  incident_retraining: "Incident Retraining",
  corrective_training: "Corrective Training",
  near_miss_briefing: "Near-Miss Briefing",
  regulatory_update: "Regulatory Update",
  delta_renewal: "Delta Renewal",
  rebuilt_renewal: "Full Rebuild",
  clean_renewal: "Clean Renewal",
  new_equipment_process: "New Equipment/Process",
};

interface Props {
  signal: OperationalSignal;
  onClose: () => void;
  onGenerated: (responseId: string) => void;
}

export default function GenerateTrainingModal({ signal, onClose, onGenerated }: Props) {
  const currentUser = getCurrentUser();
  const allSkills = getActiveSkillsV2();
  const allSources = getLibraryItems();

  const defaultType =
    SIGNAL_TO_RESPONSE_TYPE[signal.recommendedAction] || "corrective_training";
  const [responseType, setResponseType] = useState<TrainingResponseType>(defaultType);
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showSourceSelect, setShowSourceSelect] = useState(false);

  // Pre-populate target users based on signal type
  const suggestedUserIds = useMemo(() => {
    if (signal.involvedUserIds && signal.involvedUserIds.length > 0) {
      return [...signal.involvedUserIds];
    }
    // For corrective/regulatory - find all users with affected skills
    const userIds = new Set<string>();
    for (const sid of signal.affectedSkillIds) {
      const records = getUserSkillRecordsBySkillId(sid);
      for (const r of records) {
        if (r.status === "active" || r.status === "expiring" || r.status === "suspended") {
          userIds.add(r.userId);
        }
      }
    }
    return Array.from(userIds);
  }, [signal]);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(suggestedUserIds);

  // Pre-select sources that match affected skills
  const recommendedSourceIds = useMemo(() => {
    const skillNames = signal.affectedSkillIds
      .map((id) => allSkills.find((s) => s.id === id))
      .filter(Boolean);
    return allSources
      .filter((src) => {
        if (!src.allowedForSynthesis) return false;
        const titleLower = (src.title || "").toLowerCase();
        return skillNames.some((s) => {
          const kw = s!.name.toLowerCase().split(/\s+/);
          return kw.some((k) => titleLower.includes(k));
        });
      })
      .map((s) => s.id);
  }, [signal, allSkills, allSources]);

  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(recommendedSourceIds);

  // Skill impact statement
  const skillImpactText = useMemo(() => {
    if (responseType === "near_miss_briefing") return "No skill impact — informational briefing only.";
    const action =
      responseType === "incident_retraining"
        ? "SUSPENDED"
        : responseType === "regulatory_update" || responseType === "corrective_training"
        ? "FLAGGED"
        : "affected";
    const skillNamesStr = signal.affectedSkillIds
      .map((id) => allSkills.find((s) => s.id === id)?.name || id)
      .join(", ");
    const userNames = selectedUserIds
      .map((uid) => getUser(uid))
      .filter(Boolean)
      .map((u) => getFullName(u!))
      .slice(0, 3);
    const extra = selectedUserIds.length > 3 ? ` +${selectedUserIds.length - 3} more` : "";
    return `${skillNamesStr} will be ${action} for ${userNames.join(", ")}${extra} until training is complete.`;
  }, [responseType, signal, selectedUserIds, allSkills]);

  const toggleUser = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleSource = (sid: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateTrainingResponse({
        type: responseType,
        signalId: signal.id,
        targetUserIds: selectedUserIds,
        sourceIds: selectedSourceIds,
        affectedSkillIds: signal.affectedSkillIds,
        additionalInstructions: instructions || undefined,
        generatedByUserId: currentUser.id,
        triggerType: "signal" as TrainingResponseTrigger,
      });
      const created = createTrainingResponse(result);
      if (signal.status === "open") {
        acknowledgeSignal(signal.id, currentUser.id);
      }
      onGenerated(created.id);
    } catch {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Generate Training Response</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-700 font-medium mb-1">Generating training response...</p>
            <p className="text-sm text-gray-500">Analyzing signal, building content, mapping skills</p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Section 1: Signal Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Triggering Signal
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={signal.severity === "critical" ? "error" : signal.severity === "high" ? "warning" : "info"}>
                  {signal.severity.toUpperCase()}
                </Badge>
                <span className="font-medium text-gray-900 text-sm">{signal.title}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{signal.description}</p>
            </div>

            {/* Section 2: Response Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Response Type
              </label>
              <select
                value={responseType}
                onChange={(e) => setResponseType(e.target.value as TrainingResponseType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(RESPONSE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section 3: Target Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Users className="w-4 h-4 inline mr-1" />
                Target Users ({selectedUserIds.length})
              </label>
              <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
                {suggestedUserIds.map((uid) => {
                  const user = getUser(uid);
                  if (!user) return null;
                  return (
                    <label
                      key={uid}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(uid)}
                        onChange={() => toggleUser(uid)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-800">{getFullName(user)}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {user.jobTitleText || user.role}
                      </span>
                    </label>
                  );
                })}
                {suggestedUserIds.length === 0 && (
                  <p className="text-xs text-gray-400 p-3">
                    No users automatically identified. Add users manually.
                  </p>
                )}
              </div>
            </div>

            {/* Section 4: Sources */}
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

            {/* Section 5: Additional Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Instructions (optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="Any specific focus areas, tone, or content to include..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            {/* Section 6: Skill Impact */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800">Skill Impact</p>
                <p className="text-xs text-amber-700">{skillImpactText}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={selectedUserIds.length === 0}
              >
                <Zap className="w-4 h-4" />
                Generate Training
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
