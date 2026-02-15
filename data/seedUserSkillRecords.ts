// Seed data for UserSkillRecords — realistic entries for 10 users
// Distribution: 3 expired, 5 expiring within 30 days, ~12 active/valid
// Today's date reference: 2026-02-11

import type { UserSkillRecord } from "@/types";

export const seedUserSkillRecords: UserSkillRecord[] = [
  // ============================================================================
  // EXPIRED CERTIFICATIONS (3) — expiryDate in the past
  // ============================================================================

  // usr_lrn_a_pkg_1 — LOTO expired Jan 15, 2026
  {
    id: "uskr_001",
    userId: "usr_lrn_a_pkg_1",
    skillId: "skl_loto",
    status: "expired",
    achievedDate: "2025-01-15",
    expiryDate: "2026-01-15",
    renewalDate: "2025-12-16",
    evidenceType: "training",
    evidenceId: "tng_003",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-01-15T10:00:00.000Z",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
  },

  // usr_lrn_b_wh_1 — Fall Protection expired Dec 20, 2025
  {
    id: "uskr_002",
    userId: "usr_lrn_b_wh_1",
    skillId: "skl_fall_protection",
    status: "expired",
    achievedDate: "2024-12-20",
    expiryDate: "2025-12-20",
    renewalDate: "2025-11-20",
    evidenceType: "training",
    evidenceId: "tng_007",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2024-12-20T14:30:00.000Z",
    createdAt: "2024-12-20T14:30:00.000Z",
    updatedAt: "2024-12-20T14:30:00.000Z",
  },

  // usr_lrn_b_maint_1 — Hazmat expired Jan 31, 2026
  {
    id: "uskr_003",
    userId: "usr_lrn_b_maint_1",
    skillId: "skl_hazmat",
    status: "expired",
    achievedDate: "2025-01-31",
    expiryDate: "2026-01-31",
    renewalDate: "2026-01-01",
    evidenceType: "training",
    evidenceId: "tng_005",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-01-31T09:00:00.000Z",
    createdAt: "2025-01-31T09:00:00.000Z",
    updatedAt: "2025-01-31T09:00:00.000Z",
  },

  // ============================================================================
  // EXPIRING WITHIN 30 DAYS (5) — expiryDate between Feb 12 and Mar 13, 2026
  // ============================================================================

  // usr_lrn_a_pkg_2 — Confined Space expires Feb 25, 2026
  {
    id: "uskr_004",
    userId: "usr_lrn_a_pkg_2",
    skillId: "skl_confined_space",
    status: "active",
    achievedDate: "2025-02-25",
    expiryDate: "2026-02-25",
    renewalDate: "2026-01-26",
    evidenceType: "training",
    evidenceId: "tng_006",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-02-25T11:00:00.000Z",
    createdAt: "2025-02-25T11:00:00.000Z",
    updatedAt: "2025-02-25T11:00:00.000Z",
  },

  // usr_lrn_a_wh_1 — First Aid expires Mar 5, 2026
  {
    id: "uskr_005",
    userId: "usr_lrn_a_wh_1",
    skillId: "skl_first_aid",
    status: "active",
    achievedDate: "2024-03-05",
    expiryDate: "2026-03-05",
    renewalDate: "2026-02-03",
    evidenceType: "training",
    evidenceId: "tng_008",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2024-03-05T08:30:00.000Z",
    createdAt: "2024-03-05T08:30:00.000Z",
    updatedAt: "2024-03-05T08:30:00.000Z",
  },

  // usr_lrn_a_maint_1 — LOTO expires Feb 18, 2026
  {
    id: "uskr_006",
    userId: "usr_lrn_a_maint_1",
    skillId: "skl_loto",
    status: "active",
    achievedDate: "2025-02-18",
    expiryDate: "2026-02-18",
    renewalDate: "2026-01-19",
    evidenceType: "training",
    evidenceId: "tng_003",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-02-18T13:00:00.000Z",
    createdAt: "2025-02-18T13:00:00.000Z",
    updatedAt: "2025-02-18T13:00:00.000Z",
  },

  // usr_star_1 — Fall Protection expires Mar 10, 2026
  {
    id: "uskr_007",
    userId: "usr_star_1",
    skillId: "skl_fall_protection",
    status: "active",
    achievedDate: "2025-03-10",
    expiryDate: "2026-03-10",
    renewalDate: "2026-02-08",
    evidenceType: "training",
    evidenceId: "tng_007",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2025-03-10T10:00:00.000Z",
    createdAt: "2025-03-10T10:00:00.000Z",
    updatedAt: "2025-03-10T10:00:00.000Z",
  },

  // usr_mgr_a — Hazmat expires Mar 1, 2026
  {
    id: "uskr_008",
    userId: "usr_mgr_a",
    skillId: "skl_hazmat",
    status: "active",
    achievedDate: "2025-03-01",
    expiryDate: "2026-03-01",
    renewalDate: "2026-01-30",
    evidenceType: "manual",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-03-01T09:00:00.000Z",
    notes: "Completed external vendor training — certificate on file",
    createdAt: "2025-03-01T09:00:00.000Z",
    updatedAt: "2025-03-01T09:00:00.000Z",
  },

  // ============================================================================
  // ACTIVE & VALID — certifications with future expiry (7)
  // ============================================================================

  // usr_lrn_a_pkg_1 — Forklift (3-year cert) expires 2028
  {
    id: "uskr_009",
    userId: "usr_lrn_a_pkg_1",
    skillId: "skl_forklift",
    status: "active",
    achievedDate: "2025-06-10",
    expiryDate: "2028-06-10",
    renewalDate: "2028-05-11",
    evidenceType: "training",
    evidenceId: "tng_001",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-06-10T10:00:00.000Z",
    createdAt: "2025-06-10T10:00:00.000Z",
    updatedAt: "2025-06-10T10:00:00.000Z",
  },

  // usr_lrn_a_pkg_2 — First Aid (2-year cert) expires 2027
  {
    id: "uskr_010",
    userId: "usr_lrn_a_pkg_2",
    skillId: "skl_first_aid",
    status: "active",
    achievedDate: "2025-08-20",
    expiryDate: "2027-08-20",
    renewalDate: "2027-07-21",
    evidenceType: "training",
    evidenceId: "tng_008",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2025-08-20T15:00:00.000Z",
    createdAt: "2025-08-20T15:00:00.000Z",
    updatedAt: "2025-08-20T15:00:00.000Z",
  },

  // usr_lrn_b_maint_2 — Confined Space (1-year cert) expires Dec 2026
  {
    id: "uskr_011",
    userId: "usr_lrn_b_maint_2",
    skillId: "skl_confined_space",
    status: "active",
    achievedDate: "2025-12-01",
    expiryDate: "2026-12-01",
    renewalDate: "2026-11-01",
    evidenceType: "training",
    evidenceId: "tng_006",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-12-01T11:00:00.000Z",
    createdAt: "2025-12-01T11:00:00.000Z",
    updatedAt: "2025-12-01T11:00:00.000Z",
  },

  // usr_lrn_b_wh_1 — GMP Compliance (3-year cert) expires 2028
  {
    id: "uskr_012",
    userId: "usr_lrn_b_wh_1",
    skillId: "skl_gmp",
    status: "active",
    achievedDate: "2025-09-15",
    expiryDate: "2028-09-15",
    renewalDate: "2028-08-16",
    evidenceType: "course",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-09-15T16:00:00.000Z",
    createdAt: "2025-09-15T16:00:00.000Z",
    updatedAt: "2025-09-15T16:00:00.000Z",
  },

  // usr_mgr_b — Trainer Certified (2-year cert) expires 2027
  {
    id: "uskr_013",
    userId: "usr_mgr_b",
    skillId: "skl_training",
    status: "active",
    achievedDate: "2025-07-01",
    expiryDate: "2027-07-01",
    renewalDate: "2027-06-01",
    evidenceType: "manual",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-07-01T09:00:00.000Z",
    notes: "Train-the-trainer program completed externally",
    createdAt: "2025-07-01T09:00:00.000Z",
    updatedAt: "2025-07-01T09:00:00.000Z",
  },

  // usr_star_1 — Forklift (3-year cert) expires 2028
  {
    id: "uskr_014",
    userId: "usr_star_1",
    skillId: "skl_forklift",
    status: "active",
    achievedDate: "2025-10-22",
    expiryDate: "2028-10-22",
    renewalDate: "2028-09-22",
    evidenceType: "training",
    evidenceId: "tng_001",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2025-10-22T14:00:00.000Z",
    assessmentScore: 95,
    createdAt: "2025-10-22T14:00:00.000Z",
    updatedAt: "2025-10-22T14:00:00.000Z",
  },

  // usr_lrn_a_wh_1 — LOTO (1-year cert) expires Nov 2026
  {
    id: "uskr_015",
    userId: "usr_lrn_a_wh_1",
    skillId: "skl_loto",
    status: "active",
    achievedDate: "2025-11-10",
    expiryDate: "2026-11-10",
    renewalDate: "2026-10-11",
    evidenceType: "training",
    evidenceId: "tng_003",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-11-10T10:30:00.000Z",
    createdAt: "2025-11-10T10:30:00.000Z",
    updatedAt: "2025-11-10T10:30:00.000Z",
  },

  // ============================================================================
  // ACTIVE SKILLS — no expiry date (5)
  // ============================================================================

  // usr_lrn_a_maint_1 — HVAC Maintenance
  {
    id: "uskr_016",
    userId: "usr_lrn_a_maint_1",
    skillId: "skl_hvac_basic",
    status: "active",
    achievedDate: "2025-04-12",
    evidenceType: "course",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2025-04-12T09:00:00.000Z",
    level: 1,
    createdAt: "2025-04-12T09:00:00.000Z",
    updatedAt: "2025-04-12T09:00:00.000Z",
  },

  // usr_lrn_b_maint_1 — Welding
  {
    id: "uskr_017",
    userId: "usr_lrn_b_maint_1",
    skillId: "skl_welding",
    status: "active",
    achievedDate: "2025-05-20",
    evidenceType: "manual",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-05-20T11:00:00.000Z",
    level: 2,
    notes: "Passed hands-on welding assessment — MIG & TIG",
    createdAt: "2025-05-20T11:00:00.000Z",
    updatedAt: "2025-05-20T11:00:00.000Z",
  },

  // usr_lrn_b_maint_2 — Blueprint Reading
  {
    id: "uskr_018",
    userId: "usr_lrn_b_maint_2",
    skillId: "skl_blueprint",
    status: "active",
    achievedDate: "2025-07-08",
    evidenceType: "course",
    verifiedByUserId: "usr_mgr_a",
    verificationDate: "2025-07-08T14:00:00.000Z",
    assessmentScore: 88,
    createdAt: "2025-07-08T14:00:00.000Z",
    updatedAt: "2025-07-08T14:00:00.000Z",
  },

  // usr_star_1 — Equipment Troubleshooting
  {
    id: "uskr_019",
    userId: "usr_star_1",
    skillId: "skl_troubleshooting",
    status: "active",
    achievedDate: "2025-09-01",
    evidenceType: "manual",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-09-01T10:00:00.000Z",
    level: 3,
    notes: "Demonstrated advanced diagnostic capability during equipment audit",
    createdAt: "2025-09-01T10:00:00.000Z",
    updatedAt: "2025-09-01T10:00:00.000Z",
  },

  // usr_mgr_a — Leadership
  {
    id: "uskr_020",
    userId: "usr_mgr_a",
    skillId: "skl_leadership",
    status: "active",
    achievedDate: "2025-03-15",
    evidenceType: "course",
    verifiedByUserId: "usr_admin_1",
    verificationDate: "2025-03-15T16:00:00.000Z",
    createdAt: "2025-03-15T16:00:00.000Z",
    updatedAt: "2025-03-15T16:00:00.000Z",
  },
];
