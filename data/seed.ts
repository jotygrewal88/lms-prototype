// Phase I Epic 1 & 2: Seed data for UpKeep LMS demo
import { Organization, Site, Department, User, Training, TrainingCompletion } from "@/types";
import { today, addDays, calculateOverdueDays } from "@/lib/utils";

export const organization: Organization = {
  id: "org_upkeep",
  name: "UpKeep Demo Co",
  logo: "https://via.placeholder.com/150x50/2563EB/FFFFFF?text=UpKeep",
  primaryColor: "#2563EB",
};

export const sites: Site[] = [
  {
    id: "site_a",
    name: "Plant A",
    organizationId: "org_upkeep",
  },
  {
    id: "site_b",
    name: "Plant B",
    organizationId: "org_upkeep",
  },
];

export const departments: Department[] = [
  // Plant A departments
  {
    id: "dept_a_warehouse",
    name: "Warehouse",
    siteId: "site_a",
  },
  {
    id: "dept_a_packaging",
    name: "Packaging",
    siteId: "site_a",
  },
  {
    id: "dept_a_maintenance",
    name: "Maintenance",
    siteId: "site_a",
  },
  // Plant B departments
  {
    id: "dept_b_warehouse",
    name: "Warehouse",
    siteId: "site_b",
  },
  {
    id: "dept_b_packaging",
    name: "Packaging",
    siteId: "site_b",
  },
  {
    id: "dept_b_maintenance",
    name: "Maintenance",
    siteId: "site_b",
  },
];

export const users: User[] = [
  // Admin (org-wide)
  {
    id: "usr_admin_1",
    name: "Sarah Admin",
    email: "sarah.admin@upkeepdemo.co",
    role: "ADMIN",
  },
  // Managers
  {
    id: "usr_mgr_a",
    name: "Mike Manager",
    email: "mike.manager@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_a",
  },
  {
    id: "usr_mgr_b",
    name: "Jennifer Manager",
    email: "jen.manager@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_b",
  },
  // Learners - Plant A
  {
    id: "usr_lrn_1",
    name: "Tom Learner",
    email: "tom.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_warehouse",
  },
  {
    id: "usr_lrn_2",
    name: "Lisa Learner",
    email: "lisa.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
  },
  {
    id: "usr_lrn_3",
    name: "Carlos Learner",
    email: "carlos.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_maintenance",
  },
  // Learners - Plant B
  {
    id: "usr_lrn_4",
    name: "Emma Learner",
    email: "emma.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_warehouse",
  },
  {
    id: "usr_lrn_5",
    name: "David Learner",
    email: "david.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_packaging",
  },
  {
    id: "usr_lrn_6",
    name: "Nina Learner",
    email: "nina.learner@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
  },
];

// Phase I Epic 2: Trainings
export const trainings: Training[] = [
  {
    id: "tng_001",
    title: "Forklift Safety",
    description: "Comprehensive forklift operation and safety training",
    standardRef: "OSHA 1910.178",
    assignment: {
      roles: ["LEARNER"],
      sites: ["site_a"],
    },
    retrainIntervalDays: 365,
    ownerManagerId: "usr_mgr_a",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tng_002",
    title: "PPE Basics",
    description: "Personal Protective Equipment usage and maintenance",
    standardRef: "OSHA 1910.132",
    assignment: {
      roles: ["LEARNER"],
    },
    retrainIntervalDays: 365,
    ownerManagerId: "usr_admin_1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tng_003",
    title: "Lockout/Tagout",
    description: "Energy control procedures for equipment maintenance",
    standardRef: "OSHA 1910.147",
    assignment: {
      departments: ["dept_a_maintenance", "dept_b_maintenance"],
    },
    retrainIntervalDays: 730,
    ownerManagerId: "usr_admin_1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tng_004",
    title: "Fire Safety",
    description: "Fire prevention, evacuation procedures, and extinguisher use",
    standardRef: "OSHA 1910 Subpart L",
    assignment: {
      sites: ["site_b"],
    },
    retrainIntervalDays: 365,
    ownerManagerId: "usr_mgr_b",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// Phase I Epic 2: Training Completions (mixed statuses for demo)
export const completions: TrainingCompletion[] = [
  // Forklift Safety (tng_001) - Plant A Learners
  {
    id: "cmp_001",
    trainingId: "tng_001",
    userId: "usr_lrn_1", // Tom - Warehouse
    status: "COMPLETED",
    dueAt: addDays(today(), -60),
    completedAt: addDays(today(), -65),
    expiresAt: addDays(addDays(today(), -65), 365),
    notes: "Completed with perfect score",
  },
  {
    id: "cmp_002",
    trainingId: "tng_001",
    userId: "usr_lrn_2", // Lisa - Packaging
    status: "ASSIGNED",
    dueAt: addDays(today(), 5),
  },
  {
    id: "cmp_003",
    trainingId: "tng_001",
    userId: "usr_lrn_3", // Carlos - Maintenance
    status: "OVERDUE",
    dueAt: addDays(today(), -10),
    overdueDays: 10,
  },
  
  // PPE Basics (tng_002) - All Learners
  {
    id: "cmp_004",
    trainingId: "tng_002",
    userId: "usr_lrn_1",
    status: "COMPLETED",
    dueAt: addDays(today(), -30),
    completedAt: addDays(today(), -35),
    expiresAt: addDays(addDays(today(), -35), 365),
    proofUrl: "https://example.com/cert/ppe-001.pdf",
  },
  {
    id: "cmp_005",
    trainingId: "tng_002",
    userId: "usr_lrn_2",
    status: "COMPLETED",
    dueAt: addDays(today(), -25),
    completedAt: addDays(today(), -28),
    expiresAt: addDays(addDays(today(), -28), 365),
  },
  {
    id: "cmp_006",
    trainingId: "tng_002",
    userId: "usr_lrn_3",
    status: "ASSIGNED",
    dueAt: addDays(today(), 3),
  },
  {
    id: "cmp_007",
    trainingId: "tng_002",
    userId: "usr_lrn_4",
    status: "OVERDUE",
    dueAt: addDays(today(), -5),
    overdueDays: 5,
  },
  {
    id: "cmp_008",
    trainingId: "tng_002",
    userId: "usr_lrn_5",
    status: "ASSIGNED",
    dueAt: addDays(today(), 7),
  },
  {
    id: "cmp_009",
    trainingId: "tng_002",
    userId: "usr_lrn_6",
    status: "OVERDUE",
    dueAt: addDays(today(), -15),
    overdueDays: 15,
  },
  
  // Lockout/Tagout (tng_003) - Maintenance departments only
  {
    id: "cmp_010",
    trainingId: "tng_003",
    userId: "usr_lrn_3", // Carlos - Plant A Maintenance
    status: "COMPLETED",
    dueAt: addDays(today(), -90),
    completedAt: addDays(today(), -95),
    expiresAt: addDays(addDays(today(), -95), 730),
    notes: "Certified on all equipment types",
    proofUrl: "https://example.com/cert/loto-001.pdf",
  },
  {
    id: "cmp_011",
    trainingId: "tng_003",
    userId: "usr_lrn_6", // Nina - Plant B Maintenance
    status: "ASSIGNED",
    dueAt: addDays(today(), 14),
  },
  
  // Fire Safety (tng_004) - Plant B all users
  {
    id: "cmp_012",
    trainingId: "tng_004",
    userId: "usr_mgr_b", // Jennifer Manager
    status: "COMPLETED",
    dueAt: addDays(today(), -20),
    completedAt: addDays(today(), -22),
    expiresAt: addDays(addDays(today(), -22), 365),
  },
  {
    id: "cmp_013",
    trainingId: "tng_004",
    userId: "usr_lrn_4", // Emma - Warehouse
    status: "ASSIGNED",
    dueAt: addDays(today(), 2),
  },
  {
    id: "cmp_014",
    trainingId: "tng_004",
    userId: "usr_lrn_5", // David - Packaging
    status: "OVERDUE",
    dueAt: addDays(today(), -3),
    overdueDays: 3,
  },
  {
    id: "cmp_015",
    trainingId: "tng_004",
    userId: "usr_lrn_6", // Nina - Maintenance
    status: "COMPLETED",
    dueAt: addDays(today(), -45),
    completedAt: addDays(today(), -48),
    expiresAt: addDays(addDays(today(), -48), 365),
    notes: "Completed with fire drill participation",
  },
];

