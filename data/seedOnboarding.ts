// Seed data for Onboarding Paths and Assignments
import type { OnboardingPath, OnboardingAssignment } from "@/types";

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const daysAgoDate = (d: number) => new Date(Date.now() - d * 86400000).toISOString().split("T")[0];

// ════════════════════════════════════════════════════════════════════════════
// PUBLISHED: Safety Manager Onboarding (jt_safety_manager)
// 5 required skills: loto, confined_space, hazmat, fall_protection, first_aid
// 3 phases, 5 courses, 21 days, 100% coverage
// ════════════════════════════════════════════════════════════════════════════

export const safetyManagerPath: OnboardingPath = {
  id: "obp_safety_manager",
  jobTitleId: "jt_safety_manager",
  title: "Safety Manager Onboarding",
  description:
    "Comprehensive 21-day onboarding program for new Safety Manager hires. Covers all 5 required safety certifications across 3 phases, from foundational safety awareness through advanced compliance and incident management.",
  status: "published",
  durationDays: 21,
  totalEstimatedMinutes: 450,
  phases: [
    {
      id: "obp_sm_ph1",
      name: "Safety Foundations",
      description: "Core safety awareness and emergency response certification",
      timeline: "Day 1",
      dayStart: 1,
      dayEnd: 1,
      courses: [
        {
          id: "obp_sm_c1",
          title: "Safety Culture & Awareness",
          category: "Safety",
          estimatedMinutes: 45,
          skillsGranted: [],
          sourceAttributions: ["lib_005", "lib_004"],
          lessons: [
            { title: "Company Safety Philosophy & Policies", estimatedMinutes: 15, isAssessment: false },
            { title: "Hazard Recognition & Risk Assessment", estimatedMinutes: 15, isAssessment: false },
            { title: "Safety Awareness Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
        {
          id: "obp_sm_c2",
          title: "First Aid & CPR Certification",
          category: "Safety",
          estimatedMinutes: 60,
          skillsGranted: ["skl_first_aid"],
          sourceAttributions: ["lib_015"],
          passingScore: 85,
          lessons: [
            { title: "Emergency Assessment & Triage", estimatedMinutes: 20, isAssessment: false },
            { title: "CPR & AED Procedures", estimatedMinutes: 20, isAssessment: false },
            { title: "First Aid Certification Assessment", estimatedMinutes: 20, isAssessment: true },
          ],
        },
      ],
    },
    {
      id: "obp_sm_ph2",
      name: "Critical Certifications",
      description: "Essential safety certifications required for oversight duties",
      timeline: "Week 1",
      dayStart: 2,
      dayEnd: 7,
      courses: [
        {
          id: "obp_sm_c3",
          title: "Lockout/Tagout (LOTO) Procedures",
          category: "Safety",
          estimatedMinutes: 60,
          skillsGranted: ["skl_loto"],
          sourceAttributions: ["lib_002"],
          passingScore: 85,
          lessons: [
            { title: "Energy Sources & Hazardous Energy Control", estimatedMinutes: 15, isAssessment: false },
            { title: "The 6-Step LOTO Procedure", estimatedMinutes: 20, isAssessment: false },
            { title: "Group Lockout & Complex Equipment", estimatedMinutes: 15, isAssessment: false },
            { title: "LOTO Certification Assessment", estimatedMinutes: 10, isAssessment: true },
          ],
        },
        {
          id: "obp_sm_c4",
          title: "Confined Space Entry",
          category: "Safety",
          estimatedMinutes: 45,
          skillsGranted: ["skl_confined_space"],
          sourceAttributions: ["lib_013"],
          passingScore: 85,
          lessons: [
            { title: "Confined Space Classification & Hazards", estimatedMinutes: 15, isAssessment: false },
            { title: "Entry Procedures & Atmospheric Testing", estimatedMinutes: 15, isAssessment: false },
            { title: "Confined Space Certification Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
      ],
    },
    {
      id: "obp_sm_ph3",
      name: "Advanced Compliance & Review",
      description: "HazMat handling, fall protection, and comprehensive onboarding review",
      timeline: "Week 2-3",
      dayStart: 8,
      dayEnd: 21,
      courses: [
        {
          id: "obp_sm_c5",
          title: "Hazardous Materials & Fall Protection",
          category: "Safety",
          estimatedMinutes: 90,
          skillsGranted: ["skl_hazmat", "skl_fall_protection"],
          sourceAttributions: ["lib_001", "lib_014"],
          passingScore: 85,
          lessons: [
            { title: "HazCom & GHS Labeling", estimatedMinutes: 20, isAssessment: false },
            { title: "Safety Data Sheets & Chemical Handling", estimatedMinutes: 20, isAssessment: false },
            { title: "Fall Protection Systems & Equipment", estimatedMinutes: 20, isAssessment: false },
            { title: "Combined Certification Assessment", estimatedMinutes: 30, isAssessment: true },
          ],
        },
      ],
    },
  ],
  skillsCovered: ["skl_loto", "skl_confined_space", "skl_hazmat", "skl_fall_protection", "skl_first_aid"],
  skillsGap: [],
  confidenceScore: 93,
  sourceIds: ["lib_001", "lib_002", "lib_004", "lib_005", "lib_013", "lib_014", "lib_015"],
  industryContext: "Manufacturing",
  generatedByUserId: "usr_admin_1",
  publishedAt: daysAgo(6),
  publishedByUserId: "usr_admin_1",
  createdAt: daysAgo(8),
  updatedAt: daysAgo(6),
};

// ════════════════════════════════════════════════════════════════════════════
// DRAFT: Maintenance Technician - HVAC Onboarding (jt_maint_hvac)
// 8 required skills, 6 covered, 2 gaps (fall_protection, electrical_basic)
// 4 phases, 7 courses, 30 days
// ════════════════════════════════════════════════════════════════════════════

export const hvacDraftPath: OnboardingPath = {
  id: "obp_maint_hvac_draft",
  jobTitleId: "jt_maint_hvac",
  title: "Maintenance Technician - HVAC Onboarding",
  description:
    "Comprehensive 30-day onboarding program for new HVAC Maintenance Technician hires at Plant A. Covers 6 of 8 required skills across 4 phases, from critical safety certifications through role-specific equipment training.",
  status: "draft",
  durationDays: 30,
  totalEstimatedMinutes: 540,
  phases: [
    {
      id: "obp_hvac_ph1",
      name: "Safety Orientation",
      description: "Get new hires up to speed on fundamental safety awareness",
      timeline: "Day 1",
      dayStart: 1,
      dayEnd: 1,
      courses: [
        {
          id: "obp_hvac_c1",
          title: "Workplace Safety Fundamentals",
          category: "Safety",
          estimatedMinutes: 45,
          skillsGranted: [],
          sourceAttributions: ["lib_005", "lib_006"],
          lessons: [
            { title: "Hazard Recognition & Risk Assessment", estimatedMinutes: 15, isAssessment: false },
            { title: "Personal Protective Equipment", estimatedMinutes: 15, isAssessment: false },
            { title: "Safety Awareness Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
        {
          id: "obp_hvac_c2",
          title: "First Aid & CPR Certification",
          category: "Safety",
          estimatedMinutes: 45,
          skillsGranted: ["skl_first_aid"],
          sourceAttributions: ["lib_015"],
          passingScore: 85,
          lessons: [
            { title: "Emergency Assessment & Triage", estimatedMinutes: 15, isAssessment: false },
            { title: "CPR & AED Procedures", estimatedMinutes: 15, isAssessment: false },
            { title: "First Aid Certification Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
      ],
    },
    {
      id: "obp_hvac_ph2",
      name: "Core Safety Certifications",
      description: "Essential certifications required before any hands-on work",
      timeline: "Week 1",
      dayStart: 2,
      dayEnd: 7,
      courses: [
        {
          id: "obp_hvac_c3",
          title: "Lockout/Tagout (LOTO) Procedures",
          category: "Safety",
          estimatedMinutes: 60,
          skillsGranted: ["skl_loto"],
          sourceAttributions: ["lib_002"],
          passingScore: 85,
          lessons: [
            { title: "Understanding Energy Sources & Hazards", estimatedMinutes: 15, isAssessment: false },
            { title: "The 6-Step LOTO Procedure", estimatedMinutes: 20, isAssessment: false },
            { title: "Group Lockout & Complex Equipment", estimatedMinutes: 15, isAssessment: false },
            { title: "LOTO Certification Assessment", estimatedMinutes: 10, isAssessment: true },
          ],
        },
        {
          id: "obp_hvac_c4",
          title: "Confined Space Entry",
          category: "Safety",
          estimatedMinutes: 45,
          skillsGranted: ["skl_confined_space"],
          sourceAttributions: ["lib_013"],
          passingScore: 85,
          lessons: [
            { title: "Confined Space Classification & Hazards", estimatedMinutes: 15, isAssessment: false },
            { title: "Entry Procedures & Atmospheric Testing", estimatedMinutes: 15, isAssessment: false },
            { title: "Confined Space Certification Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
      ],
    },
    {
      id: "obp_hvac_ph3",
      name: "Equipment & Role-Specific Training",
      description: "Role-specific equipment operation and maintenance skills",
      timeline: "Week 2-3",
      dayStart: 8,
      dayEnd: 21,
      courses: [
        {
          id: "obp_hvac_c5",
          title: "Forklift Operation Certification",
          category: "Equipment",
          estimatedMinutes: 90,
          skillsGranted: ["skl_forklift"],
          sourceAttributions: ["lib_003", "lib_007"],
          passingScore: 85,
          lessons: [
            { title: "Forklift Types & Components", estimatedMinutes: 20, isAssessment: false },
            { title: "Pre-Operation Inspection", estimatedMinutes: 20, isAssessment: false },
            { title: "Safe Operating Procedures", estimatedMinutes: 30, isAssessment: false },
            { title: "Forklift Certification Assessment", estimatedMinutes: 20, isAssessment: true },
          ],
        },
        {
          id: "obp_hvac_c6",
          title: "HVAC Systems Fundamentals",
          category: "Equipment",
          estimatedMinutes: 60,
          skillsGranted: ["skl_hvac_basic"],
          sourceAttributions: [],
          lessons: [
            { title: "HVAC System Components & Theory", estimatedMinutes: 20, isAssessment: false },
            { title: "Preventive Maintenance Procedures", estimatedMinutes: 20, isAssessment: false },
            { title: "Troubleshooting & Diagnostics", estimatedMinutes: 20, isAssessment: false },
          ],
        },
      ],
    },
    {
      id: "obp_hvac_ph4",
      name: "Compliance & Completion",
      description: "Regulatory compliance training and final onboarding review",
      timeline: "Week 4",
      dayStart: 22,
      dayEnd: 30,
      courses: [
        {
          id: "obp_hvac_c7",
          title: "Hazard Communication (HazCom)",
          category: "Compliance",
          estimatedMinutes: 45,
          skillsGranted: ["skl_hazmat"],
          sourceAttributions: ["lib_014", "lib_001"],
          passingScore: 85,
          lessons: [
            { title: "GHS Labeling & Safety Data Sheets", estimatedMinutes: 15, isAssessment: false },
            { title: "Chemical Handling & Storage", estimatedMinutes: 15, isAssessment: false },
            { title: "HazCom Assessment", estimatedMinutes: 15, isAssessment: true },
          ],
        },
      ],
    },
  ],
  skillsCovered: ["skl_loto", "skl_confined_space", "skl_forklift", "skl_hvac_basic", "skl_hazmat", "skl_first_aid"],
  skillsGap: ["skl_fall_protection", "skl_electrical_basic"],
  confidenceScore: 89,
  sourceIds: ["lib_001", "lib_002", "lib_003", "lib_005", "lib_006", "lib_007", "lib_013", "lib_014", "lib_015"],
  industryContext: "Manufacturing",
  generatedByUserId: "usr_admin_1",
  createdAt: daysAgo(2),
  updatedAt: daysAgo(2),
};

export const seedOnboardingPaths: OnboardingPath[] = [safetyManagerPath, hvacDraftPath];

// ════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS
// ════════════════════════════════════════════════════════════════════════════

export const seedOnboardingAssignments: OnboardingAssignment[] = [
  // Active: Olivia Garcia — Safety Manager path, Day 16, Phase 3 in progress, 68%
  {
    id: "oba_001",
    pathId: "obp_safety_manager",
    userId: "usr_lrn_a_pkg_6",
    status: "active",
    startDate: daysAgoDate(15),
    phaseProgress: [
      { phaseId: "obp_sm_ph1", status: "completed", coursesCompleted: 2, coursesTotal: 2 },
      { phaseId: "obp_sm_ph2", status: "completed", coursesCompleted: 2, coursesTotal: 2 },
      { phaseId: "obp_sm_ph3", status: "in_progress", coursesCompleted: 0, coursesTotal: 1 },
    ],
    skillsEarned: ["skl_first_aid", "skl_loto", "skl_confined_space"],
    assignedByUserId: "usr_admin_1",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(1),
  },

  // Active: Marcus Johnson — Safety Manager path but as secondary assignment, Day 3, Phase 2 in progress
  {
    id: "oba_002",
    pathId: "obp_safety_manager",
    userId: "usr_lrn_a_pkg_1",
    status: "active",
    startDate: daysAgoDate(2),
    phaseProgress: [
      { phaseId: "obp_sm_ph1", status: "completed", coursesCompleted: 2, coursesTotal: 2 },
      { phaseId: "obp_sm_ph2", status: "in_progress", coursesCompleted: 1, coursesTotal: 2 },
      { phaseId: "obp_sm_ph3", status: "locked", coursesCompleted: 0, coursesTotal: 1 },
    ],
    skillsEarned: ["skl_first_aid", "skl_loto"],
    assignedByUserId: "usr_admin_1",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
  },

  // Completed: Alex Rivera — finished the Safety Manager path
  {
    id: "oba_003",
    pathId: "obp_safety_manager",
    userId: "usr_star_1",
    status: "completed",
    startDate: daysAgoDate(30),
    completedAt: daysAgo(10),
    phaseProgress: [
      { phaseId: "obp_sm_ph1", status: "completed", coursesCompleted: 2, coursesTotal: 2 },
      { phaseId: "obp_sm_ph2", status: "completed", coursesCompleted: 2, coursesTotal: 2 },
      { phaseId: "obp_sm_ph3", status: "completed", coursesCompleted: 1, coursesTotal: 1 },
    ],
    skillsEarned: ["skl_first_aid", "skl_loto", "skl_confined_space", "skl_hazmat", "skl_fall_protection"],
    assignedByUserId: "usr_admin_1",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
  },
];
