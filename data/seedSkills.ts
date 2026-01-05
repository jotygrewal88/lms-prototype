// Phase II — 1M.1: Skills Tagging Seed Data
import { Skill } from "@/types";

function timestamp(): string {
  return new Date().toISOString();
}

export const seedSkills: Skill[] = [
  // Safety Category
  {
    id: "skl_001",
    name: "Lockout/Tagout",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_004",
    name: "First Aid",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_008",
    name: "Personal Protective Equipment",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_009",
    name: "Ergonomics",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_010",
    name: "Electrical Safety",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  
  // Equipment Category
  {
    id: "skl_002",
    name: "Forklift Safety",
    category: "Equipment",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_011",
    name: "Heavy Machinery",
    category: "Equipment",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_012",
    name: "Power Tools",
    category: "Equipment",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  
  // Compliance Category
  {
    id: "skl_003",
    name: "Hazard Communication",
    category: "Compliance",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_006",
    name: "OSHA Compliance",
    category: "Compliance",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_013",
    name: "Environmental Regulations",
    category: "Compliance",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_014",
    name: "Quality Standards",
    category: "Compliance",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  
  // Emergency Category
  {
    id: "skl_005",
    name: "Fire Safety",
    category: "Emergency",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_007",
    name: "Emergency Response",
    category: "Emergency",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_015",
    name: "Evacuation Procedures",
    category: "Emergency",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_016",
    name: "CPR & AED",
    category: "Emergency",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  
  // Leadership Category
  {
    id: "skl_017",
    name: "Team Leadership",
    category: "Leadership",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_018",
    name: "Conflict Resolution",
    category: "Leadership",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_019",
    name: "Performance Management",
    category: "Leadership",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  
  // Quality Category
  {
    id: "skl_020",
    name: "Quality Inspection",
    category: "Quality",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_021",
    name: "Defect Identification",
    category: "Quality",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_022",
    name: "Documentation",
    category: "Quality",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];


