// Passwordless Login Prototype — in-memory mock data
// Self-contained seed for the employee ID + PIN kiosk login demo.
// Not wired to the real app store; resets on refresh.

export type PwlessRole = "LEARNER" | "ADMIN" | "MANAGER";

export type PwlessCourseStatus = "not_started" | "in_progress" | "completed";

export interface PwlessCompany {
  name: string;
  slug: string;
}

export interface PwlessCourse {
  id: string;
  title: string;
}

export interface PwlessCourseAssignment {
  courseId: string;
  status: PwlessCourseStatus;
  // 0-100; meaningful for in_progress, 0 for not_started, 100 for completed
  progressPct: number;
}

export interface PwlessLearner {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  team: PwlessTeam;
  managerName: string;
  // Links to a real User in lib/store.ts so the existing learner dashboard
  // renders this person's data once they log in (only set for the demo learner).
  storeUserId?: string;
  // The demo learner has login credentials.
  starterPin?: string;
  customPin?: string;
  assignments: PwlessCourseAssignment[];
}

export type PwlessTeam =
  | "Production Floor"
  | "Warehouse"
  | "Maintenance"
  | "Quality Control";

export const PWLESS_COMPANY: PwlessCompany = {
  name: "Acme Manufacturing",
  slug: "acme-mfg",
};

export const PWLESS_TEAMS: PwlessTeam[] = [
  "Production Floor",
  "Warehouse",
  "Maintenance",
  "Quality Control",
];

export const PWLESS_COURSES: PwlessCourse[] = [
  { id: "crs_forklift", title: "Forklift Safety" },
  { id: "crs_hazcom", title: "Workplace Hazard Communication" },
  { id: "crs_handtool", title: "Hand and Power Tool Safety" },
  { id: "crs_loto", title: "Lockout/Tagout" },
  { id: "crs_ppe", title: "PPE Basics" },
  { id: "crs_emergency", title: "Emergency Response" },
];

// The demo learner's PINs for the login flow.
export const DEMO_STARTER_PIN = "428193";
export const DEMO_CUSTOM_PIN = "654321";

// The real User id (from lib/store.ts seed users) the demo learner maps to.
// Marcus Johnson is an existing learner whose manager (Emily Chen) also exists
// in the seed data, and who has assigned courses + progress to display.
export const DEMO_STORE_USER_ID = "usr_lrn_a_pkg_1";

const COURSE_IDS = PWLESS_COURSES.map((c) => c.id);

// Deterministic pseudo-random so the demo is stable across refreshes.
function seededAssignments(seed: number): PwlessCourseAssignment[] {
  const count = 3 + (seed % 6); // 3..8 courses
  const statuses: PwlessCourseStatus[] = [
    "not_started",
    "in_progress",
    "completed",
  ];
  const assignments: PwlessCourseAssignment[] = [];
  for (let i = 0; i < count; i++) {
    const courseId = COURSE_IDS[(seed + i) % COURSE_IDS.length];
    const status = statuses[(seed + i) % statuses.length];
    const progressPct =
      status === "completed" ? 100 : status === "in_progress" ? 20 + ((seed + i) * 13) % 60 : 0;
    assignments.push({ courseId, status, progressPct });
  }
  return assignments;
}

// Names spread across the four teams (the demo learner is first).
const RAW_LEARNERS: Array<{
  firstName: string;
  lastName: string;
  team: PwlessTeam;
  managerName: string;
}> = [
  { firstName: "Marcus", lastName: "Johnson", team: "Production Floor", managerName: "Emily Chen" },
  { firstName: "Carlos", lastName: "Rivera", team: "Production Floor", managerName: "John Davis" },
  { firstName: "Aisha", lastName: "Khan", team: "Production Floor", managerName: "John Davis" },
  { firstName: "Tyrone", lastName: "Brooks", team: "Production Floor", managerName: "John Davis" },
  { firstName: "Mei", lastName: "Lin", team: "Production Floor", managerName: "John Davis" },
  { firstName: "David", lastName: "Okafor", team: "Production Floor", managerName: "John Davis" },
  { firstName: "Sofia", lastName: "Romano", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "James", lastName: "Whitfield", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "Priya", lastName: "Patel", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "Luis", lastName: "Mendoza", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "Hannah", lastName: "Schmidt", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "Omar", lastName: "Haddad", team: "Warehouse", managerName: "Karen Mills" },
  { firstName: "Grace", lastName: "Nguyen", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Ethan", lastName: "Wallace", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Fatima", lastName: "Al-Sayed", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Marcus", lastName: "Bennett", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Yuki", lastName: "Tanaka", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Diego", lastName: "Flores", team: "Maintenance", managerName: "Robert Cole" },
  { firstName: "Laura", lastName: "Becker", team: "Quality Control", managerName: "Susan Park" },
  { firstName: "Ahmed", lastName: "Mansour", team: "Quality Control", managerName: "Susan Park" },
  { firstName: "Chloe", lastName: "Dubois", team: "Quality Control", managerName: "Susan Park" },
  { firstName: "Raj", lastName: "Singh", team: "Quality Control", managerName: "Susan Park" },
  { firstName: "Nadia", lastName: "Petrova", team: "Quality Control", managerName: "Susan Park" },
  { firstName: "Kevin", lastName: "Murphy", team: "Quality Control", managerName: "Susan Park" },
];

export const PWLESS_LEARNERS: PwlessLearner[] = RAW_LEARNERS.map((raw, index) => {
  const employeeId = `EMP-${1042 + index}`;
  const base: PwlessLearner = {
    id: `pwl_${index + 1}`,
    employeeId,
    firstName: raw.firstName,
    lastName: raw.lastName,
    team: raw.team,
    managerName: raw.managerName,
    assignments: seededAssignments(index + 1),
  };

  // The first learner is the demo login account.
  if (index === 0) {
    base.employeeId = "EMP-1042";
    base.starterPin = DEMO_STARTER_PIN;
    base.customPin = DEMO_CUSTOM_PIN;
    base.storeUserId = DEMO_STORE_USER_ID;
  }

  return base;
});

export const DEMO_LEARNER = PWLESS_LEARNERS[0];

export function getCourseTitle(courseId: string): string {
  return PWLESS_COURSES.find((c) => c.id === courseId)?.title ?? courseId;
}

export function getLearnerByEmployeeId(
  employeeId: string
): PwlessLearner | undefined {
  return PWLESS_LEARNERS.find(
    (l) => l.employeeId.toLowerCase() === employeeId.trim().toLowerCase()
  );
}
