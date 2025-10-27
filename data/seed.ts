// Phase I Epic 1, 2, 3 & Polish Pack: Seed data for UpKeep LMS demo
import { Organization, Site, Department, User, Training, TrainingCompletion, ReminderRule, NotificationTemplate } from "@/types";
import { today, addDays, calculateOverdueDays } from "@/lib/utils";

export const organization: Organization = {
  id: "org_upkeep",
  name: "UpKeep Demo Co",
  logo: "https://via.placeholder.com/150x50/2563EB/FFFFFF?text=UpKeep",
  primaryColor: "#2563EB",
  settings: {
    timezone: "America/Los_Angeles",
    dateFormat: "YYYY-MM-DD",
  },
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
    firstName: "Sarah",
    lastName: "Admin",
    email: "sarah.admin@upkeepdemo.co",
    role: "ADMIN",
    active: true,
  },
  // Managers - Site-level
  {
    id: "usr_mgr_a",
    firstName: "Mike",
    lastName: "Manager",
    email: "mike.manager@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_a",
    active: true,
  },
  {
    id: "usr_mgr_b",
    firstName: "Jennifer",
    lastName: "Manager",
    email: "jen.manager@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_b",
    active: true,
  },
  // Managers - Department-level
  {
    id: "usr_mgr_a_pkg",
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    active: true,
  },
  {
    id: "usr_mgr_b_maint",
    firstName: "Diego",
    lastName: "Alvarez",
    email: "diego.alvarez@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    active: true,
  },
  {
    id: "usr_mgr_a_wh",
    firstName: "Priya",
    lastName: "Singh",
    email: "priya.singh@upkeepdemo.co",
    role: "MANAGER",
    siteId: "site_a",
    departmentId: "dept_a_warehouse",
    active: true,
  },
  // Learners - Plant A Packaging (6)
  {
    id: "usr_lrn_a_pkg_1",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "marcus.johnson@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  {
    id: "usr_lrn_a_pkg_2",
    firstName: "Aaliyah",
    lastName: "Brown",
    email: "aaliyah.brown@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  {
    id: "usr_lrn_a_pkg_3",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  {
    id: "usr_lrn_a_pkg_4",
    firstName: "Sofia",
    lastName: "Martinez",
    email: "sofia.martinez@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  {
    id: "usr_lrn_a_pkg_5",
    firstName: "Ethan",
    lastName: "Davis",
    email: "ethan.davis@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  {
    id: "usr_lrn_a_pkg_6",
    firstName: "Olivia",
    lastName: "Garcia",
    email: "olivia.garcia@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_packaging",
    managerId: "usr_mgr_a_pkg",
    active: true,
  },
  // Learners - Plant A Warehouse (2)
  {
    id: "usr_lrn_a_wh_1",
    firstName: "Noah",
    lastName: "Rodriguez",
    email: "noah.rodriguez@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_warehouse",
    managerId: "usr_mgr_a_wh",
    active: true,
  },
  {
    id: "usr_lrn_a_wh_2",
    firstName: "Ava",
    lastName: "Lee",
    email: "ava.lee@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_warehouse",
    managerId: "usr_mgr_a_wh",
    active: true,
  },
  // Learners - Plant B Warehouse (3)
  {
    id: "usr_lrn_b_wh_1",
    firstName: "Liam",
    lastName: "Thompson",
    email: "liam.thompson@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_warehouse",
    managerId: "usr_mgr_b",
    active: true,
  },
  {
    id: "usr_lrn_b_wh_2",
    firstName: "Emma",
    lastName: "White",
    email: "emma.white@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_warehouse",
    managerId: "usr_mgr_b",
    active: true,
  },
  {
    id: "usr_lrn_b_wh_3",
    firstName: "Mason",
    lastName: "Harris",
    email: "mason.harris@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_warehouse",
    managerId: "usr_mgr_b",
    active: true,
  },
  // Learners - Plant A Maintenance (1)
  {
    id: "usr_lrn_a_maint_1",
    firstName: "Jackson",
    lastName: "Taylor",
    email: "jackson.taylor@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_a",
    departmentId: "dept_a_maintenance",
    managerId: "usr_mgr_a",
    active: true,
  },
  // Learners - Plant B Maintenance (5)
  {
    id: "usr_lrn_b_maint_1",
    firstName: "Isabella",
    lastName: "Clark",
    email: "isabella.clark@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    managerId: "usr_mgr_b_maint",
    active: true,
  },
  {
    id: "usr_lrn_b_maint_2",
    firstName: "William",
    lastName: "Lewis",
    email: "william.lewis@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    managerId: "usr_mgr_b_maint",
    active: true,
  },
  {
    id: "usr_lrn_b_maint_3",
    firstName: "Charlotte",
    lastName: "Walker",
    email: "charlotte.walker@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    managerId: "usr_mgr_b_maint",
    active: true,
  },
  {
    id: "usr_lrn_b_maint_4",
    firstName: "Benjamin",
    lastName: "Hall",
    email: "benjamin.hall@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    managerId: "usr_mgr_b_maint",
    active: true,
  },
  {
    id: "usr_lrn_b_maint_5",
    firstName: "Amelia",
    lastName: "Young",
    email: "amelia.young@upkeepdemo.co",
    role: "LEARNER",
    siteId: "site_b",
    departmentId: "dept_b_maintenance",
    managerId: "usr_mgr_b_maint",
    active: true,
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
      departments: ["dept_a_packaging", "dept_a_warehouse", "dept_b_packaging", "dept_b_warehouse"],
    },
    retrainIntervalDays: 365,
    ownerManagerId: "usr_mgr_a_wh",
    policyUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178",
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
    policyUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.132",
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
    ownerManagerId: "usr_mgr_b_maint",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tng_004",
    title: "Fire Safety",
    description: "Fire prevention, evacuation procedures, and extinguisher use",
    standardRef: "OSHA 1910 Subpart L",
    assignment: {
      roles: ["LEARNER"],
    },
    retrainIntervalDays: 365,
    ownerManagerId: "usr_admin_1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// Phase I Epic 2: Training Completions (enriched for AI insights)
export const completions: TrainingCompletion[] = [
  // A. PACKAGING @ PLANT A: OVERDUE CLUSTER (Forklift Safety)
  { id: "cmp_pkg_001", trainingId: "tng_001", userId: "usr_lrn_a_pkg_1", status: "OVERDUE", dueAt: addDays(today(), -21), overdueDays: 21, assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_pkg_002", trainingId: "tng_001", userId: "usr_lrn_a_pkg_2", status: "OVERDUE", dueAt: addDays(today(), -18), overdueDays: 18, assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_pkg_003", trainingId: "tng_001", userId: "usr_lrn_a_pkg_3", status: "OVERDUE", dueAt: addDays(today(), -14), overdueDays: 14, assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_pkg_004", trainingId: "tng_001", userId: "usr_lrn_a_pkg_4", status: "OVERDUE", dueAt: addDays(today(), -9), overdueDays: 9, assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_pkg_005", trainingId: "tng_001", userId: "usr_lrn_a_pkg_5", status: "OVERDUE", dueAt: addDays(today(), -5), overdueDays: 5, assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_pkg_006", trainingId: "tng_001", userId: "usr_lrn_a_pkg_6", status: "OVERDUE", dueAt: addDays(today(), -2), overdueDays: 2, assignedManagerId: "usr_mgr_a_pkg" },
  
  // B. PLANT B MAINTENANCE: DUE SOON SURGE (Lockout/Tagout)
  { id: "cmp_loto_001", trainingId: "tng_003", userId: "usr_lrn_b_maint_1", status: "ASSIGNED", dueAt: addDays(today(), 2), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_002", trainingId: "tng_003", userId: "usr_lrn_b_maint_2", status: "ASSIGNED", dueAt: addDays(today(), 3), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_003", trainingId: "tng_003", userId: "usr_lrn_b_maint_3", status: "ASSIGNED", dueAt: addDays(today(), 4), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_004", trainingId: "tng_003", userId: "usr_lrn_b_maint_4", status: "ASSIGNED", dueAt: addDays(today(), 5), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_005", trainingId: "tng_003", userId: "usr_lrn_b_maint_5", status: "ASSIGNED", dueAt: addDays(today(), 6), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_006", trainingId: "tng_003", userId: "usr_lrn_a_maint_1", status: "ASSIGNED", dueAt: addDays(today(), 7), assignedManagerId: "usr_mgr_a" },
  
  // C. LAST 30 DAYS: LATE COMPLETIONS (completed after due date)
  { id: "cmp_late_001", trainingId: "tng_002", userId: "usr_lrn_a_pkg_1", status: "COMPLETED", dueAt: addDays(today(), -20), completedAt: addDays(today(), -17), expiresAt: addDays(addDays(today(), -17), 365), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_late_002", trainingId: "tng_002", userId: "usr_lrn_a_pkg_2", status: "COMPLETED", dueAt: addDays(today(), -18), completedAt: addDays(today(), -14), expiresAt: addDays(addDays(today(), -14), 365), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_late_003", trainingId: "tng_004", userId: "usr_lrn_b_wh_1", status: "COMPLETED", dueAt: addDays(today(), -25), completedAt: addDays(today(), -22), expiresAt: addDays(addDays(today(), -22), 365), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_late_004", trainingId: "tng_004", userId: "usr_lrn_b_wh_2", status: "COMPLETED", dueAt: addDays(today(), -22), completedAt: addDays(today(), -18), expiresAt: addDays(addDays(today(), -18), 365), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_late_005", trainingId: "tng_002", userId: "usr_lrn_a_wh_1", status: "COMPLETED", dueAt: addDays(today(), -15), completedAt: addDays(today(), -12), expiresAt: addDays(addDays(today(), -12), 365), assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_late_006", trainingId: "tng_004", userId: "usr_lrn_a_wh_2", status: "COMPLETED", dueAt: addDays(today(), -28), completedAt: addDays(today(), -23), expiresAt: addDays(addDays(today(), -23), 365), assignedManagerId: "usr_mgr_a_wh" },
  
  // D. RETRAINING WAVE: EXPIRING SOON (expiresAt within next 30 days)
  { id: "cmp_expire_001", trainingId: "tng_001", userId: "usr_lrn_a_wh_1", status: "COMPLETED", dueAt: addDays(today(), -350), completedAt: addDays(today(), -355), expiresAt: addDays(today(), 10), proofUrl: "https://example.com/cert/001.pdf", assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_expire_002", trainingId: "tng_001", userId: "usr_lrn_a_wh_2", status: "COMPLETED", dueAt: addDays(today(), -348), completedAt: addDays(today(), -352), expiresAt: addDays(today(), 13), assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_expire_003", trainingId: "tng_002", userId: "usr_lrn_b_wh_1", status: "COMPLETED", dueAt: addDays(today(), -345), completedAt: addDays(today(), -348), expiresAt: addDays(today(), 17), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_expire_004", trainingId: "tng_002", userId: "usr_lrn_b_wh_2", status: "COMPLETED", dueAt: addDays(today(), -342), completedAt: addDays(today(), -345), expiresAt: addDays(today(), 20), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_expire_005", trainingId: "tng_002", userId: "usr_lrn_b_wh_3", status: "COMPLETED", dueAt: addDays(today(), -340), completedAt: addDays(today(), -343), expiresAt: addDays(today(), 22), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_expire_006", trainingId: "tng_001", userId: "usr_lrn_b_wh_1", status: "COMPLETED", dueAt: addDays(today(), -338), completedAt: addDays(today(), -340), expiresAt: addDays(today(), 25), proofUrl: "https://example.com/cert/006.pdf", assignedManagerId: "usr_mgr_b" },
  { id: "cmp_expire_007", trainingId: "tng_001", userId: "usr_lrn_b_wh_2", status: "COMPLETED", dueAt: addDays(today(), -337), completedAt: addDays(today(), -339), expiresAt: addDays(today(), 26), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_expire_008", trainingId: "tng_004", userId: "usr_lrn_a_pkg_3", status: "COMPLETED", dueAt: addDays(today(), -353), completedAt: addDays(today(), -355), expiresAt: addDays(today(), 10), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_expire_009", trainingId: "tng_004", userId: "usr_lrn_a_pkg_4", status: "COMPLETED", dueAt: addDays(today(), -349), completedAt: addDays(today(), -351), expiresAt: addDays(today(), 14), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_expire_010", trainingId: "tng_004", userId: "usr_lrn_a_pkg_5", status: "COMPLETED", dueAt: addDays(today(), -344), completedAt: addDays(today(), -346), expiresAt: addDays(today(), 19), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_expire_011", trainingId: "tng_002", userId: "usr_lrn_a_pkg_6", status: "COMPLETED", dueAt: addDays(today(), -339), completedAt: addDays(today(), -341), expiresAt: addDays(today(), 24), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_expire_012", trainingId: "tng_001", userId: "usr_lrn_b_wh_3", status: "COMPLETED", dueAt: addDays(today(), -357), completedAt: addDays(today(), -359), expiresAt: addDays(today(), 6), proofUrl: "https://example.com/cert/012.pdf", assignedManagerId: "usr_mgr_b" },
  
  // E. REMAINING COMPLETIONS: Mix to reach ~70 total
  // PPE Basics (All learners)
  { id: "cmp_ppe_001", trainingId: "tng_002", userId: "usr_lrn_a_pkg_3", status: "COMPLETED", dueAt: addDays(today(), -60), completedAt: addDays(today(), -65), expiresAt: addDays(addDays(today(), -65), 365), proofUrl: "https://example.com/cert/ppe1.pdf", assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_ppe_002", trainingId: "tng_002", userId: "usr_lrn_a_pkg_4", status: "ASSIGNED", dueAt: addDays(today(), 12), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_ppe_003", trainingId: "tng_002", userId: "usr_lrn_a_pkg_5", status: "COMPLETED", dueAt: addDays(today(), -50), completedAt: addDays(today(), -52), expiresAt: addDays(addDays(today(), -52), 365), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_ppe_004", trainingId: "tng_002", userId: "usr_lrn_a_wh_2", status: "ASSIGNED", dueAt: addDays(today(), 8), assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_ppe_005", trainingId: "tng_002", userId: "usr_lrn_b_wh_3", status: "COMPLETED", dueAt: addDays(today(), -40), completedAt: addDays(today(), -43), expiresAt: addDays(addDays(today(), -43), 365), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_ppe_006", trainingId: "tng_002", userId: "usr_lrn_b_maint_1", status: "COMPLETED", dueAt: addDays(today(), -35), completedAt: addDays(today(), -38), expiresAt: addDays(addDays(today(), -38), 365), proofUrl: "https://example.com/cert/ppe6.pdf", assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_ppe_007", trainingId: "tng_002", userId: "usr_lrn_b_maint_2", status: "ASSIGNED", dueAt: addDays(today(), 15), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_ppe_008", trainingId: "tng_002", userId: "usr_lrn_b_maint_3", status: "COMPLETED", dueAt: addDays(today(), -70), completedAt: addDays(today(), -73), expiresAt: addDays(addDays(today(), -73), 365), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_ppe_009", trainingId: "tng_002", userId: "usr_lrn_b_maint_4", status: "ASSIGNED", dueAt: addDays(today(), 18), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_ppe_010", trainingId: "tng_002", userId: "usr_lrn_b_maint_5", status: "COMPLETED", dueAt: addDays(today(), -45), completedAt: addDays(today(), -47), expiresAt: addDays(addDays(today(), -47), 365), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_ppe_011", trainingId: "tng_002", userId: "usr_lrn_a_maint_1", status: "ASSIGNED", dueAt: addDays(today(), 10), assignedManagerId: "usr_mgr_a" },
  
  // Fire Safety (All learners)
  { id: "cmp_fire_001", trainingId: "tng_004", userId: "usr_lrn_a_pkg_1", status: "ASSIGNED", dueAt: addDays(today(), 20), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_fire_002", trainingId: "tng_004", userId: "usr_lrn_a_pkg_2", status: "COMPLETED", dueAt: addDays(today(), -55), completedAt: addDays(today(), -58), expiresAt: addDays(addDays(today(), -58), 365), assignedManagerId: "usr_mgr_a_pkg" },
  { id: "cmp_fire_003", trainingId: "tng_004", userId: "usr_lrn_a_wh_1", status: "ASSIGNED", dueAt: addDays(today(), 22), assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_fire_004", trainingId: "tng_004", userId: "usr_lrn_a_wh_2", status: "COMPLETED", dueAt: addDays(today(), -65), completedAt: addDays(today(), -67), expiresAt: addDays(addDays(today(), -67), 365), proofUrl: "https://example.com/cert/fire4.pdf", assignedManagerId: "usr_mgr_a_wh" },
  { id: "cmp_fire_005", trainingId: "tng_004", userId: "usr_lrn_b_wh_3", status: "ASSIGNED", dueAt: addDays(today(), 25), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_fire_006", trainingId: "tng_004", userId: "usr_lrn_b_maint_1", status: "COMPLETED", dueAt: addDays(today(), -30), completedAt: addDays(today(), -33), expiresAt: addDays(addDays(today(), -33), 365), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_fire_007", trainingId: "tng_004", userId: "usr_lrn_b_maint_2", status: "ASSIGNED", dueAt: addDays(today(), 28), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_fire_008", trainingId: "tng_004", userId: "usr_lrn_b_maint_3", status: "COMPLETED", dueAt: addDays(today(), -75), completedAt: addDays(today(), -77), expiresAt: addDays(addDays(today(), -77), 365), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_fire_009", trainingId: "tng_004", userId: "usr_lrn_b_maint_4", status: "ASSIGNED", dueAt: addDays(today(), 30), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_fire_010", trainingId: "tng_004", userId: "usr_lrn_b_maint_5", status: "COMPLETED", dueAt: addDays(today(), -48), completedAt: addDays(today(), -50), expiresAt: addDays(addDays(today(), -50), 365), proofUrl: "https://example.com/cert/fire10.pdf", assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_fire_011", trainingId: "tng_004", userId: "usr_lrn_a_maint_1", status: "ASSIGNED", dueAt: addDays(today(), 14), assignedManagerId: "usr_mgr_a" },
  { id: "cmp_fire_012", trainingId: "tng_004", userId: "usr_lrn_a_pkg_6", status: "OVERDUE", dueAt: addDays(today(), -4), overdueDays: 4, assignedManagerId: "usr_mgr_a_pkg" },
  
  // Forklift Safety (Packaging and Warehouse depts)
  { id: "cmp_fork_001", trainingId: "tng_001", userId: "usr_lrn_b_wh_2", status: "ASSIGNED", dueAt: addDays(today(), 16), assignedManagerId: "usr_mgr_b" },
  { id: "cmp_fork_002", trainingId: "tng_001", userId: "usr_lrn_b_wh_3", status: "OVERDUE", dueAt: addDays(today(), -6), overdueDays: 6, assignedManagerId: "usr_mgr_b" },
  
  // Lockout/Tagout (Maintenance depts) - additional
  { id: "cmp_loto_007", trainingId: "tng_003", userId: "usr_lrn_a_maint_1", status: "COMPLETED", dueAt: addDays(today(), -180), completedAt: addDays(today(), -185), expiresAt: addDays(addDays(today(), -185), 730), proofUrl: "https://example.com/cert/loto7.pdf", assignedManagerId: "usr_mgr_a" },
  { id: "cmp_loto_008", trainingId: "tng_003", userId: "usr_lrn_b_maint_1", status: "COMPLETED", dueAt: addDays(today(), -120), completedAt: addDays(today(), -125), expiresAt: addDays(addDays(today(), -125), 730), assignedManagerId: "usr_mgr_b_maint" },
  { id: "cmp_loto_009", trainingId: "tng_003", userId: "usr_lrn_b_maint_2", status: "COMPLETED", dueAt: addDays(today(), -110), completedAt: addDays(today(), -113), expiresAt: addDays(addDays(today(), -113), 730), proofUrl: "https://example.com/cert/loto9.pdf", assignedManagerId: "usr_mgr_b_maint" },
];

// Phase I Epic 3: Reminder Rules
export const reminderRules: ReminderRule[] = [
  {
    id: "rule_001",
    name: "Upcoming Due (7 days before)",
    trigger: "upcoming",
    offsetDays: -7,
    active: true,
  },
  {
    id: "rule_002",
    name: "Overdue Reminder (0 days after)",
    trigger: "overdue",
    offsetDays: 0,
    active: true,
  },
  {
    id: "rule_003",
    name: "Escalate After 3 Days Overdue",
    trigger: "overdue",
    offsetDays: 3,
    escalationAfterDays: 3,
    active: true,
  },
];

// Phase I Polish Pack: Notification Templates
export const notificationTemplates: NotificationTemplate[] = [
  {
    id: "tmpl_upcoming",
    type: "upcoming",
    subject: "Training Due Soon: {{training}}",
    body: "Hi {{employee}},\n\nYour {{training}} training is due on {{due_date}}. Please complete it soon.\n\nManager: {{manager}}\nSite: {{site}}\n\nThank you!",
  },
  {
    id: "tmpl_overdue",
    type: "overdue",
    subject: "OVERDUE: {{training}} Training",
    body: "Hi {{employee}},\n\nYour {{training}} training is now overdue (was due on {{due_date}}). Please complete it immediately.\n\nManager: {{manager}}\nSite: {{site}}\n\nThank you!",
  },
  {
    id: "tmpl_escalation",
    type: "escalation",
    subject: "Escalation: {{employee}} - {{training}} Training Overdue",
    body: "Manager Alert:\n\n{{employee}} has not completed {{training}} training which was due on {{due_date}}.\n\nPlease follow up immediately.\n\nSite: {{site}}",
  },
];

