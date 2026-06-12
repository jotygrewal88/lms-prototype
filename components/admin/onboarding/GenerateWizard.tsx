"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Loader2,
  Info,
  Book,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Link2,
  Repeat,
  X,
  Save,
  Lightbulb,
} from "lucide-react";
import Button from "@/components/Button";
import {
  getJobTitles,
  getJobTitleById,
  getActiveSkillsV2,
  getLibraryItems,
  getOnboardingPathByJobTitleId,
  getOnboardingPaths,
  createOnboardingPath,
  getOrganizationProfile,
  getCourses,
  getTrainings,
} from "@/lib/store";
import { generateOnboardingPath } from "@/lib/mockOnboardingGenerator";
import {
  suggestMatches,
  searchCandidates,
  confidenceLabel,
  CONFIDENCE_THRESHOLD,
  type MatchCandidate,
} from "@/lib/onboardingMatchSuggester";
import type { JobTitle, OnboardingPath, OnboardingPhaseCourse } from "@/types";

// What the user has decided for each phase item.
// Absence in the map = no decision yet (generator's link still in effect).
interface ItemDecision {
  linkedCourseId?: string;
  linkedTrainingId?: string;
  linkedTitle?: string;
  // When set, the user explicitly asked to leave this unlinked (overrides any
  // pre-existing generator link).
  cleared?: boolean;
}

type GeneratedDraft = Omit<OnboardingPath, "id" | "createdAt" | "updatedAt">;

const PRIORITY_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  critical: { dot: "bg-red-500", bg: "bg-red-50 text-red-700", label: "Critical" },
  high: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700", label: "High" },
  medium: { dot: "bg-orange-400", bg: "bg-orange-50 text-orange-700", label: "Medium" },
  low: { dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600", label: "Low" },
};

const LOADING_STEPS = [
  "Analyzing job title requirements...",
  "Mapping skills to knowledge sources...",
  "Generating Phase 1: Safety Orientation...",
  "Generating Phase 2: Core Certifications...",
  "Building assessment checkpoints...",
  "Calculating skill coverage...",
];

export default function GenerateWizard({
  preselectedJobTitleId,
  onCancel,
  onComplete,
}: {
  preselectedJobTitleId?: string;
  onCancel: () => void;
  onComplete: (pathId: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedJTId, setSelectedJTId] = useState(preselectedJobTitleId || "");
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [sourceSearch, setSourceSearch] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const hasCompleted = useRef(false);
  // Step 4 state — populated after generation.
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedDraft | null>(null);
  const [itemDecisions, setItemDecisions] = useState<Map<string, ItemDecision>>(new Map());
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<string>>(new Set());
  const [swapPickerItem, setSwapPickerItem] = useState<OnboardingPhaseCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const allJTs = getJobTitles().filter((jt) => jt.active);
  const allSkills = getActiveSkillsV2();
  const allSources = getLibraryItems().filter((s) => s.allowedForSynthesis);

  const selectedJT = selectedJTId ? getJobTitleById(selectedJTId) : null;
  const existingPublished = selectedJTId ? getOnboardingPathByJobTitleId(selectedJTId) : null;

  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;

  // Group skills by priority
  const groupedSkills = useMemo(() => {
    if (!selectedJT) return {};
    const groups: Record<string, typeof selectedJT.requiredSkills> = {};
    for (const req of selectedJT.requiredSkills) {
      const p = req.priority;
      if (!groups[p]) groups[p] = [];
      groups[p].push(req);
    }
    return groups;
  }, [selectedJT]);

  // Smart source recommendations
  const recommendedSourceIds = useMemo(() => {
    if (!selectedJT) return new Set<string>();
    const recs = new Set<string>();

    const reqSkills = selectedJT.requiredSkills.map((r) => {
      const skill = allSkills.find((s) => s.id === r.skillId);
      return { id: r.skillId, category: skill?.category?.toLowerCase() || "", regRef: skill?.regulatoryRef?.toLowerCase() || "" };
    });

    const publishedPaths = getOnboardingPaths().filter((p) => p.status === "published");
    const sameDeptPaths = publishedPaths.filter((p) => {
      const pjt = getJobTitleById(p.jobTitleId);
      return pjt && pjt.department === selectedJT.department && p.jobTitleId !== selectedJT.id;
    });
    const sameDeptSourceIds = new Set(sameDeptPaths.flatMap((p) => p.sourceIds));

    for (const src of allSources) {
      const srcCats = (src.categories || []).map((c) => c.toLowerCase());
      const srcRegRef = (src.regulatoryRef || "").toLowerCase();
      const srcText = `${src.title} ${src.description || ""} ${src.tags.join(" ")} ${srcCats.join(" ")} ${srcRegRef}`.toLowerCase();

      const matchesCat = reqSkills.some((sk) => sk.category && srcCats.some((c) => c.includes(sk.category) || sk.category.includes(c)));
      const matchesRegRef = reqSkills.some((sk) => sk.regRef && srcRegRef.includes(sk.regRef));
      const matchesSameDept = sameDeptSourceIds.has(src.id);

      const SKILL_HINTS: Record<string, { keywords: string[]; regRefs: string[] }> = {
        skl_loto: { keywords: ["lockout", "tagout", "loto", "energy control"], regRefs: ["1910.147"] },
        skl_confined_space: { keywords: ["confined space", "atmospheric"], regRefs: ["1910.146"] },
        skl_forklift: { keywords: ["forklift", "powered industrial", "truck"], regRefs: ["1910.178"] },
        skl_hvac_basic: { keywords: ["hvac", "air handler", "chiller", "refrigeration"], regRefs: [] },
        skl_fall_protection: { keywords: ["fall protection", "harness", "fall arrest"], regRefs: ["1926.501", "1910.28"] },
        skl_electrical_basic: { keywords: ["electrical", "arc flash", "nfpa 70e"], regRefs: ["1910.301", "1910.302"] },
        skl_hazmat: { keywords: ["hazmat", "hazard communication", "hazcom", "chemical", "ghs", "sds"], regRefs: ["1910.1200", "1910.120"] },
        skl_first_aid: { keywords: ["first aid", "cpr", "aed", "emergency response"], regRefs: ["1910.151"] },
        skl_gmp: { keywords: ["gmp", "good manufacturing", "quality"], regRefs: [] },
        skl_incident_investigation: { keywords: ["incident", "investigation", "root cause"], regRefs: [] },
      };
      const matchesHints = reqSkills.some((sk) => {
        const hints = SKILL_HINTS[sk.id];
        if (!hints) return false;
        return hints.keywords.some((kw) => srcText.includes(kw)) || hints.regRefs.some((ref) => srcText.includes(ref.toLowerCase()));
      });

      if (matchesCat || matchesRegRef || matchesSameDept || matchesHints) {
        recs.add(src.id);
      }
    }

    return recs;
  }, [selectedJT, allSources, allSkills]);

  const recommendedCount = recommendedSourceIds.size;

  const selectAllRecommended = () => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      for (const id of recommendedSourceIds) next.add(id);
      return next;
    });
  };

  // Filtered sources (recommended sorted first)
  const filteredSources = useMemo(() => {
    let sources = allSources;
    if (sourceSearch) {
      const q = sourceSearch.toLowerCase();
      sources = sources.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.regulatoryRef || "").toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return sources.sort((a, b) => {
      const aRec = recommendedSourceIds.has(a.id) ? 0 : 1;
      const bRec = recommendedSourceIds.has(b.id) ? 0 : 1;
      return aRec - bRec;
    });
  }, [allSources, sourceSearch, recommendedSourceIds]);

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!selectedJTId) return;
    setIsGenerating(true);
    setLoadingStep(0);
    hasCompleted.current = false;

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx >= LOADING_STEPS.length - 1) {
        clearInterval(interval);
        setLoadingStep(LOADING_STEPS.length - 1);
      } else {
        setLoadingStep(stepIdx);
      }
    }, 550);

    try {
      const result = await generateOnboardingPath({
        jobTitleId: selectedJTId,
        sourceIds: [...selectedSourceIds],
        industryContext: getOrganizationProfile().industry,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });
      clearInterval(interval);
      // Don't save yet — show the review step so admins can accept/swap
      // suggested course/training matches before committing.
      setGeneratedDraft(result);
      setExpandedPhaseIds(new Set(result.phases.map((p) => p.id)));
      setItemDecisions(new Map());
      setIsGenerating(false);
      setStep(4);
    } catch {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Save the path after the admin has reviewed suggested matches in Step 4.
  // Applies each ItemDecision to the corresponding item before persisting.
  const handleSaveReviewed = () => {
    if (!generatedDraft) return;
    setIsSaving(true);
    const finalDraft: GeneratedDraft = {
      ...generatedDraft,
      phases: generatedDraft.phases.map((ph) => ({
        ...ph,
        courses: ph.courses.map((item) => {
          const decision = itemDecisions.get(item.id);
          if (!decision) return item;
          // Explicit unlink wins.
          if (decision.cleared) {
            return {
              ...item,
              linkedCourseId: undefined,
              linkedTrainingId: undefined,
            };
          }
          if (decision.linkedCourseId) {
            return {
              ...item,
              kind: "course",
              title: decision.linkedTitle || item.title,
              linkedCourseId: decision.linkedCourseId,
              linkedTrainingId: undefined,
            };
          }
          if (decision.linkedTrainingId) {
            return {
              ...item,
              kind: "training",
              title: decision.linkedTitle || item.title,
              linkedCourseId: undefined,
              linkedTrainingId: decision.linkedTrainingId,
            };
          }
          return item;
        }),
      })),
    };
    const created = createOnboardingPath(finalDraft);
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      onComplete(created.id);
    }
  };

  // Loading screen
  if (isGenerating) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-6" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Onboarding Path
        </h2>
        <div className="space-y-2 mt-6">
          {LOADING_STEPS.map((msg, i) => (
            <p
              key={i}
              className={`text-sm transition-all duration-300 ${
                i === loadingStep
                  ? "text-emerald-700 font-medium"
                  : i < loadingStep
                  ? "text-gray-400"
                  : "text-gray-300"
              }`}
            >
              {i < loadingStep && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />}
              {i === loadingStep && <Loader2 className="w-3.5 h-3.5 inline mr-1.5 animate-spin" />}
              {msg}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Generate Onboarding Path</h2>
        <span className="text-sm text-gray-500">Step {step} of 4</span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step
                  ? "bg-emerald-600 text-white"
                  : s < step
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-0.5 ${s < step ? "bg-emerald-200" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: Select Job Title ─── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which job title is this onboarding for? *
            </label>
            <JobTitleSelector
              allJTs={allJTs}
              selectedId={selectedJTId}
              onSelect={setSelectedJTId}
            />
          </div>

          {/* Skills preview */}
          {selectedJT && (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Required Skills for {selectedJT.name}
              </h4>
              {selectedJT.requiredSkills.length === 0 ? (
                <div className="flex items-start gap-2 text-amber-700 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    This job title has no required skills configured.{" "}
                    <a href="/admin/learningmodel?tab=jobtitles" className="underline font-medium">
                      Configure skills first
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(["critical", "high", "medium", "low"] as const).map((priority) => {
                    const skills = groupedSkills[priority];
                    if (!skills?.length) return null;
                    const cfg = PRIORITY_COLORS[priority];
                    return (
                      <div key={priority}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            (within {skills[0].targetTimelineDays} days)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-3.5">
                          {skills.map((s) => (
                            <span
                              key={s.skillId}
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.bg}`}
                            >
                              {getSkillName(s.skillId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-500 mt-2">
                    The AI will generate training for all {selectedJT.requiredSkills.length} skills,
                    sequenced by priority. Critical skills go in Week 1.
                  </p>
                </div>
              )}
            </div>
          )}

          {existingPublished && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                This job title already has a published onboarding path. Generating a new one will
                create a draft alongside it.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!selectedJTId || (selectedJT?.requiredSkills.length || 0) === 0}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Select Sources ─── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select knowledge sources for the AI to use
              </label>
              <span className="text-sm text-gray-500">
                Selected: {selectedSourceIds.size}
              </span>
            </div>

            {/* Recommendation header */}
            {selectedJT && recommendedCount > 0 && (
              <div className="flex items-center justify-between p-3 mb-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  Based on <span className="font-medium">{selectedJT.name}</span>&apos;s required skills, we recommend{" "}
                  <span className="font-medium">{recommendedCount}</span> source{recommendedCount !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={selectAllRecommended}
                  className="px-3 py-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 whitespace-nowrap ml-2"
                >
                  Select All Recommended
                </button>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    placeholder="Search sources..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Source list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {filteredSources.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No sources found.</p>
                ) : (
                  filteredSources.map((src, i) => {
                    const isRec = recommendedSourceIds.has(src.id);
                    const prevRec = i > 0 && recommendedSourceIds.has(filteredSources[i - 1].id);
                    const showDivider = !isRec && (i === 0 || prevRec);
                    return (
                      <React.Fragment key={src.id}>
                        {showDivider && recommendedCount > 0 && (
                          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 font-medium">
                            Other sources
                          </div>
                        )}
                        <label
                          className={`flex items-start gap-3 p-3 cursor-pointer ${
                            isRec ? "bg-emerald-50/30 hover:bg-emerald-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSourceIds.has(src.id)}
                            onChange={() => toggleSource(src.id)}
                            className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {src.title}
                              {isRec && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {src.categories?.join(", ") || "—"}
                              {src.regulatoryRef && ` • ${src.regulatoryRef}`}
                              {src.sourceType && ` • ${src.sourceType.toUpperCase()}`}
                            </p>
                          </div>
                        </label>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Select all sources relevant to this role. The AI will determine which content applies
              to each course and phase.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setStep(3)}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Review & Generate ─── */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-700">Review your configuration</h3>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-500 font-medium w-40">Job Title</td>
                  <td className="px-4 py-3 text-gray-900">{selectedJT?.name}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-500 font-medium">Department / Site</td>
                  <td className="px-4 py-3 text-gray-900">
                    {selectedJT?.department} / {selectedJT?.site}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-500 font-medium">Skills to Cover</td>
                  <td className="px-4 py-3 text-gray-900">
                    {selectedJT?.requiredSkills.length} required skills
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-500 font-medium">Sources Selected</td>
                  <td className="px-4 py-3 text-gray-900">
                    {selectedSourceIds.size} document{selectedSourceIds.size !== 1 ? "s" : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Instructions (optional)
            </label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g., Include hands-on equipment walkthrough in Week 2."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerate}>
              <Rocket className="w-4 h-4" />
              Generate Path
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Review AI Suggestions ─── */}
      {step === 4 && generatedDraft && (
        <ReviewMatchesStep
          draft={generatedDraft}
          itemDecisions={itemDecisions}
          setItemDecisions={setItemDecisions}
          expandedPhaseIds={expandedPhaseIds}
          setExpandedPhaseIds={setExpandedPhaseIds}
          onOpenPicker={setSwapPickerItem}
          onBack={() => {
            setStep(3);
            setGeneratedDraft(null);
          }}
          onCancel={onCancel}
          onSave={handleSaveReviewed}
          isSaving={isSaving}
        />
      )}

      {/* Swap picker modal */}
      {swapPickerItem && generatedDraft && (
        <SwapPickerModal
          item={swapPickerItem}
          draft={generatedDraft}
          itemDecisions={itemDecisions}
          onClose={() => setSwapPickerItem(null)}
          onPick={(candidate) => {
            setItemDecisions((prev) => {
              const next = new Map(prev);
              next.set(swapPickerItem.id, {
                cleared: false,
                linkedCourseId: candidate.kind === "course" ? candidate.id : undefined,
                linkedTrainingId: candidate.kind === "training" ? candidate.id : undefined,
                linkedTitle: candidate.title,
              });
              return next;
            });
            setSwapPickerItem(null);
          }}
        />
      )}
    </div>
  );
}

/* ─── Step 4: Review Matches ────────────────────────────────────────────── */

interface ReviewStepProps {
  draft: GeneratedDraft;
  itemDecisions: Map<string, ItemDecision>;
  setItemDecisions: React.Dispatch<React.SetStateAction<Map<string, ItemDecision>>>;
  expandedPhaseIds: Set<string>;
  setExpandedPhaseIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenPicker: (item: OnboardingPhaseCourse) => void;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function ReviewMatchesStep({
  draft,
  itemDecisions,
  setItemDecisions,
  expandedPhaseIds,
  setExpandedPhaseIds,
  onOpenPicker,
  onBack,
  onCancel,
  onSave,
  isSaving,
}: ReviewStepProps) {
  const publishedCourses = useMemo(
    () => getCourses().filter((c) => c.status === "published"),
    []
  );
  const activeTrainings = useMemo(
    () => getTrainings().filter((t) => t.status === "active"),
    []
  );

  // Resolve the committed link for an item:
  //  decision.cleared → unlinked
  //  decision with id → uses decision values
  //  no decision → uses generator's pre-linked values (if any)
  const resolveLink = (item: OnboardingPhaseCourse): {
    linkedCourseId?: string;
    linkedTrainingId?: string;
    linkedTitle?: string;
  } => {
    const decision = itemDecisions.get(item.id);
    if (decision) {
      if (decision.cleared) return {};
      return decision;
    }
    return {
      linkedCourseId: item.linkedCourseId,
      linkedTrainingId: item.linkedTrainingId,
      linkedTitle: item.title,
    };
  };

  // Build the global "in-use" exclusion sets so suggestions don't repeat.
  const { usedCourseIds, usedTrainingIds } = useMemo(() => {
    const courses = new Set<string>();
    const trainings = new Set<string>();
    for (const ph of draft.phases) {
      for (const item of ph.courses) {
        const link = resolveLink(item);
        if (link.linkedCourseId) courses.add(link.linkedCourseId);
        if (link.linkedTrainingId) trainings.add(link.linkedTrainingId);
      }
    }
    return { usedCourseIds: courses, usedTrainingIds: trainings };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, itemDecisions]);

  // Lookups for displaying linked titles when only IDs are known.
  const courseById = useMemo(() => {
    const m = new Map<string, string>();
    publishedCourses.forEach((c) => m.set(c.id, c.title));
    return m;
  }, [publishedCourses]);
  const trainingById = useMemo(() => {
    const m = new Map<string, string>();
    activeTrainings.forEach((t) => m.set(t.id, t.title));
    return m;
  }, [activeTrainings]);

  // Summary counts
  const allNonTodoItems = draft.phases.flatMap((p) =>
    p.courses.filter((c) => c.kind !== "todo")
  );
  const linkedCount = allNonTodoItems.filter((item) => {
    const l = resolveLink(item);
    return Boolean(l.linkedCourseId || l.linkedTrainingId);
  }).length;
  const placeholderCount = allNonTodoItems.length - linkedCount;

  const togglePhase = (id: string) => {
    setExpandedPhaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const acceptSuggestion = (item: OnboardingPhaseCourse, candidate: MatchCandidate) => {
    setItemDecisions((prev) => {
      const next = new Map(prev);
      next.set(item.id, {
        cleared: false,
        linkedCourseId: candidate.kind === "course" ? candidate.id : undefined,
        linkedTrainingId: candidate.kind === "training" ? candidate.id : undefined,
        linkedTitle: candidate.title,
      });
      return next;
    });
  };

  const clearLink = (item: OnboardingPhaseCourse) => {
    setItemDecisions((prev) => {
      const next = new Map(prev);
      next.set(item.id, { cleared: true });
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-900">
              Review and match real content to each item
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              We&apos;ve searched your library and trainings module for the best match for each AI-generated
              slot. Accept the suggestion, swap to a different record, or leave it as a placeholder you&apos;ll
              build later. To-dos don&apos;t need linking.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <Link2 className="w-3.5 h-3.5" />
                <span className="font-semibold">{linkedCount}</span> linked
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-semibold">{placeholderCount}</span> placeholder
                {placeholderCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {draft.phases.map((phase, phaseIdx) => {
          const isExpanded = expandedPhaseIds.has(phase.id);
          const items = phase.courses;
          const phaseLinked = items.filter((item) => {
            if (item.kind === "todo") return false;
            const l = resolveLink(item);
            return Boolean(l.linkedCourseId || l.linkedTrainingId);
          }).length;
          const phaseTotal = items.filter((i) => i.kind !== "todo").length;
          return (
            <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">
                      Phase {phaseIdx + 1}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{phase.timeline}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mt-0.5">{phase.name}</h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                  {phaseTotal > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        phaseLinked === phaseTotal
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {phaseLinked}/{phaseTotal} linked
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {items.map((item) => (
                    <ReviewItemRow
                      key={item.id}
                      item={item}
                      committedLink={resolveLink(item)}
                      publishedCourses={publishedCourses}
                      activeTrainings={activeTrainings}
                      excluded={{
                        // Exclude every used record EXCEPT this item's own commit
                        // (so it can keep its current link as the suggestion).
                        courseIds: new Set(
                          [...usedCourseIds].filter(
                            (id) => id !== resolveLink(item).linkedCourseId,
                          ),
                        ),
                        trainingIds: new Set(
                          [...usedTrainingIds].filter(
                            (id) => id !== resolveLink(item).linkedTrainingId,
                          ),
                        ),
                      }}
                      courseById={courseById}
                      trainingById={trainingById}
                      onAccept={(cand) => acceptSuggestion(item, cand)}
                      onSwap={() => onOpenPicker(item)}
                      onClear={() => clearLink(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onBack} disabled={isSaving}>
          <ArrowLeft className="w-4 h-4" />
          Regenerate
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Path
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── Step 4: One item row ──────────────────────────────────────────────── */

interface ReviewItemRowProps {
  item: OnboardingPhaseCourse;
  committedLink: { linkedCourseId?: string; linkedTrainingId?: string; linkedTitle?: string };
  publishedCourses: ReturnType<typeof getCourses>;
  activeTrainings: ReturnType<typeof getTrainings>;
  excluded: { courseIds: Set<string>; trainingIds: Set<string> };
  courseById: Map<string, string>;
  trainingById: Map<string, string>;
  onAccept: (candidate: MatchCandidate) => void;
  onSwap: () => void;
  onClear: () => void;
}

function ReviewItemRow({
  item,
  committedLink,
  publishedCourses,
  activeTrainings,
  excluded,
  courseById,
  trainingById,
  onAccept,
  onSwap,
  onClear,
}: ReviewItemRowProps) {
  // Suggestion regardless of current state (so we always have something to
  // recommend if the admin clears the current link).
  const matches = useMemo(
    () => suggestMatches(item, publishedCourses, activeTrainings, excluded),
    [item, publishedCourses, activeTrainings, excluded],
  );

  const isTodo = item.kind === "todo";
  const isCommitted = Boolean(
    committedLink.linkedCourseId || committedLink.linkedTrainingId,
  );

  // Visual kind for the row icon (matches PathPreview's icon mapping).
  const renderKindIcon = () => {
    if (isTodo) return <ClipboardList className="w-4 h-4 text-violet-500" />;
    // Use whatever the item resolves to today
    if (committedLink.linkedTrainingId) {
      return <GraduationCap className="w-4 h-4 text-emerald-600" />;
    }
    return <Book className="w-4 h-4 text-blue-500" />;
  };

  if (isTodo) {
    return (
      <div className="px-4 py-3 bg-violet-50/30 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{renderKindIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-900">{item.title}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 bg-violet-100 rounded">
              <ClipboardList className="w-2.5 h-2.5" />
              To-Do
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Confirmed
            </span>
          </div>
          {item.todoNote && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.todoNote}</p>
          )}
        </div>
      </div>
    );
  }

  // Resolved title of the currently committed record (for the "Linked" pill).
  const committedTitle = committedLink.linkedCourseId
    ? courseById.get(committedLink.linkedCourseId) || committedLink.linkedTitle || item.title
    : committedLink.linkedTrainingId
    ? trainingById.get(committedLink.linkedTrainingId) || committedLink.linkedTitle || item.title
    : null;

  // Was the generator's link a Training-as-fallback (no course existed in the
  // library to cover this skill)? We detect it by: original item was a training,
  // and the suggester didn't find a course alternative.
  const isFallbackTraining =
    item.kind === "training" &&
    !matches.viable.some((c) => c.kind === "course");
  // Course alternative for training-kind items.
  const courseAlternative =
    item.kind === "training" ? matches.viable.find((c) => c.kind === "course") : null;

  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{renderKindIcon()}</div>
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
              {isCommitted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Linked
                </span>
              )}
              {!isCommitted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-100 rounded">
                  Placeholder
                </span>
              )}
            </div>
            {item.skillsGranted.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                Skills: {item.skillsGranted.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Committed state */}
        {isCommitted && committedTitle && (
          <div className="mt-2 rounded border border-emerald-200 bg-emerald-50/60 px-3 py-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                {committedLink.linkedCourseId ? (
                  <Book className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                )}
                <span className="text-xs text-gray-700 truncate">
                  Linked to <span className="font-medium text-gray-900">{committedTitle}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onSwap}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Repeat className="w-3 h-3" /> Swap
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-600 hover:text-red-600"
                  title="Leave as placeholder (no link)"
                >
                  <X className="w-3 h-3" /> Unlink
                </button>
              </div>
            </div>

            {/* Course alternative callout for fallback trainings */}
            {item.kind === "training" && courseAlternative &&
              committedLink.linkedTrainingId === item.linkedTrainingId && (
                <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[11px] text-gray-600 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    A course exists that covers this skill:{" "}
                    <span className="font-medium text-gray-800">
                      {courseAlternative.title}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onAccept(courseAlternative)}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Swap to course →
                  </button>
                </div>
              )}

            {isFallbackTraining && committedLink.linkedTrainingId === item.linkedTrainingId && (
              <p className="mt-1.5 text-[11px] text-gray-500 italic">
                Covered by training — no course in the library covers this skill yet.
              </p>
            )}
          </div>
        )}

        {/* Suggestion state (not committed yet) */}
        {!isCommitted && matches.top && (
          <div className="mt-2 rounded border border-blue-200 bg-blue-50/50 px-3 py-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                {matches.top.kind === "course" ? (
                  <Book className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                )}
                <span className="text-xs text-gray-700 truncate">
                  Suggested: <span className="font-medium text-gray-900">{matches.top.title}</span>
                </span>
                <ConfidencePill confidence={matches.top.confidence} />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAccept(matches.top!)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  <CheckCircle2 className="w-3 h-3" /> Accept
                </button>
                <button
                  type="button"
                  onClick={onSwap}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Repeat className="w-3 h-3" /> Swap
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No match state */}
        {!isCommitted && !matches.top && (
          <div className="mt-2 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-gray-500">
              No good match in the library or trainings module — leave as placeholder or search.
            </p>
            <button
              type="button"
              onClick={onSwap}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              <Search className="w-3 h-3" /> Search & link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: number }) {
  const { label, color } = confidenceLabel(confidence);
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${colorClasses[color]}`}
      title={`${Math.round(confidence * 100)}% skill overlap`}
    >
      {label}
    </span>
  );
}

/* ─── Swap picker modal ─────────────────────────────────────────────────── */

interface SwapPickerProps {
  item: OnboardingPhaseCourse;
  draft: GeneratedDraft;
  itemDecisions: Map<string, ItemDecision>;
  onClose: () => void;
  onPick: (candidate: MatchCandidate) => void;
}

function SwapPickerModal({ item, draft, itemDecisions, onClose, onPick }: SwapPickerProps) {
  const [query, setQuery] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "course" | "training">("all");
  const publishedCourses = useMemo(
    () => getCourses().filter((c) => c.status === "published"),
    []
  );
  const activeTrainings = useMemo(
    () => getTrainings().filter((t) => t.status === "active"),
    []
  );

  // Reuse the wizard's exclusion logic: exclude all currently committed
  // records (from generator or post-decision) EXCEPT this item's own current
  // committed value (which doesn't matter here — the modal is for changing it).
  const excluded = useMemo(() => {
    const courses = new Set<string>();
    const trainings = new Set<string>();
    for (const ph of draft.phases) {
      for (const it of ph.courses) {
        if (it.id === item.id) continue; // ignore current item
        const decision = itemDecisions.get(it.id);
        const link = decision
          ? decision.cleared
            ? {}
            : { linkedCourseId: decision.linkedCourseId, linkedTrainingId: decision.linkedTrainingId }
          : { linkedCourseId: it.linkedCourseId, linkedTrainingId: it.linkedTrainingId };
        if (link.linkedCourseId) courses.add(link.linkedCourseId);
        if (link.linkedTrainingId) trainings.add(link.linkedTrainingId);
      }
    }
    return { courseIds: courses, trainingIds: trainings };
  }, [draft, itemDecisions, item.id]);

  const results = useMemo(
    () =>
      searchCandidates({
        query,
        itemSkills: item.skillsGranted,
        publishedCourses,
        activeTrainings,
        excluded,
        limit: 100,
      }).filter((c) => filterKind === "all" || c.kind === filterKind),
    [query, item.skillsGranted, publishedCourses, activeTrainings, excluded, filterKind]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-blue-500" />
              Swap match for &ldquo;{item.title}&rdquo;
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pick a published course or active training to link to this item.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, or category..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "course", "training"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKind(k)}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  filterKind === k
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {k === "all" ? "All" : k === "course" ? "Courses" : "Trainings"}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {results.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No matching records found.</p>
            </div>
          ) : (
            results.map((cand) => (
              <button
                key={`${cand.kind}_${cand.id}`}
                type="button"
                onClick={() => onPick(cand)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-left"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {cand.kind === "course" ? (
                    <Book className="w-4 h-4 text-blue-500" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{cand.title}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        cand.kind === "course"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {cand.kind === "course" ? "Course" : "Training"}
                    </span>
                    {cand.confidence >= CONFIDENCE_THRESHOLD && (
                      <ConfidencePill confidence={cand.confidence} />
                    )}
                  </div>
                  {cand.skillsGranted.length > 0 && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      Grants: {cand.skillsGranted.join(", ")}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end flex-shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Job Title Selector ──────────────────────────────────────────────── */

function JobTitleSelector({
  allJTs,
  selectedId,
  onSelect,
}: {
  allJTs: JobTitle[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = selectedId ? allJTs.find((jt) => jt.id === selectedId) : null;

  const filtered = useMemo(() => {
    if (!search) return allJTs;
    const q = search.toLowerCase();
    return allJTs.filter(
      (jt) =>
        jt.name.toLowerCase().includes(q) ||
        jt.department.toLowerCase().includes(q) ||
        jt.site.toLowerCase().includes(q)
    );
  }, [allJTs, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {selected ? (
          <span className="text-gray-900">{selected.name}</span>
        ) : (
          <span className="text-gray-400">Select a job title...</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-72 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job titles..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map((jt) => (
                <button
                  key={jt.id}
                  type="button"
                  onClick={() => {
                    onSelect(jt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 ${
                    jt.id === selectedId ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{jt.name}</div>
                  <div className="text-xs text-gray-500">
                    {jt.department} &bull; {jt.site} &bull; {jt.requiredSkills.length} required
                    skill{jt.requiredSkills.length !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-3 text-sm text-gray-500 text-center">No matching job titles</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
