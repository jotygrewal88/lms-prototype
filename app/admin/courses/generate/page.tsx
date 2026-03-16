"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SynthesisType, ChatMessage } from "@/types";
import type { LibraryItem, SkillV2 } from "@/types";
import {
  getSynthesisReadyLibraryItems,
  getActiveSkillsV2,
  getUsers,
  createCourse,
  getCurrentUser,
  subscribe,
} from "@/lib/store";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import { generateObjectivesForTopic, detectCategory } from "@/lib/mockAIAgent";
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles, Library, Search, Check } from "lucide-react";

export default function GenerateCoursePage() {
  const router = useRouter();

  // Form state (pre-filled with mock data for quick demo)
  const [topic, setTopic] = useState("Lockout/Tagout Safety Procedures");
  const [synthesisType, setSynthesisType] = useState<SynthesisType>("full-course");
  const [targetRole, setTargetRole] = useState("Maintenance Technician");
  const [targetSkillId, setTargetSkillId] = useState("skl_loto");
  const [audienceLevel, setAudienceLevel] = useState<"new-hire" | "experienced" | "recertification" | "">("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(["lib_002", "lib_004"]);
  const [additionalContext, setAdditionalContext] = useState("Focus on annual recertification requirements and hands-on verification procedures.");
  const [quizPlacement, setQuizPlacement] = useState<"per-lesson" | "end-of-course" | "both">("both");
  const [sourceSearch, setSourceSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  const [showMoreTypes, setShowMoreTypes] = useState(false);

  // Data from store
  const [sources, setSources] = useState<LibraryItem[]>([]);
  const [skills, setSkills] = useState<SkillV2[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => {
      setSources(getSynthesisReadyLibraryItems());
      setSkills(getActiveSkillsV2());
      const allUsers = getUsers();
      const titles = Array.from(
        new Set(allUsers.map((u) => u.jobTitleText).filter(Boolean) as string[])
      ).sort();
      setJobTitles(titles);
    };
    refresh();
    return subscribe(refresh);
  }, []);

  const filteredSources = useMemo(() => {
    if (!sourceSearch.trim()) return sources;
    const q = sourceSearch.toLowerCase();
    return sources.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }, [sources, sourceSearch]);

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canProceed = topic.trim().length > 0 && audienceLevel !== "";
  const canSubmit = canProceed && selectedSourceIds.length > 0;

  // Loading screen state
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const hasRedirected = useRef(false);
  const loadingSteps = [
    "Analyzing your selected sources...",
    "Mapping organizational skill gaps...",
    "Generating course structure...",
    "Building lesson content...",
    "Creating assessments and quizzes...",
    "Finalizing course outline...",
  ];

  // When loading finishes, create the course and redirect (as a side effect, NOT inside a state updater)
  useEffect(() => {
    if (loadingDone && !hasRedirected.current) {
      hasRedirected.current = true;
      doCreateAndRedirect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingDone]);

  const handleStartBuilding = () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setLoadingStep(0);
    setLoadingDone(false);
    hasRedirected.current = false;

    // Animate through loading steps
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step >= loadingSteps.length - 1) {
        clearInterval(stepInterval);
        setLoadingStep(loadingSteps.length - 1);
        // Signal done — the useEffect above will handle the redirect
        setTimeout(() => setLoadingDone(true), 600);
      } else {
        setLoadingStep(step);
      }
    }, 800);
  };

  const doCreateAndRedirect = () => {
    try {
      const currentUser = getCurrentUser();
      const selectedSources = sources.filter((s) => selectedSourceIds.includes(s.id));
      const selectedSourceTitles = selectedSources.map((s) => s.title);
      const targetSkill = skills.find((s) => s.id === targetSkillId);

      // Build a system context message with setup info for the agent
      const setupMessage: ChatMessage = {
        id: `msg_setup_${Date.now()}`,
        role: "system",
        content: [
          `Setup context:`,
          `Topic: ${topic.trim()}`,
          `Course Type: ${synthesisType}`,
          targetRole ? `Target Job Title: ${targetRole}` : null,
          targetSkill ? `Target Skill: ${targetSkill.name}` : null,
          audienceLevel ? `Audience Level: ${audienceLevel}` : null,
          `Library Sources: ${selectedSourceTitles.join(", ")}`,
          `Quiz Placement: ${quizPlacement}`,
          additionalContext.trim() ? `Additional Context: ${additionalContext.trim()}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        timestamp: new Date().toISOString(),
      };

      const autoObjectives = generateObjectivesForTopic(topic.trim());
      const autoCategory = detectCategory(topic.trim());
      const autoDescription = `A ${synthesisType === "micro-lesson" ? "micro-lesson" : "comprehensive training course"} covering ${topic.trim().toLowerCase()}. ${targetRole ? `Designed for ${targetRole}.` : "Suitable for all relevant personnel."}`;

      const newCourse = createCourse({
        title: topic.trim(),
        description: autoDescription,
        status: "ai-draft",
        category: autoCategory,
        tags: [],
        lessonIds: [],
        ownerUserId: currentUser?.id,
        aiGenerated: true,
        synthesisType,
        sourceIds: selectedSourceIds,
        sourceAttributions: selectedSourceTitles,
        conversationHistory: [setupMessage],
        suggestedSkillIds: targetSkillId ? [targetSkillId] : [],
        metadata: {
          objectives: autoObjectives,
          difficulty: audienceLevel === "new-hire" ? "beginner" : audienceLevel === "recertification" ? "intermediate" : undefined,
        },
      });

      console.log("[GENERATE] Course created:", {
        id: newCourse.id,
        aiGenerated: newCourse.aiGenerated,
        status: newCourse.status,
        convHistoryLen: newCourse.conversationHistory?.length,
        sourceIds: newCourse.sourceIds,
      });

      // Redirect to the editor — the agent will auto-start there
      router.push(`/admin/courses/${newCourse.id}/edit`);
    } catch {
      alert("Failed to create course. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AdminLayout>
        {/* ═══ LOADING SCREEN ═══ */}
        {isSubmitting && (
          <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center px-6">
              {/* Animated icon */}
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full animate-ping opacity-30" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Building Your Course</h2>
              <p className="text-sm text-gray-500 mb-8">
                The AI is analyzing your sources and generating course content.
              </p>

              {/* Progress steps */}
              <div className="space-y-3 text-left mb-8">
                {loadingSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      i < loadingStep
                        ? "opacity-50"
                        : i === loadingStep
                        ? "opacity-100"
                        : "opacity-30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors duration-300 ${
                      i < loadingStep
                        ? "bg-purple-600 text-white"
                        : i === loadingStep
                        ? "bg-purple-100 text-purple-600 ring-2 ring-purple-300 ring-offset-1"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {i < loadingStep ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${
                      i === loadingStep ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">This usually takes a few seconds...</p>
            </div>
          </div>
        )}

        {/* ═══ FORM ═══ */}
        {!isSubmitting && (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push("/admin/courses")}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Provide context and the AI agent will build your course in the editor.
                  </p>
                </div>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[
                { step: 1 as const, label: "What are you building?" },
                { step: 2 as const, label: "Who's it for?" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className={`w-12 h-0.5 rounded-full transition-colors ${wizardStep >= s.step ? "bg-purple-400" : "bg-gray-200"}`} />
                  )}
                  <button
                    onClick={() => { if (s.step === 1 || canProceed) setWizardStep(s.step); }}
                    className="flex items-center gap-2 group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      wizardStep === s.step
                        ? "bg-purple-600 text-white ring-2 ring-purple-200 ring-offset-1"
                        : wizardStep > s.step
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {wizardStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      wizardStep === s.step ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {s.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden">

              {/* ═══ STEP 1: What are you building? ═══ */}
              {wizardStep === 1 && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Course Topic */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Lockout/Tagout Safety, Confined Space Entry, PPE Selection..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base bg-white text-gray-900 hover:border-gray-300"
                  />
                  <p className="text-xs text-gray-400 mt-1">The main subject area for the generated course.</p>
                </div>

                {/* Course Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Type
                  </label>
                  {(() => {
                    const primaryTypes: { value: SynthesisType; label: string; desc: string }[] = [
                      { value: "micro-lesson", label: "Micro-Lesson", desc: "5-15 min focused lesson" },
                      { value: "full-course", label: "Full Course", desc: "30-60 min multi-lesson training" },
                      { value: "onboarding-path", label: "Onboarding Path", desc: "Multi-session learning path" },
                    ];
                    const extraTypes: { value: SynthesisType; label: string; desc: string }[] = [
                      { value: "toolbox-talk", label: "Toolbox Talk", desc: "5 min team safety briefing" },
                      { value: "refresher", label: "Refresher", desc: "Recertification for expiring skills" },
                      { value: "what-changed", label: "What Changed", desc: "Delta update when a source is revised" },
                      { value: "assessment-only", label: "Assessment Only", desc: "Competency check, no lesson content" },
                    ];
                    const isExtraSelected = extraTypes.some((t) => t.value === synthesisType);
                    const renderCard = (opt: { value: SynthesisType; label: string; desc: string }) => (
                      <label
                        key={opt.value}
                        className={`flex flex-col items-center gap-1 p-4 rounded-xl cursor-pointer border-2 transition-all text-center ${
                          synthesisType === opt.value
                            ? "border-purple-400 bg-purple-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="synthesisType"
                          value={opt.value}
                          checked={synthesisType === opt.value}
                          onChange={() => setSynthesisType(opt.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </label>
                    );
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          {primaryTypes.map(renderCard)}
                        </div>

                        {/* Collapsed indicator when an extra type is selected */}
                        {!showMoreTypes && isExtraSelected && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 font-medium px-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected: {extraTypes.find((t) => t.value === synthesisType)?.label}</span>
                          </div>
                        )}

                        {/* Toggle link */}
                        <button
                          type="button"
                          onClick={() => setShowMoreTypes((v) => !v)}
                          className="mt-2 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                          {showMoreTypes ? (
                            <>Less types <ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <>More types <ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </button>

                        {/* Expanded extra types */}
                        {showMoreTypes && (
                          <div className="grid grid-cols-3 gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {extraTypes.map(renderCard)}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Audience Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Audience Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "new-hire" as const, label: "New Hire", desc: "No prior knowledge assumed" },
                      { value: "experienced" as const, label: "Experienced", desc: "Familiar with basics, deeper focus" },
                      { value: "recertification" as const, label: "Recertification", desc: "Refresher for expired or expiring skills" },
                    ]).map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex flex-col items-center gap-1 p-4 rounded-xl cursor-pointer border-2 transition-all text-center ${
                          audienceLevel === opt.value
                            ? "border-purple-400 bg-purple-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="audienceLevel"
                          value={opt.value}
                          checked={audienceLevel === opt.value}
                          onChange={() => setAudienceLevel(opt.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
              )}

              {/* ═══ STEP 2: Who's it for? ═══ */}
              {wizardStep === 2 && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Target Job Title + Target Skill (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Job Title
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white text-gray-900 hover:border-gray-300"
                    >
                      <option value="">Any job title</option>
                      {jobTitles.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Skill
                    </label>
                    <select
                      value={targetSkillId}
                      onChange={(e) => setTargetSkillId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white text-gray-900 hover:border-gray-300"
                    >
                      <option value="">No specific skill</option>
                      {skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Library Sources */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Library className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    Library Sources <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {sources.length} available
                    </span>
                  </label>

                  {/* Search */}
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={sourceSearch}
                      onChange={(e) => setSourceSearch(e.target.value)}
                      placeholder="Search sources..."
                      className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
                    />
                  </div>

                  {/* Checklist */}
                  <div className="max-h-56 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50 p-2 space-y-1">
                    {filteredSources.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No synthesis-ready sources found
                      </p>
                    ) : (
                      filteredSources.map((source) => (
                        <label
                          key={source.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                            selectedSourceIds.includes(source.id)
                              ? "bg-purple-50 border border-purple-200"
                              : "hover:bg-white border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSourceIds.includes(source.id)}
                            onChange={() => toggleSource(source.id)}
                            className="mt-0.5 accent-purple-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-700 font-medium">
                              {source.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {source.sourceType && (
                                <span className="text-xs text-gray-400 capitalize">
                                  {source.sourceType}
                                </span>
                              )}
                              {source.regulatoryRef && (
                                <span className="text-xs text-gray-400">
                                  {source.regulatoryRef}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {selectedSourceIds.length > 0 && (
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      {selectedSourceIds.length} source{selectedSourceIds.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                {/* Quiz Placement */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quiz Placement
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "per-lesson" as const, label: "After Each Lesson", desc: "Knowledge checks per lesson" },
                      { value: "end-of-course" as const, label: "End of Course", desc: "Single final assessment" },
                      { value: "both" as const, label: "Both", desc: "Lesson quizzes + final exam" },
                    ]).map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex flex-col items-center gap-1 p-4 rounded-xl cursor-pointer border-2 transition-all text-center ${
                          quizPlacement === opt.value
                            ? "border-purple-400 bg-purple-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="quizPlacement"
                          value={opt.value}
                          checked={quizPlacement === opt.value}
                          onChange={() => setQuizPlacement(opt.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Choose where quizzes appear. You can adjust per-lesson quizzes in the editor.</p>
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Context
                    <span className="text-xs font-normal text-gray-400 ml-2">Optional</span>
                  </label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Any specific guidance for the AI? e.g., focus on recertification, emphasize hands-on assessment, target beginner audience..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-sm bg-white text-gray-900 hover:border-gray-300"
                  />
                </div>
              </div>
              )}

              {/* Footer — step-aware */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                {wizardStep === 1 ? (
                  <>
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setWizardStep(2)}
                      disabled={!canProceed}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setWizardStep(1)}
                      className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleStartBuilding}
                      disabled={!canSubmit || isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isSubmitting ? "Creating..." : "Start Building"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </AdminLayout>
    </RouteGuard>
  );
}
