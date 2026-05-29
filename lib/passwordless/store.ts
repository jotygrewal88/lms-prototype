// Passwordless Login Prototype — tiny in-memory demo store
// Mirrors the lib/store.ts module style (module-level state), but scoped to
// the passwordless prototype only. The active learner is driven through the
// real app store via switchRole() so the existing dashboard renders their data.
"use client";

import {
  switchRole,
  getCurrentUser,
  getPasswordlessRecord,
  getPasswordlessRecordByEmployeeId,
  setLearnerCustomPin,
  recordLearnerLogin,
} from "@/lib/store";
import {
  DEMO_STARTER_PIN,
  DEMO_STORE_USER_ID,
  PWLESS_COMPANY,
  type PwlessRole,
} from "@/data/passwordlessSeed";

// Default seed user to fall back to when the passwordless session ends.
const DEFAULT_USER_ID = "usr_admin_1";

// Active demo role (drives the demo-only role switcher on kiosk pages).
let demoRole: PwlessRole = "LEARNER";

// Whether a passwordless kiosk session is active. Persisted to sessionStorage
// so a page refresh during the demo doesn't drop the logged-in learner.
// (Mock only — clears on tab close or log out.)
const SESSION_KEY = "pwless_session_active";
let sessionActive = false;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribePwless(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

export type AuthResult =
  | { status: "starter"; employeeId: string }
  | { status: "custom"; employeeId: string }
  | { status: "invalid" };

// Validate kiosk credentials against the admin-managed directory.
export function authenticate(
  companyCode: string,
  employeeId: string,
  pin: string
): AuthResult {
  if (companyCode.trim().toLowerCase() !== PWLESS_COMPANY.slug) {
    return { status: "invalid" };
  }

  const record = getPasswordlessRecordByEmployeeId(employeeId);
  if (!record) {
    return { status: "invalid" };
  }

  // A starter PIN always routes to first-time setup (e.g. brand-new learner or
  // after an admin PIN reset).
  if (record.starterPin && pin === record.starterPin) {
    return { status: "starter", employeeId: record.employeeId };
  }

  // Otherwise match against the PIN the learner set for themselves.
  if (record.customPin && pin === record.customPin) {
    return { status: "custom", employeeId: record.employeeId };
  }

  return { status: "invalid" };
}

// The demo learner's current self-chosen PIN (used by Change PIN).
export function getCurrentPin(): string {
  return getPasswordlessRecord(DEMO_STORE_USER_ID)?.customPin ?? "";
}

export function setCustomPin(pin: string): void {
  setLearnerCustomPin(DEMO_STORE_USER_ID, pin);
}

export function getDemoRole(): PwlessRole {
  return demoRole;
}

export function setDemoRole(role: PwlessRole): void {
  demoRole = role;
}

// --- Session lifecycle -----------------------------------------------------

// Begin a passwordless session: become the demo learner and mark active.
export function startSession(): void {
  sessionActive = true;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* sessionStorage unavailable — fall back to in-memory only */
  }
  switchRole(DEMO_STORE_USER_ID);
  recordLearnerLogin(DEMO_STORE_USER_ID);
  notify();
}

// End the session: clear state and drop back to the default (non-learner) user
// so protected learner routes are no longer accessible.
export function endSession(): void {
  sessionActive = false;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  switchRole(DEFAULT_USER_ID);
  notify();
}

export function isSessionActive(): boolean {
  if (sessionActive) return true;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

// After a full page refresh the real store resets currentUser to the default
// admin. If a session is still active, re-apply the demo learner so the
// dashboard stays accessible. Returns true if it restored the learner.
export function restoreSessionUserIfNeeded(): boolean {
  if (!isSessionActive()) return false;
  sessionActive = true;
  if (getCurrentUser().id !== DEMO_STORE_USER_ID) {
    switchRole(DEMO_STORE_USER_ID);
    return true;
  }
  return false;
}

export { DEMO_STARTER_PIN };
