// Passwordless Login Prototype — admin-managed PIN / login-state directory.
// Keyed to real Users in data/seed.ts. The store seeds its mutable copy from this.
import type { PasswordlessRecord } from "@/types";

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const passwordlessDirectory: PasswordlessRecord[] = [
  // Marcus Johnson — the demo learner. Already set up a custom PIN.
  {
    userId: "usr_lrn_a_pkg_1",
    employeeId: "EMP-1042",
    starterPin: "428193",
    customPin: "654321",
    status: "active",
    lastLoginAt: daysAgoISO(1),
  },
  // Rosa Delgado — active, logged in recently.
  {
    userId: "usr_pwl_1",
    employeeId: "EMP-2001",
    starterPin: "501822",
    customPin: "770413",
    status: "active",
    lastLoginAt: daysAgoISO(2),
  },
  // Dwayne Carter — created but never logged in (pending first login).
  {
    userId: "usr_pwl_2",
    employeeId: "EMP-2002",
    starterPin: "639104",
    status: "pending_first_login",
  },
  // Ling Wu — created but never logged in (pending first login).
  {
    userId: "usr_pwl_3",
    employeeId: "EMP-2003",
    starterPin: "284756",
    status: "pending_first_login",
  },
  // Samuel Idris — active, but hasn't logged in for a while.
  {
    userId: "usr_pwl_4",
    employeeId: "EMP-2004",
    starterPin: "118420",
    customPin: "903517",
    status: "active",
    lastLoginAt: daysAgoISO(34),
  },
  // Brenda Olsen — active, logged in recently.
  {
    userId: "usr_pwl_5",
    employeeId: "EMP-2005",
    starterPin: "447290",
    customPin: "612388",
    status: "active",
    lastLoginAt: daysAgoISO(5),
  },
];
