// Seed data for skill requirements — scope-based and work-context-based

import type { RoleSkillRequirement, WorkContextSkillRequirement } from "@/types";

// ============================================================================
// SCOPE-BASED REQUIREMENTS (by site, department, job title)
// ============================================================================
export const seedRoleSkillRequirements: RoleSkillRequirement[] = [
  // All sites — everyone needs First Aid
  {
    id: "rsr_seed_001",
    skillId: "skl_first_aid",
    required: true,
    enforcementMode: "warn",
    gracePeriodDays: 90,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  // All warehouse departments need Forklift certification
  {
    id: "rsr_seed_002",
    departmentId: "dept_a_warehouse",
    skillId: "skl_forklift",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "rsr_seed_003",
    departmentId: "dept_b_warehouse",
    skillId: "skl_forklift",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  // All maintenance departments need LOTO
  {
    id: "rsr_seed_004",
    departmentId: "dept_a_maintenance",
    skillId: "skl_loto",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-15T00:00:00.000Z",
    updatedAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "rsr_seed_005",
    departmentId: "dept_b_maintenance",
    skillId: "skl_loto",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-15T00:00:00.000Z",
    updatedAt: "2025-01-15T00:00:00.000Z",
  },

  // Plant B maintenance — Confined Space required
  {
    id: "rsr_seed_006",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    skillId: "skl_confined_space",
    required: true,
    enforcementMode: "warn",
    gracePeriodDays: 60,
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // Electricians need Basic Electrical
  {
    id: "rsr_seed_007",
    jobTitle: "Electrician",
    skillId: "skl_electrical_basic",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // HVAC Technicians need HVAC Maintenance
  {
    id: "rsr_seed_008",
    jobTitle: "HVAC Technician",
    skillId: "skl_hvac_basic",
    required: true,
    enforcementMode: "warn",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // Welders need Welding skill
  {
    id: "rsr_seed_009",
    jobTitle: "Welder",
    skillId: "skl_welding",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // Plant A Packaging — GMP recommended for all
  {
    id: "rsr_seed_010",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    skillId: "skl_gmp",
    required: false,
    enforcementMode: "none",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z",
  },

  // Quality Inspectors need Quality Inspector skill
  {
    id: "rsr_seed_011",
    jobTitle: "Quality Inspector",
    skillId: "skl_quality_inspector",
    required: true,
    enforcementMode: "warn",
    gracePeriodDays: 30,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z",
  },

  // Site Managers — Leadership recommended
  {
    id: "rsr_seed_012",
    jobTitle: "Site Manager",
    skillId: "skl_leadership",
    required: false,
    enforcementMode: "none",
    createdAt: "2025-03-15T00:00:00.000Z",
    updatedAt: "2025-03-15T00:00:00.000Z",
  },
];

// ============================================================================
// WORK CONTEXT REQUIREMENTS
// ============================================================================
export const seedWorkContextSkillRequirements: WorkContextSkillRequirement[] = [
  // LOTO work orders require LOTO cert
  {
    id: "wsr_seed_001",
    contextType: "work_order_type",
    contextKey: "LOTO",
    skillId: "skl_loto",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  // Confined space permits require Confined Space cert
  {
    id: "wsr_seed_002",
    contextType: "permit_type",
    contextKey: "Confined Space Entry",
    skillId: "skl_confined_space",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  // Hot work permits require Welding skill
  {
    id: "wsr_seed_003",
    contextType: "permit_type",
    contextKey: "Hot Work",
    skillId: "skl_welding",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-01-15T00:00:00.000Z",
    updatedAt: "2025-01-15T00:00:00.000Z",
  },

  // Forklift assets require Forklift certification
  {
    id: "wsr_seed_004",
    contextType: "asset_type",
    contextKey: "Forklift",
    skillId: "skl_forklift",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // HVAC assets require HVAC Maintenance
  {
    id: "wsr_seed_005",
    contextType: "asset_type",
    contextKey: "HVAC Unit",
    skillId: "skl_hvac_basic",
    required: true,
    enforcementMode: "warn",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },

  // Working at height inspections require Fall Protection
  {
    id: "wsr_seed_006",
    contextType: "inspection_type",
    contextKey: "Working at Height",
    skillId: "skl_fall_protection",
    required: true,
    enforcementMode: "warn",
    createdAt: "2025-02-15T00:00:00.000Z",
    updatedAt: "2025-02-15T00:00:00.000Z",
  },

  // Hazmat work orders require Hazmat cert
  {
    id: "wsr_seed_007",
    contextType: "work_order_type",
    contextKey: "Hazmat Handling",
    skillId: "skl_hazmat",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z",
  },

  // Electrical work orders require Basic Electrical
  {
    id: "wsr_seed_008",
    contextType: "work_order_type",
    contextKey: "Electrical",
    skillId: "skl_electrical_basic",
    required: true,
    enforcementMode: "block",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z",
  },
];
