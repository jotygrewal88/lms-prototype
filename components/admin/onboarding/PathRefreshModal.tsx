"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  RefreshCw,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  ArrowRight,
  Zap,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import {
  getContentCurrency,
  getOperationalSignalById,
  getSkillV2ById,
  updateOnboardingPath,
  recalculateCurrency,
  getOperationalSignals,
  resolveSignal,
  getCurrentUser,
} from "@/lib/store";
import type { OnboardingPath, ContentCurrency } from "@/types";

interface Props {
  path: OnboardingPath;
  onClose: () => void;
}

type RefreshOption = "supplemental" | "partial" | "full";

export default function PathRefreshModal({ path, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [refreshOption, setRefreshOption] = useState<RefreshOption>("supplemental");
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);
  const currentUser = getCurrentUser();

  const currency = getContentCurrency(path.id);
  const currentScore = currency?.currentScore ?? 100;

  const affectingSignals = useMemo(() => {
    if (!currency) return [];
    return currency.activeSignals
      .map((as) => ({
        ...as,
        signal: getOperationalSignalById(as.signalId),
      }))
      .filter((a) => a.signal);
  }, [currency]);

  const outdatedSources = useMemo(() => {
    if (!currency) return [];
    return currency.sourceVersionsAtGeneration
      .filter((sv) => sv.isOutdated)
      .map((sv) => ({
        ...sv,
        currentVersion: sv.currentVersion,
      }));
  }, [currency]);

  const estimatedNewScore: Record<RefreshOption, number> = {
    supplemental: Math.min(100, currentScore + 15),
    partial: Math.min(100, currentScore + 30),
    full: 100,
  };

  const handleApply = async () => {
    setApplying(true);
    await new Promise((r) => setTimeout(r, 1500));

    const newScore = estimatedNewScore[refreshOption];

    // Mock-update the path's updatedAt
    updateOnboardingPath(path.id, {
      updatedAt: new Date().toISOString(),
    });

    // Resolve related signals if full refresh
    if (refreshOption === "full") {
      for (const as of affectingSignals) {
        if (as.signal && as.signal.status !== "resolved") {
          resolveSignal(as.signal.id, currentUser.id, `Auto-resolved by full path refresh of "${path.title}".`);
        }
      }
    }

    // Recalculate currency
    recalculateCurrency(path.id);

    setApplying(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Refresh Analysis — {path.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {applying ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-700 font-medium mb-1">Applying refresh...</p>
            <p className="text-sm text-gray-500">
              Updating content, recalculating currency score
            </p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">Path Refreshed</p>
            <p className="text-sm text-gray-500 mb-6">
              Currency score updated. Content is now {refreshOption === "full" ? "fully" : "partially"} current.
            </p>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="p-5">
            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s
                        ? "bg-blue-600 text-white"
                        : step > s
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        step > s ? "bg-blue-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Analysis */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Step 1: Analysis
                </h3>

                {/* Currency Score */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Current Currency Score
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        currentScore >= 70
                          ? "text-amber-600"
                          : currentScore >= 40
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {currentScore}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        currentScore >= 70
                          ? "bg-amber-400"
                          : currentScore >= 40
                          ? "bg-orange-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${currentScore}%` }}
                    />
                  </div>
                </div>

                {/* Affecting Signals */}
                {affectingSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Affecting Signals ({affectingSignals.length})
                    </p>
                    <div className="space-y-2">
                      {affectingSignals.map((as) => (
                        <div
                          key={as.signalId}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-sm"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="text-gray-800">
                            {as.signal?.title || as.signalType}
                          </span>
                          <span className="ml-auto text-xs text-red-600 font-medium">
                            -{as.impact} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outdated Sources */}
                {outdatedSources.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Outdated Sources ({outdatedSources.length})
                    </p>
                    <div className="space-y-2">
                      {outdatedSources.map((os) => (
                        <div
                          key={os.sourceId}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-sm"
                        >
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-800">{os.sourceTitle}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            v{os.versionAtGeneration} → v{os.currentVersion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => setStep(2)}>
                    Next: Choose Refresh Type
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Options */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Step 2: Choose Refresh Type
                </h3>

                {(
                  [
                    {
                      key: "supplemental" as RefreshOption,
                      title: "Supplemental Only",
                      desc: "Add a supplemental module covering recent changes. Existing content stays the same.",
                      est: estimatedNewScore.supplemental,
                    },
                    {
                      key: "partial" as RefreshOption,
                      title: "Regenerate Affected Sections",
                      desc: "Regenerate only the phases/courses that are directly affected by signals and source updates.",
                      est: estimatedNewScore.partial,
                    },
                    {
                      key: "full" as RefreshOption,
                      title: "Full Regeneration",
                      desc: "Regenerate the entire onboarding path from scratch using current sources and context.",
                      est: estimatedNewScore.full,
                    },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      refreshOption === opt.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="refreshOption"
                      value={opt.key}
                      checked={refreshOption === opt.key}
                      onChange={() => setRefreshOption(opt.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm">
                          {opt.title}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          Est. score: {opt.est}/100
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}

                <div className="flex justify-between pt-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep(3)}>
                    Next: Preview
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Step 3: Preview Changes
                </h3>

                <div className="space-y-2">
                  {path.phases.map((phase, pi) => {
                    const isSupplemental = refreshOption === "supplemental";
                    const isFull = refreshOption === "full";
                    const isPartial = refreshOption === "partial";
                    const phaseHasAffectedSkill = phase.courses.some((c) =>
                      c.skillsGranted?.some((sid: string) =>
                        affectingSignals.some((as) =>
                          as.signal?.affectedSkillIds.includes(sid)
                        )
                      )
                    );
                    const isAffected = isFull || (isPartial && phaseHasAffectedSkill);
                    const showRegenHighlight = isAffected && !isSupplemental;
                    return (
                      <div
                        key={phase.id}
                        className={`p-3 border rounded-lg text-sm ${
                          showRegenHighlight
                            ? "border-amber-300 bg-amber-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {showRegenHighlight ? (
                            <Zap className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-800">
                            Phase {pi + 1}: {phase.name}
                          </span>
                          {showRegenHighlight && (
                            <Badge variant="warning">Will be regenerated</Badge>
                          )}
                          {!isAffected && !isFull && (
                            <Badge variant="default">Unchanged</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 pl-6">
                          {phase.courses.length} course{phase.courses.length !== 1 ? "s" : ""} &bull;{" "}
                          {phase.dayEnd - phase.dayStart} days
                        </p>
                      </div>
                    );
                  })}

                  {refreshOption === "supplemental" && (
                    <div className="p-3 border-2 border-emerald-300 bg-emerald-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-emerald-800">
                          New: Supplemental Module
                        </span>
                        <Badge variant="success">Added</Badge>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1 pl-6">
                        Covers {affectingSignals.length} signal(s) and {outdatedSources.length} source update(s)
                      </p>
                    </div>
                  )}
                </div>

                {path.phases.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Note:</strong> Active learners on this path will see updated content on their next login.
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleApply}>
                    <RefreshCw className="w-4 h-4" />
                    Apply Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
