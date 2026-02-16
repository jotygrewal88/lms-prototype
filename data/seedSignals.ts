import type { OperationalSignal, ContentCurrency } from "@/types";

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

// ============================================================================
// SEED OPERATIONAL SIGNALS
// ============================================================================

export const seedOperationalSignals: OperationalSignal[] = [
  // 1. CRITICAL Incident — LOTO Violation (open)
  {
    id: "sig_001",
    type: "incident",
    severity: "critical",
    status: "open",
    title: "Improper LOTO Procedure — Compressor Unit #7",
    description:
      "During scheduled maintenance on Compressor Unit #7, technician failed to verify zero energy state before removing lockout device. Unit briefly energized while hands were in pinch point area. No injury but classified as high-potential near-miss escalated to incident.",
    occurredAt: daysAgo(2),
    affectedSkillIds: ["skl_loto"],
    affectedSiteId: "site_plant_a",
    affectedDepartmentId: "dept_maintenance",
    involvedUserIds: ["usr_lrn_a_pkg_1"],
    incidentWorkContext: "LOTO",
    recommendedAction: "individual_retraining",
    recommendedActionReason:
      "Marcus Johnson's LOTO certification should be suspended until incident-specific retraining is completed.",
    reportedByUserId: "usr_admin_1",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },

  // 2. HIGH Regulatory Change — OSHA Update (acknowledged)
  {
    id: "sig_002",
    type: "regulatory_change",
    severity: "high",
    status: "acknowledged",
    title: "OSHA 1910.147 Update — Group Lockout Verification",
    description:
      "OSHA has issued a clarification on 1910.147 regarding group lockout/tagout procedures. New requirement: each authorized employee must individually verify zero energy state, even in group lockout scenarios. Effective date: April 1, 2026.",
    occurredAt: daysAgo(7),
    affectedSkillIds: ["skl_loto"],
    regulatoryRef: "OSHA 1910.147",
    effectiveDate: "2026-04-01",
    recommendedAction: "delta_renewal",
    recommendedActionReason:
      "All workers with LOTO certification should complete updated training before the April 1, 2026 effective date.",
    acknowledgedByUserId: "usr_admin_1",
    acknowledgedAt: daysAgo(6),
    reportedByUserId: "usr_admin_1",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },

  // 3. MEDIUM Near Miss — Forklift/Pedestrian (open)
  {
    id: "sig_003",
    type: "near_miss",
    severity: "medium",
    status: "open",
    title: "Forklift/Pedestrian Near-Miss — Warehouse B Loading Dock",
    description:
      "Forklift operator turning corner at loading dock entrance nearly struck pedestrian worker. Contributing factors: obstructed sightline due to stacked pallets, no horn sounded at intersection. No injury.",
    occurredAt: daysAgo(4),
    affectedSkillIds: ["skl_forklift"],
    affectedSiteId: "site_plant_a",
    affectedDepartmentId: "dept_warehouse",
    recommendedAction: "micro_lesson",
    recommendedActionReason:
      "A short awareness briefing on intersection safety and horn protocols is recommended for all warehouse forklift operators.",
    reportedByUserId: "usr_mgr_a_wh",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },

  // 4. MEDIUM Source Update — SOP Revision (open)
  {
    id: "sig_004",
    type: "source_update",
    severity: "medium",
    status: "open",
    title: "Lockout/Tagout Standard Operating Procedure Updated to v3.2",
    description:
      "LOTO SOP revised to include new group lockout verification steps and updated energy isolation point maps for recently installed equipment.",
    occurredAt: daysAgo(5),
    affectedSkillIds: ["skl_loto"],
    sourceId: "lib_002",
    previousVersion: 2,
    newVersion: 3,
    recommendedAction: "content_review",
    recommendedActionReason:
      "Training content generated from the previous LOTO SOP version may contain outdated procedures. Review recommended.",
    reportedByUserId: "usr_admin_1",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },

  // 5. LOW Assessment Anomaly (resolved)
  {
    id: "sig_005",
    type: "assessment_anomaly",
    severity: "low",
    status: "resolved",
    title: "Confined Space Assessment Failure Rate Increase",
    description:
      "Confined space certification assessment failure rate increased from 12% to 28% over the past quarter. May indicate content gaps or unclear assessment questions.",
    occurredAt: daysAgo(21),
    affectedSkillIds: ["skl_confined_space"],
    recommendedAction: "content_review",
    recommendedActionReason:
      "Assessment failure rates suggest training content may need updating.",
    resolvedAt: daysAgo(7),
    resolutionNotes:
      "Assessment question #4 reworded for clarity. Two training slides updated with better diagrams.",
    reportedByUserId: "usr_admin_1",
    createdAt: daysAgo(21),
    updatedAt: daysAgo(7),
  },

  // 6. HIGH Process Change (open)
  {
    id: "sig_006",
    type: "process_change",
    severity: "high",
    status: "open",
    title: "New Chemical Added to Facility — Updated HazCom Required",
    description:
      "Chemical X (industrial solvent) has been added to the Plant A chemical inventory. Safety Data Sheet uploaded. All employees handling or working near this chemical need updated Hazardous Materials training.",
    occurredAt: daysAgo(3),
    affectedSkillIds: ["skl_hazmat"],
    affectedSiteId: "site_plant_a",
    recommendedAction: "corrective_training",
    recommendedActionReason:
      "All employees at Plant A with HazMat handling duties should complete updated chemical safety training.",
    reportedByUserId: "usr_admin_1",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

// ============================================================================
// SEED CONTENT CURRENCY RECORDS
// ============================================================================

export const seedContentCurrencies: ContentCurrency[] = [
  {
    id: "cur_obp_safety_manager",
    artifactId: "obp_safety_manager",
    artifactType: "onboarding_path",
    currentScore: 95,
    status: "current",
    lastEvaluatedAt: now,
    lastRefreshedAt: daysAgo(6),
    activeSignals: [],
    sourceVersionsAtGeneration: [
      { sourceId: "lib_002", sourceTitle: "Lockout/Tagout SOP", versionAtGeneration: 1, currentVersion: 1, isOutdated: false },
      { sourceId: "lib_005", sourceTitle: "Company Safety Handbook", versionAtGeneration: 1, currentVersion: 1, isOutdated: false },
    ],
    createdAt: daysAgo(6),
    updatedAt: now,
  },
  {
    id: "cur_obp_maint_hvac_draft",
    artifactId: "obp_maint_hvac_draft",
    artifactType: "onboarding_path",
    currentScore: 58,
    status: "stale",
    lastEvaluatedAt: now,
    activeSignals: [
      { signalId: "sig_001", signalType: "incident", impact: 25, appliedAt: daysAgo(2) },
      { signalId: "sig_002", signalType: "regulatory_change", impact: 12, appliedAt: daysAgo(7) },
      { signalId: "sig_004", signalType: "source_update", impact: 5, appliedAt: daysAgo(5) },
    ],
    sourceVersionsAtGeneration: [
      { sourceId: "lib_002", sourceTitle: "Lockout/Tagout SOP", versionAtGeneration: 1, currentVersion: 3, isOutdated: true },
      { sourceId: "lib_005", sourceTitle: "Company Safety Handbook", versionAtGeneration: 1, currentVersion: 1, isOutdated: false },
    ],
    createdAt: daysAgo(2),
    updatedAt: now,
  },
];
