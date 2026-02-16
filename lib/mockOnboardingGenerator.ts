// Mock AI generator for onboarding paths
// Reads REAL data from the store: job title skills, library sources
// Groups skills by priority into phases, generates realistic courses

import type { OnboardingPath, OnboardingPhase, OnboardingPhaseCourse, SkillV2, LibraryItem } from "@/types";
import { getJobTitleById, getSkillV2ById, getLibraryItems } from "@/lib/store";

// Skill-to-source matching heuristics
const SKILL_SOURCE_HINTS: Record<string, { keywords: string[]; regRefs: string[] }> = {
  skl_loto: { keywords: ["lockout", "tagout", "loto", "energy control"], regRefs: ["1910.147"] },
  skl_confined_space: { keywords: ["confined space", "atmospheric"], regRefs: ["1910.146"] },
  skl_forklift: { keywords: ["forklift", "powered industrial", "truck"], regRefs: ["1910.178"] },
  skl_hvac_basic: { keywords: ["hvac", "air handler", "chiller", "refrigeration"], regRefs: [] },
  skl_fall_protection: { keywords: ["fall protection", "harness", "fall arrest"], regRefs: ["1926.501", "1910.28"] },
  skl_electrical_basic: { keywords: ["electrical", "arc flash", "nfpa 70e"], regRefs: ["1910.301", "1910.302"] },
  skl_hazmat: { keywords: ["hazmat", "hazard communication", "hazcom", "chemical", "ghs", "sds"], regRefs: ["1910.1200", "1910.120"] },
  skl_first_aid: { keywords: ["first aid", "cpr", "aed", "emergency response"], regRefs: ["1910.151"] },
  skl_gmp: { keywords: ["gmp", "good manufacturing", "quality"], regRefs: [] },
  skl_plumbing: { keywords: ["plumbing", "pipe", "water system"], regRefs: [] },
  skl_incident_investigation: { keywords: ["incident", "investigation", "root cause"], regRefs: [] },
};

// Realistic lesson templates keyed by skill ID
const COURSE_TEMPLATES: Record<string, { title: string; category: string; lessons: { title: string; min: number; isAssessment: boolean }[] }> = {
  skl_loto: {
    title: "Lockout/Tagout (LOTO) Procedures",
    category: "Safety",
    lessons: [
      { title: "Understanding Energy Sources & Hazards", min: 15, isAssessment: false },
      { title: "The 6-Step LOTO Procedure", min: 20, isAssessment: false },
      { title: "Group Lockout & Complex Equipment", min: 15, isAssessment: false },
      { title: "LOTO Certification Assessment", min: 10, isAssessment: true },
    ],
  },
  skl_confined_space: {
    title: "Confined Space Entry",
    category: "Safety",
    lessons: [
      { title: "Confined Space Classification & Hazards", min: 15, isAssessment: false },
      { title: "Entry Procedures & Atmospheric Testing", min: 15, isAssessment: false },
      { title: "Confined Space Certification Assessment", min: 15, isAssessment: true },
    ],
  },
  skl_forklift: {
    title: "Forklift Operation Certification",
    category: "Equipment",
    lessons: [
      { title: "Forklift Types & Components", min: 20, isAssessment: false },
      { title: "Pre-Operation Inspection", min: 20, isAssessment: false },
      { title: "Safe Operating Procedures", min: 30, isAssessment: false },
      { title: "Forklift Certification Assessment", min: 20, isAssessment: true },
    ],
  },
  skl_hvac_basic: {
    title: "HVAC Systems Fundamentals",
    category: "Equipment",
    lessons: [
      { title: "HVAC System Components & Theory", min: 20, isAssessment: false },
      { title: "Preventive Maintenance Procedures", min: 20, isAssessment: false },
      { title: "Troubleshooting & Diagnostics", min: 20, isAssessment: false },
    ],
  },
  skl_fall_protection: {
    title: "Fall Protection & Working at Heights",
    category: "Safety",
    lessons: [
      { title: "Fall Hazard Assessment", min: 15, isAssessment: false },
      { title: "Personal Fall Arrest Systems", min: 20, isAssessment: false },
      { title: "Harness Inspection & Proper Use", min: 15, isAssessment: false },
      { title: "Fall Protection Assessment", min: 10, isAssessment: true },
    ],
  },
  skl_electrical_basic: {
    title: "Basic Electrical Safety",
    category: "Safety",
    lessons: [
      { title: "Electrical Hazard Awareness", min: 15, isAssessment: false },
      { title: "Safe Work Practices & Arc Flash", min: 20, isAssessment: false },
      { title: "Electrical Safety Assessment", min: 15, isAssessment: true },
    ],
  },
  skl_hazmat: {
    title: "Hazard Communication (HazCom)",
    category: "Compliance",
    lessons: [
      { title: "GHS Labeling & Safety Data Sheets", min: 15, isAssessment: false },
      { title: "Chemical Handling & Storage", min: 15, isAssessment: false },
      { title: "HazCom Assessment", min: 15, isAssessment: true },
    ],
  },
  skl_first_aid: {
    title: "First Aid & CPR Certification",
    category: "Safety",
    lessons: [
      { title: "Emergency Assessment & Triage", min: 20, isAssessment: false },
      { title: "CPR & AED Procedures", min: 20, isAssessment: false },
      { title: "First Aid Certification Assessment", min: 20, isAssessment: true },
    ],
  },
  skl_gmp: {
    title: "Good Manufacturing Practices (GMP)",
    category: "Compliance",
    lessons: [
      { title: "GMP Principles & Documentation", min: 20, isAssessment: false },
      { title: "Quality Control on the Production Floor", min: 20, isAssessment: false },
      { title: "GMP Compliance Assessment", min: 15, isAssessment: true },
    ],
  },
  skl_plumbing: {
    title: "Plumbing Systems & Maintenance",
    category: "Equipment",
    lessons: [
      { title: "Plumbing System Components", min: 20, isAssessment: false },
      { title: "Common Repairs & Maintenance", min: 20, isAssessment: false },
      { title: "Plumbing Skills Assessment", min: 15, isAssessment: true },
    ],
  },
  skl_incident_investigation: {
    title: "Incident Investigation & Root Cause Analysis",
    category: "Safety",
    lessons: [
      { title: "Investigation Methodology", min: 20, isAssessment: false },
      { title: "Root Cause Analysis Techniques", min: 20, isAssessment: false },
      { title: "Investigation Assessment", min: 15, isAssessment: true },
    ],
  },
};

function matchSourcesForSkill(skillId: string, sources: LibraryItem[]): string[] {
  const hints = SKILL_SOURCE_HINTS[skillId];
  if (!hints) return [];

  return sources
    .filter((src) => {
      const text = `${src.title} ${src.description || ""} ${(src.tags || []).join(" ")} ${(src.categories || []).join(" ")} ${src.regulatoryRef || ""}`.toLowerCase();
      const matchesKeyword = hints.keywords.some((kw) => text.includes(kw));
      const matchesRef = hints.regRefs.some((ref) => text.includes(ref.toLowerCase()));
      return matchesKeyword || matchesRef;
    })
    .map((s) => s.id);
}

interface GenerateInput {
  jobTitleId: string;
  sourceIds: string[];
  industryContext?: string;
  additionalInstructions?: string;
}

export async function generateOnboardingPath(input: GenerateInput): Promise<Omit<OnboardingPath, "id" | "createdAt" | "updatedAt">> {
  // Simulated AI delay
  await new Promise((r) => setTimeout(r, 3500));

  const jt = getJobTitleById(input.jobTitleId);
  if (!jt) throw new Error(`Job title ${input.jobTitleId} not found`);

  const allSources = getLibraryItems();
  const selectedSources = allSources.filter((s) => input.sourceIds.includes(s.id));

  // Group skills by priority
  const critical = jt.requiredSkills.filter((s) => s.priority === "critical");
  const high = jt.requiredSkills.filter((s) => s.priority === "high");
  const medium = jt.requiredSkills.filter((s) => s.priority === "medium");
  const low = jt.requiredSkills.filter((s) => s.priority === "low");

  const skillsCovered: string[] = [];
  const skillsGap: string[] = [];
  const usedSourceIds = new Set<string>();
  let courseIdCounter = 0;

  function buildCourse(skillId: string): OnboardingPhaseCourse | null {
    const skill = getSkillV2ById(skillId);
    if (!skill) return null;

    const template = COURSE_TEMPLATES[skillId];
    const matchedSources = matchSourcesForSkill(skillId, selectedSources);

    // If no template, still generate a generic course
    const title = template?.title || `${skill.name} Training`;
    const category = template?.category || skill.category || "General";
    const lessons = template?.lessons || [
      { title: `${skill.name} Fundamentals`, min: 20, isAssessment: false },
      { title: `${skill.name} Practical Application`, min: 20, isAssessment: false },
      { title: `${skill.name} Assessment`, min: 15, isAssessment: true },
    ];

    matchedSources.forEach((sid) => usedSourceIds.add(sid));
    skillsCovered.push(skillId);

    const isCert = skill.type === "certification";
    courseIdCounter++;

    return {
      id: `gen_c_${courseIdCounter}`,
      title,
      category,
      estimatedMinutes: lessons.reduce((sum, l) => sum + l.min, 0),
      skillsGranted: [skillId],
      sourceAttributions: matchedSources,
      passingScore: isCert ? 85 : undefined,
      lessons: lessons.map((l) => ({
        title: l.title,
        estimatedMinutes: l.min,
        isAssessment: l.isAssessment,
      })),
    };
  }

  // Determine phase structure based on skill count
  const totalSkills = jt.requiredSkills.length;
  const phases: OnboardingPhase[] = [];
  let phaseCounter = 0;

  // Phase 1: Safety Orientation (Day 1) -- always present
  const phase1Courses: OnboardingPhaseCourse[] = [];

  // Add a general orientation course
  phaseCounter++;
  courseIdCounter++;
  const orientationSources = selectedSources
    .filter((s) => {
      const text = `${s.title} ${s.description || ""} ${(s.tags || []).join(" ")}`.toLowerCase();
      return text.includes("orientation") || text.includes("safety handbook") || text.includes("new employee") || text.includes("ppe");
    })
    .map((s) => s.id);
  orientationSources.forEach((sid) => usedSourceIds.add(sid));

  phase1Courses.push({
    id: `gen_c_${courseIdCounter}`,
    title: "Workplace Safety Fundamentals",
    category: "Safety",
    estimatedMinutes: 45,
    skillsGranted: [],
    sourceAttributions: orientationSources.slice(0, 3),
    lessons: [
      { title: "Hazard Recognition & Risk Assessment", estimatedMinutes: 15, isAssessment: false },
      { title: "Personal Protective Equipment", estimatedMinutes: 15, isAssessment: false },
      { title: "Safety Awareness Assessment", estimatedMinutes: 15, isAssessment: true },
    ],
  });

  // Add First Aid to Phase 1 if it's in the required skills
  const firstAidReq = jt.requiredSkills.find((s) => s.skillId === "skl_first_aid");
  if (firstAidReq) {
    const faCourse = buildCourse("skl_first_aid");
    if (faCourse) phase1Courses.push(faCourse);
  }

  phases.push({
    id: `gen_ph_${phaseCounter}`,
    name: "Safety Orientation",
    description: "Get new hires up to speed on fundamental safety awareness",
    timeline: "Day 1",
    dayStart: 1,
    dayEnd: 1,
    courses: phase1Courses,
  });

  // Phase 2: Critical skills (Week 1)
  const criticalCourses: OnboardingPhaseCourse[] = [];
  for (const req of critical) {
    if (req.skillId === "skl_first_aid") continue; // already in Phase 1
    const course = buildCourse(req.skillId);
    if (course) criticalCourses.push(course);
    else skillsGap.push(req.skillId);
  }

  if (criticalCourses.length > 0) {
    phaseCounter++;
    phases.push({
      id: `gen_ph_${phaseCounter}`,
      name: "Core Safety Certifications",
      description: "Essential certifications required before any hands-on work",
      timeline: "Week 1",
      dayStart: 2,
      dayEnd: 7,
      courses: criticalCourses,
    });
  }

  // Phase 3: High priority skills (Week 2-3)
  const highCourses: OnboardingPhaseCourse[] = [];
  for (const req of high) {
    if (skillsCovered.includes(req.skillId)) continue;
    const course = buildCourse(req.skillId);
    if (course) highCourses.push(course);
    else skillsGap.push(req.skillId);
  }

  if (highCourses.length > 0) {
    phaseCounter++;
    const isShortPath = totalSkills <= 4;
    phases.push({
      id: `gen_ph_${phaseCounter}`,
      name: "Equipment & Role-Specific Training",
      description: "Role-specific equipment operation and maintenance skills",
      timeline: isShortPath ? "Week 2" : "Week 2-3",
      dayStart: 8,
      dayEnd: isShortPath ? 14 : 21,
      courses: highCourses,
    });
  }

  // Phase 4: Medium/Low priority skills (Week 4+) + completion review
  const medLowCourses: OnboardingPhaseCourse[] = [];
  for (const req of [...medium, ...low]) {
    if (skillsCovered.includes(req.skillId)) continue;
    if (!req.required && req.priority === "low") continue; // skip optional low-priority
    const course = buildCourse(req.skillId);
    if (course) medLowCourses.push(course);
    else skillsGap.push(req.skillId);
  }

  // Always add completion review
  courseIdCounter++;
  medLowCourses.push({
    id: `gen_c_${courseIdCounter}`,
    title: "Onboarding Completion Review",
    category: "General",
    estimatedMinutes: 30,
    skillsGranted: [],
    sourceAttributions: [],
    lessons: [
      { title: "Comprehensive Onboarding Review Assessment", estimatedMinutes: 30, isAssessment: true },
    ],
  });

  if (medLowCourses.length > 0) {
    phaseCounter++;
    const isShortPath = totalSkills <= 4;
    phases.push({
      id: `gen_ph_${phaseCounter}`,
      name: "Compliance & Completion",
      description: "Regulatory compliance training and final onboarding review",
      timeline: isShortPath ? "Week 2" : "Week 4",
      dayStart: isShortPath ? 8 : 22,
      dayEnd: isShortPath ? 14 : 30,
      courses: medLowCourses,
    });
  }

  // Duration: scale by number of skills
  const durationDays = totalSkills <= 4 ? 14 : totalSkills <= 6 ? 21 : 30;

  // Total minutes
  const totalEstimatedMinutes = phases.reduce(
    (sum, ph) => sum + ph.courses.reduce((s2, c) => s2 + c.estimatedMinutes, 0),
    0
  );

  // Confidence score
  const coveragePct = jt.requiredSkills.length > 0
    ? Math.round((skillsCovered.length / jt.requiredSkills.length) * 100)
    : 100;
  const confidence = Math.max(60, Math.min(99, coveragePct - Math.floor(Math.random() * 5)));

  return {
    jobTitleId: input.jobTitleId,
    title: `${jt.name} Onboarding`,
    description: `Comprehensive ${durationDays}-day onboarding program for new ${jt.name} hires${jt.site !== "All Sites" ? ` at ${jt.site}` : ""}. Covers ${skillsCovered.length} required skill${skillsCovered.length !== 1 ? "s" : ""} across ${phases.length} phases, from critical safety certifications through role-specific training.`,
    status: "draft",
    durationDays,
    totalEstimatedMinutes,
    phases,
    skillsCovered,
    skillsGap: [...new Set(skillsGap)],
    confidenceScore: confidence,
    sourceIds: [...usedSourceIds],
    additionalInstructions: input.additionalInstructions,
    industryContext: input.industryContext,
    generatedByUserId: "usr_admin_1",
  };
}
