import type { TrainingResponse } from "@/types";

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

export const seedTrainingResponses: TrainingResponse[] = [
  // 1. Incident Retraining (draft) — LOTO violation, Marcus Johnson
  {
    id: "tr_001",
    type: "incident_retraining",
    status: "draft",
    title: "LOTO Incident Retraining — Marcus Johnson",
    description:
      "Incident-specific retraining for Marcus Johnson following improper LOTO procedure on Compressor Unit #7. Covers correct zero energy verification, group lockout procedures, and prevention measures.",
    urgency: "immediate",
    triggerType: "signal",
    triggeredBySignalId: "sig_001",
    sections: [
      {
        id: "tr_001_s1",
        title: "Incident Review: What Happened",
        description:
          "Review of the February incident involving Compressor Unit #7 where zero energy state was not verified before lockout device removal.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Incident Timeline & Contributing Factors", estimatedMinutes: 5, isAssessment: false },
          { title: "Risk Analysis: Potential Outcomes", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: ["lib_002"],
      },
      {
        id: "tr_001_s2",
        title: "Why It Was Wrong: Procedure Violations",
        description:
          "Analysis of which LOTO steps were skipped or performed incorrectly, mapped to OSHA 1910.147 requirements.",
        estimatedMinutes: 10,
        lessons: [
          { title: "OSHA 1910.147 Requirements Review", estimatedMinutes: 5, isAssessment: false },
          { title: "Procedure Deviation Analysis", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: ["lib_002"],
      },
      {
        id: "tr_001_s3",
        title: "Correct Procedure: Zero Energy Verification",
        description:
          "Step-by-step walkthrough of the correct LOTO procedure including the updated group lockout verification requirements.",
        estimatedMinutes: 15,
        lessons: [
          { title: "The 6-Step LOTO Procedure (Updated)", estimatedMinutes: 8, isAssessment: false },
          { title: "Group Lockout & Individual Verification", estimatedMinutes: 7, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: ["lib_002"],
      },
      {
        id: "tr_001_s4",
        title: "Prevention & Assessment",
        description:
          "Prevention strategies for future incidents and certification reassessment.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Prevention Checklist & Best Practices", estimatedMinutes: 5, isAssessment: false },
          { title: "LOTO Recertification Assessment", estimatedMinutes: 5, isAssessment: true },
        ],
        isAssessment: true,
        sourceAttributions: ["lib_002"],
      },
    ],
    totalEstimatedMinutes: 45,
    assessmentRequired: true,
    passingScore: 85,
    targetUserIds: ["usr_lrn_a_pkg_1"],
    targets: [
      {
        userId: "usr_lrn_a_pkg_1",
        status: "pending",
        skillActions: [{ skillId: "skl_loto", action: "suspend_until_complete" }],
      },
    ],
    affectedSkillIds: ["skl_loto"],
    skillAction: "suspend_until_complete",
    sourceIds: ["lib_002"],
    sourceAttributions: ["lib_002"],
    generatedByUserId: "usr_admin_1",
    deadline: daysFromNow(3),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },

  // 2. Corrective Training (assigned, 75% done) — HazCom process change
  {
    id: "tr_002",
    type: "corrective_training",
    status: "assigned",
    title: "Updated HazCom Training — New Chemical Addition",
    description:
      "Corrective training for all Plant A employees handling or working near chemicals following the addition of Chemical X (industrial solvent) to the facility inventory.",
    urgency: "urgent",
    triggerType: "signal",
    triggeredBySignalId: "sig_006",
    sections: [
      {
        id: "tr_002_s1",
        title: "What Changed: New Chemical Addition",
        description:
          "Overview of Chemical X properties, hazards, and why it was added to the facility.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Chemical X Properties & Safety Data Sheet", estimatedMinutes: 5, isAssessment: false },
          { title: "Hazard Classification & GHS Labels", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: [],
      },
      {
        id: "tr_002_s2",
        title: "Updated Handling Procedures",
        description:
          "New PPE requirements, storage procedures, and emergency response for Chemical X.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Required PPE & Handling Procedures", estimatedMinutes: 5, isAssessment: false },
          { title: "Storage & Emergency Response", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: [],
      },
      {
        id: "tr_002_s3",
        title: "Key Differences & Assessment",
        description:
          "What's different from your existing HazCom training and assessment.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Changes vs. Previous HazCom Protocol", estimatedMinutes: 5, isAssessment: false },
          { title: "HazCom Update Assessment", estimatedMinutes: 5, isAssessment: true },
        ],
        isAssessment: true,
        sourceAttributions: [],
      },
    ],
    totalEstimatedMinutes: 30,
    assessmentRequired: true,
    passingScore: 80,
    targetUserIds: [
      "usr_lrn_a_pkg_1", "usr_lrn_a_pkg_2", "usr_lrn_a_pkg_3", "usr_lrn_a_pkg_4",
      "usr_lrn_a_wh_1", "usr_lrn_a_wh_2", "usr_lrn_a_maint_1", "usr_lrn_a_pkg_5",
    ],
    targets: [
      { userId: "usr_lrn_a_pkg_1", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(6), assessmentScore: 90, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_pkg_2", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(5), assessmentScore: 85, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_pkg_3", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(4), assessmentScore: 88, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_pkg_4", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(3), assessmentScore: 92, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_wh_1", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(2), assessmentScore: 80, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_wh_2", status: "completed", assignedAt: daysAgo(10), completedAt: daysAgo(1), assessmentScore: 95, skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_maint_1", status: "in_progress", assignedAt: daysAgo(10), skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
      { userId: "usr_lrn_a_pkg_5", status: "pending", assignedAt: daysAgo(10), skillActions: [{ skillId: "skl_hazmat", action: "flag_until_complete" }] },
    ],
    affectedSkillIds: ["skl_hazmat"],
    skillAction: "flag_until_complete",
    sourceIds: [],
    sourceAttributions: [],
    generatedByUserId: "usr_admin_1",
    approvedByUserId: "usr_admin_1",
    approvedAt: daysAgo(10),
    deadline: daysFromNow(13),
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
  },

  // 3. Near-Miss Briefing (completed) — Forklift/pedestrian
  {
    id: "tr_003",
    type: "near_miss_briefing",
    status: "completed",
    title: "Forklift Safety Briefing — Loading Dock Near-Miss",
    description:
      "Short safety briefing for warehouse workers following the forklift/pedestrian near-miss at the Warehouse B loading dock.",
    urgency: "standard",
    triggerType: "signal",
    triggeredBySignalId: "sig_003",
    sections: [
      {
        id: "tr_003_s1",
        title: "What Happened",
        description:
          "Overview of the near-miss event at the Warehouse B loading dock, contributing factors, and potential outcomes.",
        estimatedMinutes: 5,
        lessons: [
          { title: "Near-Miss Event Summary", estimatedMinutes: 3, isAssessment: false },
          { title: "Contributing Factors Analysis", estimatedMinutes: 2, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: [],
      },
      {
        id: "tr_003_s2",
        title: "What to Watch For",
        description:
          "Key safety reminders for intersection safety, horn protocols, and pedestrian awareness.",
        estimatedMinutes: 5,
        lessons: [
          { title: "Intersection Safety & Horn Protocols", estimatedMinutes: 3, isAssessment: false },
          { title: "Pedestrian Awareness Best Practices", estimatedMinutes: 2, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: [],
      },
    ],
    totalEstimatedMinutes: 10,
    assessmentRequired: false,
    targetUserIds: [
      "usr_lrn_a_wh_1", "usr_lrn_a_wh_2",
      "usr_lrn_b_wh_1", "usr_lrn_b_wh_2", "usr_lrn_b_wh_3",
      "usr_lrn_a_pkg_1", "usr_lrn_a_pkg_2", "usr_lrn_a_pkg_3",
      "usr_lrn_a_pkg_4", "usr_lrn_a_pkg_5", "usr_lrn_a_pkg_6",
      "usr_lrn_b_maint_1",
    ],
    targets: [
      { userId: "usr_lrn_a_wh_1", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(5), skillActions: [] },
      { userId: "usr_lrn_a_wh_2", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(5), skillActions: [] },
      { userId: "usr_lrn_b_wh_1", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(4), skillActions: [] },
      { userId: "usr_lrn_b_wh_2", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(4), skillActions: [] },
      { userId: "usr_lrn_b_wh_3", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(4), skillActions: [] },
      { userId: "usr_lrn_a_pkg_1", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(3), skillActions: [] },
      { userId: "usr_lrn_a_pkg_2", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(3), skillActions: [] },
      { userId: "usr_lrn_a_pkg_3", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(3), skillActions: [] },
      { userId: "usr_lrn_a_pkg_4", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(2), skillActions: [] },
      { userId: "usr_lrn_a_pkg_5", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(2), skillActions: [] },
      { userId: "usr_lrn_a_pkg_6", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(2), skillActions: [] },
      { userId: "usr_lrn_b_maint_1", status: "completed", assignedAt: daysAgo(7), completedAt: daysAgo(1), skillActions: [] },
    ],
    affectedSkillIds: ["skl_forklift"],
    skillAction: "none",
    sourceIds: [],
    sourceAttributions: [],
    generatedByUserId: "usr_admin_1",
    approvedByUserId: "usr_admin_1",
    approvedAt: daysAgo(7),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
  },

  // 4. Delta Renewal (draft) — upcoming LOTO cert renewal
  {
    id: "tr_004",
    type: "delta_renewal",
    status: "draft",
    title: "LOTO Certification Delta Renewal — Alex Rivera",
    description:
      "Abbreviated renewal training for Alex Rivera's LOTO certification expiring April 1, 2026. Includes core refresher plus a 'What's Changed' section covering the LOTO incident and OSHA 1910.147 update since last certification.",
    urgency: "standard",
    triggerType: "renewal",
    triggeredByRenewalSkillId: "skl_loto",
    sections: [
      {
        id: "tr_004_s1",
        title: "Core LOTO Refresher",
        description:
          "Abbreviated review of LOTO fundamentals for experienced technicians.",
        estimatedMinutes: 10,
        lessons: [
          { title: "LOTO Procedure Quick Review", estimatedMinutes: 5, isAssessment: false },
          { title: "Energy Source Identification Refresher", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: ["lib_002"],
      },
      {
        id: "tr_004_s2",
        title: "What's Changed Since Your Last Certification",
        description:
          "Key changes affecting LOTO procedures since your last certification on August 10, 2025.",
        estimatedMinutes: 10,
        lessons: [
          { title: "Incident Review: Compressor Unit #7", estimatedMinutes: 5, isAssessment: false },
          { title: "OSHA 1910.147 Update: Group Lockout Verification", estimatedMinutes: 5, isAssessment: false },
        ],
        isAssessment: false,
        sourceAttributions: ["lib_002"],
      },
      {
        id: "tr_004_s3",
        title: "Renewal Assessment",
        description:
          "Assessment covering both core LOTO knowledge and recent changes.",
        estimatedMinutes: 10,
        lessons: [
          { title: "LOTO Renewal Certification Assessment", estimatedMinutes: 10, isAssessment: true },
        ],
        isAssessment: true,
        sourceAttributions: ["lib_002"],
      },
    ],
    totalEstimatedMinutes: 30,
    assessmentRequired: true,
    passingScore: 85,
    targetUserIds: ["usr_star_1"],
    targets: [
      {
        userId: "usr_star_1",
        status: "pending",
        skillActions: [{ skillId: "skl_loto", action: "renew" }],
      },
    ],
    affectedSkillIds: ["skl_loto"],
    skillAction: "renew",
    sourceIds: ["lib_002"],
    sourceAttributions: ["lib_002"],
    deltaChanges: [
      {
        changeType: "incident",
        description: "Improper LOTO procedure on Compressor Unit #7 — technician failed to verify zero energy state",
        signalId: "sig_001",
      },
      {
        changeType: "regulatory",
        description: "OSHA 1910.147 updated to require individual zero energy verification in group lockout scenarios",
        before: "Group lockout: one authorized employee verifies for the group",
        after: "Group lockout: each authorized employee must individually verify zero energy state",
        signalId: "sig_002",
      },
      {
        changeType: "source_update",
        description: "LOTO SOP updated to v3.2 with new group lockout verification steps",
        signalId: "sig_004",
      },
    ],
    generatedByUserId: "usr_admin_1",
    deadline: "2026-04-01",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];
