"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Loader2,
  Info,
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
} from "@/lib/store";
import { generateOnboardingPath } from "@/lib/mockOnboardingGenerator";
import type { JobTitle, SkillV2, LibraryItem } from "@/types";

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
      const created = createOnboardingPath(result);
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete(created.id);
      }
    } catch {
      clearInterval(interval);
      setIsGenerating(false);
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
        <span className="text-sm text-gray-500">Step {step} of 3</span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
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
            {s < 3 && (
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
