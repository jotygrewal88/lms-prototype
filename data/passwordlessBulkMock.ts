// Passwordless Login Prototype — mock data for the bulk CSV upload preview.
// Generates a realistic batch of learners distributed across existing seed
// teams/managers, plus a couple of errored rows to exercise the preview UI.

export interface BulkLearnerRow {
  firstName: string;
  lastName: string;
  employeeId: string;
  teamLabel: string;
  managerName: string;
  roleTitle: string;
  siteId: string;
  departmentId: string;
  managerId: string;
  status: "ready" | "error";
  error?: string;
}

const TEAMS = [
  { label: "Packaging — Plant A", siteId: "site_a", departmentId: "dept_a_packaging", managerId: "usr_mgr_a_pkg", managerName: "Emily Chen" },
  { label: "Warehouse — Plant A", siteId: "site_a", departmentId: "dept_a_warehouse", managerId: "usr_mgr_a_wh", managerName: "Priya Singh" },
  { label: "Maintenance — Plant A", siteId: "site_a", departmentId: "dept_a_maintenance", managerId: "usr_mgr_a", managerName: "Mike Manager" },
  { label: "Maintenance — Plant B", siteId: "site_b", departmentId: "dept_b_maintenance", managerId: "usr_mgr_b_maint", managerName: "Diego Alvarez" },
];

const ROLES = [
  "Production Floor Associate",
  "Machine Operator",
  "Forklift Operator",
  "Warehouse Associate",
  "Maintenance Helper",
  "Quality Inspector",
];

const FIRST_NAMES = [
  "Maria", "Andre", "Fatima", "Chen", "Diego", "Aisha", "Tomas", "Nadia",
  "Kwame", "Lena", "Omar", "Priscilla", "Hassan", "Yuki", "Marco", "Zara",
  "Ivan", "Grace", "Pavel", "Leticia", "Sven", "Amara", "Hugo", "Mei",
];

const LAST_NAMES = [
  "Reyes", "Okafor", "Haddad", "Lin", "Santos", "Ali", "Novak", "Petrov",
  "Mensah", "Fischer", "Khan", "Romero", "Yilmaz", "Tanaka", "Bianchi", "Ahmed",
  "Volkov", "Owens", "Sokolov", "Cruz", "Larsen", "Diallo", "Moreau", "Wong",
];

export function generateBulkLearnerRows(): BulkLearnerRow[] {
  const readyRows: BulkLearnerRow[] = FIRST_NAMES.map((firstName, i) => {
    const team = TEAMS[i % TEAMS.length];
    return {
      firstName,
      lastName: LAST_NAMES[i],
      employeeId: `EMP-${30001 + i}`,
      teamLabel: team.label,
      managerName: team.managerName,
      roleTitle: ROLES[i % ROLES.length],
      siteId: team.siteId,
      departmentId: team.departmentId,
      managerId: team.managerId,
      status: "ready",
    };
  });

  const errorRows: BulkLearnerRow[] = [
    {
      firstName: "Marcus",
      lastName: "Johnson",
      employeeId: "EMP-1042",
      teamLabel: "Packaging — Plant A",
      managerName: "Emily Chen",
      roleTitle: "Packaging Operator",
      siteId: "site_a",
      departmentId: "dept_a_packaging",
      managerId: "usr_mgr_a_pkg",
      status: "error",
      error: "Duplicate Employee ID (EMP-1042 already exists)",
    },
    {
      firstName: "Priya",
      lastName: "",
      employeeId: "EMP-30099",
      teamLabel: "Warehouse — Plant A",
      managerName: "Priya Singh",
      roleTitle: "Warehouse Associate",
      siteId: "site_a",
      departmentId: "dept_a_warehouse",
      managerId: "usr_mgr_a_wh",
      status: "error",
      error: "Missing Last name",
    },
  ];

  // Interleave so the preview's first rows show a mix (errors near the top).
  return [readyRows[0], errorRows[0], ...readyRows.slice(1, 6), errorRows[1], ...readyRows.slice(6)];
}
