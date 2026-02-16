"use client";

import React, { useState, useMemo } from "react";
import { X as XIcon, Lightbulb, AlertTriangle } from "lucide-react";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import {
  getActiveSkillsV2,
  getSites,
  getDepartments,
  getCurrentUser,
  createOperationalSignal,
  suspendUserSkill,
} from "@/lib/store";
import { getFullName, type User } from "@/types";
import type { SignalType, SignalSeverity, RecommendedAction } from "@/types";

const TYPE_OPTIONS: { value: SignalType; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "near_miss", label: "Near Miss" },
  { value: "regulatory_change", label: "Regulatory Change" },
  { value: "equipment_change", label: "Equipment Change" },
  { value: "process_change", label: "Process Change" },
  { value: "assessment_anomaly", label: "Assessment Anomaly" },
];

const SEVERITY_OPTIONS: { value: SignalSeverity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  incident:
    "Describe what happened, where, when, and what went wrong...",
  near_miss:
    "Describe the near-miss event, what could have happened, contributing factors...",
  regulatory_change:
    "Describe what regulation changed, what's different, effective date...",
  equipment_change:
    "Describe what equipment was installed or modified, location, impact on operations...",
  process_change:
    "Describe what SOP or procedure was changed, what's different...",
  assessment_anomaly:
    "Describe the assessment issue — failure rate changes, patterns, suspected causes...",
};

const DEFAULT_SEVERITY: Record<string, SignalSeverity> = {
  incident: "high",
  near_miss: "medium",
  regulatory_change: "high",
  source_update: "medium",
  equipment_change: "medium",
  process_change: "medium",
  assessment_anomaly: "low",
};

function computeRecommendation(
  type: SignalType,
  severity: SignalSeverity,
  hasInvolvedUsers: boolean,
  affectedSkillCount: number
): { action: RecommendedAction; reason: string } {
  if (type === "incident" && hasInvolvedUsers && (severity === "critical" || severity === "high")) {
    return {
      action: "individual_retraining",
      reason:
        "Involved individuals should have affected skill certifications suspended until incident-specific retraining is completed.",
    };
  }
  if (type === "incident" && severity === "critical" && !hasInvolvedUsers) {
    return {
      action: "corrective_training",
      reason:
        "Systemic incident — corrective training recommended for all workers with affected skills.",
    };
  }
  if (type === "near_miss") {
    return {
      action: "micro_lesson",
      reason:
        "A short awareness briefing is recommended for workers in the affected department.",
    };
  }
  if (type === "regulatory_change") {
    return {
      action: "delta_renewal",
      reason: `All workers with skills linked to this regulation should complete updated training.`,
    };
  }
  if (type === "equipment_change" || type === "process_change") {
    return {
      action: "content_review",
      reason:
        "Review affected training content for accuracy based on the change.",
    };
  }
  if (type === "assessment_anomaly") {
    return {
      action: "content_review",
      reason:
        "Assessment failure rates suggest training content may need updating.",
    };
  }
  return { action: "none", reason: "" };
}

export default function LogSignalModal({
  allUsers,
  onClose,
}: {
  allUsers: User[];
  onClose: () => void;
}) {
  const allSkills = getActiveSkillsV2();
  const sites = getSites();
  const departments = getDepartments();
  const currentUser = getCurrentUser();

  const [type, setType] = useState<SignalType>("incident");
  const [severity, setSeverity] = useState<SignalSeverity>("high");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [workContext, setWorkContext] = useState("");
  const [involvedUserIds, setInvolvedUserIds] = useState<Set<string>>(new Set());
  const [regulatoryRef, setRegulatoryRef] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [actionOverride, setActionOverride] = useState<RecommendedAction | "">("");
  const [toast, setToast] = useState<string | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [pendingSignalId, setPendingSignalId] = useState("");

  const showPeople = type === "incident" || type === "near_miss";
  const showRegulatory = type === "regulatory_change";

  const recommendation = useMemo(
    () =>
      computeRecommendation(
        type,
        severity,
        involvedUserIds.size > 0,
        selectedSkillIds.size
      ),
    [type, severity, involvedUserIds.size, selectedSkillIds.size]
  );

  const finalAction = actionOverride || recommendation.action;

  const handleTypeChange = (t: SignalType) => {
    setType(t);
    setSeverity(DEFAULT_SEVERITY[t] || "medium");
  };

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: string) => {
    setInvolvedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!title.trim() || selectedSkillIds.size === 0) return;

    const signal = createOperationalSignal({
      type,
      severity,
      status: "open",
      title: title.trim(),
      description: description.trim(),
      occurredAt: new Date(occurredAt).toISOString(),
      affectedSkillIds: [...selectedSkillIds],
      affectedSiteId: siteId || undefined,
      affectedDepartmentId: departmentId || undefined,
      involvedUserIds: involvedUserIds.size > 0 ? [...involvedUserIds] : undefined,
      incidentWorkContext: workContext || undefined,
      regulatoryRef: regulatoryRef || undefined,
      effectiveDate: effectiveDate || undefined,
      recommendedAction: finalAction,
      recommendedActionReason: actionOverride
        ? "Admin override"
        : recommendation.reason,
      reportedByUserId: currentUser.id,
    });

    if (
      finalAction === "individual_retraining" &&
      involvedUserIds.size > 0 &&
      selectedSkillIds.size > 0
    ) {
      setPendingSignalId(signal.id);
      setShowSuspendConfirm(true);
      return;
    }

    finishAndClose(signal.id);
  };

  const handleSuspendConfirm = () => {
    for (const userId of involvedUserIds) {
      for (const skillId of selectedSkillIds) {
        suspendUserSkill(
          userId,
          skillId,
          pendingSignalId,
          `${title.trim()} — automated suspension from signal.`
        );
      }
    }
    setShowSuspendConfirm(false);
    finishAndClose(pendingSignalId);
  };

  const finishAndClose = (sigId: string) => {
    setToast("Signal logged successfully.");
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1500);
  };

  const involvedNames = [...involvedUserIds]
    .map((uid) => {
      const u = allUsers.find((u2) => u2.id === uid);
      return u ? getFullName(u) : uid;
    })
    .join(", ");

  const affectedSkillNames = [...selectedSkillIds]
    .map((id) => allSkills.find((s) => s.id === id)?.name || id)
    .join(", ");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Log Operational Signal</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Section 1: Event Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                Event Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Signal Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as SignalType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SignalSeverity)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for this signal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={DESCRIPTION_PLACEHOLDERS[type] || "Describe the event..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Occurred At
                </label>
                <input
                  type="date"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Section 2: Scope */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                Scope
              </h4>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Affected Skills * (select at least one)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {allSkills.map((sk) => (
                    <label key={sk.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.has(sk.id)}
                        onChange={() => toggleSkill(sk.id)}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      {sk.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Affected Site
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Sites</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Affected Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(type === "incident" || type === "near_miss") && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Work Context
                  </label>
                  <input
                    type="text"
                    value={workContext}
                    onChange={(e) => setWorkContext(e.target.value)}
                    placeholder='e.g., "LOTO", "Confined Space"'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            {/* Section 3: People */}
            {showPeople && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                  People Involved
                </h4>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {allUsers
                    .filter((u) => u.role === "LEARNER")
                    .map((u) => (
                      <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={involvedUserIds.has(u.id)}
                          onChange={() => toggleUser(u.id)}
                          className="rounded border-gray-300 text-emerald-600"
                        />
                        {getFullName(u)}
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Section 4: Regulatory Details */}
            {showRegulatory && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                  Regulatory Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Regulatory Reference
                    </label>
                    <input
                      type="text"
                      value={regulatoryRef}
                      onChange={(e) => setRegulatoryRef(e.target.value)}
                      placeholder="e.g., OSHA 1910.147"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: System Recommendation */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                System Recommendation
              </h4>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {recommendation.action === "none"
                        ? "No training action recommended"
                        : `Recommended: ${recommendation.action.replace(/_/g, " ")}`}
                    </p>
                    {recommendation.reason && (
                      <p className="text-xs text-blue-600 mt-0.5">{recommendation.reason}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Override recommendation (optional)
                </label>
                <select
                  value={actionOverride}
                  onChange={(e) => setActionOverride(e.target.value as RecommendedAction | "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Use system recommendation</option>
                  <option value="individual_retraining">Individual Retraining</option>
                  <option value="corrective_training">Corrective Training</option>
                  <option value="micro_lesson">Micro-Lesson</option>
                  <option value="content_review">Content Review</option>
                  <option value="delta_renewal">Delta Renewal</option>
                  <option value="full_regeneration">Full Regeneration</option>
                  <option value="none">No Action</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!title.trim() || selectedSkillIds.size === 0}
            >
              Log Signal
            </Button>
          </div>
        </div>
      </div>

      {/* Suspend confirmation */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setShowSuspendConfirm(false); finishAndClose(pendingSignalId); }} />
          <div className="relative bg-white rounded-xl max-w-md w-full shadow-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">Suspend Skills?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Suspend <span className="font-medium">{affectedSkillNames}</span> for{" "}
                  <span className="font-medium">{involvedNames}</span>?
                  They will be blocked from related work until retraining is complete.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowSuspendConfirm(false); finishAndClose(pendingSignalId); }}>
                Skip
              </Button>
              <button
                onClick={handleSuspendConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Suspend Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </>
  );
}
