// Phase II — 1M.1: Skills Tagging Seed Data
import { Skill } from "@/types";

function timestamp(): string {
  return new Date().toISOString();
}

export const seedSkills: Skill[] = [
  {
    id: "skl_001",
    name: "Lockout/Tagout",
    category: "Safety",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_002",
    name: "Forklift Safety",
    category: "Equipment",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: "skl_003",
    name: "Hazard Communication",
    category: "Compliance",
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
    id: "skl_005",
    name: "Fire Safety",
    category: "Emergency",
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
    id: "skl_007",
    name: "Emergency Response",
    category: "Emergency",
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
];


