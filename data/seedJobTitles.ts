// Seed data: Job Titles with skill requirements
import type { JobTitle } from "@/types";

const now = new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const seedJobTitles: JobTitle[] = [
  // ─── Maintenance Technician - HVAC ─────────────────────────────────────────
  {
    id: "jt_maint_hvac",
    name: "Maintenance Technician - HVAC",
    department: "Maintenance",
    site: "Plant A",
    description:
      "Responsible for preventive and corrective maintenance of HVAC systems, including air handlers, chillers, and refrigeration units. Performs lockout/tagout, confined space entry, and equipment inspections.",
    requiredSkills: [
      { skillId: "skl_loto", required: true, priority: "critical", targetTimelineDays: 7, notes: "Required before any solo maintenance work" },
      { skillId: "skl_confined_space", required: true, priority: "critical", targetTimelineDays: 7, notes: "Required for AHU and ductwork access" },
      { skillId: "skl_forklift", required: true, priority: "high", targetTimelineDays: 21 },
      { skillId: "skl_hvac_basic", required: true, priority: "high", targetTimelineDays: 30, notes: "Core competency for the role" },
      { skillId: "skl_fall_protection", required: true, priority: "high", targetTimelineDays: 14, notes: "Rooftop unit access" },
      { skillId: "skl_electrical_basic", required: true, priority: "high", targetTimelineDays: 21 },
      { skillId: "skl_hazmat", required: true, priority: "medium", targetTimelineDays: 30 },
      { skillId: "skl_first_aid", required: true, priority: "medium", targetTimelineDays: 30 },
    ],
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },

  // ─── Maintenance Technician - Electrical ───────────────────────────────────
  {
    id: "jt_maint_electrical",
    name: "Maintenance Technician - Electrical",
    department: "Maintenance",
    site: "Plant A",
    description:
      "Performs electrical maintenance, troubleshooting, and repair of industrial control systems, motors, and power distribution. Requires strong lockout/tagout discipline and electrical safety knowledge.",
    requiredSkills: [
      { skillId: "skl_loto", required: true, priority: "critical", targetTimelineDays: 7, notes: "Mandatory before touching any electrical system" },
      { skillId: "skl_electrical_basic", required: true, priority: "critical", targetTimelineDays: 7, notes: "Core competency — must demonstrate before solo work" },
      { skillId: "skl_confined_space", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_fall_protection", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_first_aid", required: true, priority: "medium", targetTimelineDays: 30 },
      { skillId: "skl_hazmat", required: true, priority: "medium", targetTimelineDays: 30 },
    ],
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },

  // ─── Safety Manager ────────────────────────────────────────────────────────
  {
    id: "jt_safety_manager",
    name: "Safety Manager",
    department: "EHS",
    site: "All Sites",
    description:
      "Oversees safety programs, conducts audits, manages OSHA compliance, and leads incident investigations. Must hold all major safety certifications to credibly train and audit others.",
    requiredSkills: [
      { skillId: "skl_loto", required: true, priority: "critical", targetTimelineDays: 7 },
      { skillId: "skl_confined_space", required: true, priority: "critical", targetTimelineDays: 7 },
      { skillId: "skl_hazmat", required: true, priority: "critical", targetTimelineDays: 7 },
      { skillId: "skl_fall_protection", required: true, priority: "critical", targetTimelineDays: 7 },
      { skillId: "skl_first_aid", required: true, priority: "critical", targetTimelineDays: 7 },
    ],
    onboardingPathId: "obp_safety_manager",
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },

  // ─── Forklift Operator ─────────────────────────────────────────────────────
  {
    id: "jt_forklift_operator",
    name: "Forklift Operator",
    department: "Warehouse",
    site: "Plant A",
    description:
      "Operates powered industrial trucks to move materials in warehouse and production areas. Responsible for pre-shift inspections, safe load handling, and pedestrian awareness.",
    requiredSkills: [
      { skillId: "skl_forklift", required: true, priority: "critical", targetTimelineDays: 3, notes: "Cannot operate equipment without certification" },
      { skillId: "skl_loto", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_hazmat", required: true, priority: "medium", targetTimelineDays: 30 },
      { skillId: "skl_first_aid", required: true, priority: "medium", targetTimelineDays: 30 },
    ],
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },

  // ─── Production Line Lead ──────────────────────────────────────────────────
  {
    id: "jt_prod_line_lead",
    name: "Production Line Lead",
    department: "Operations",
    site: "Plant A",
    description:
      "Supervises production line workers, ensures quality standards, coordinates with maintenance for equipment issues, and enforces safety procedures on the floor.",
    requiredSkills: [
      { skillId: "skl_loto", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_gmp", required: true, priority: "high", targetTimelineDays: 14, notes: "Quality compliance for production" },
      { skillId: "skl_first_aid", required: true, priority: "medium", targetTimelineDays: 30 },
      { skillId: "skl_forklift", required: false, priority: "low", targetTimelineDays: 60, notes: "Recommended — assists with material movement" },
    ],
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },

  // ─── Facilities Technician ─────────────────────────────────────────────────
  {
    id: "jt_facilities_tech",
    name: "Facilities Technician",
    department: "Facilities",
    site: "All Sites",
    description:
      "Maintains building systems including plumbing, electrical, HVAC, and general repairs. Responds to facility work orders and supports capital improvement projects.",
    requiredSkills: [
      { skillId: "skl_loto", required: true, priority: "critical", targetTimelineDays: 7 },
      { skillId: "skl_electrical_basic", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_plumbing", required: true, priority: "high", targetTimelineDays: 21 },
      { skillId: "skl_fall_protection", required: true, priority: "high", targetTimelineDays: 14 },
      { skillId: "skl_first_aid", required: true, priority: "medium", targetTimelineDays: 30 },
    ],
    active: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },
];
