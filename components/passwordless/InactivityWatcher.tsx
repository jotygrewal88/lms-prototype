// Passwordless Login Prototype — inactivity auto-logout
// Mounted globally so it covers the dashboard and any learner sub-page (e.g.
// the course view). Only runs while a passwordless session is active.
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isSessionActive,
  endSession,
  subscribePwless,
  restoreSessionUserIfNeeded,
} from "@/lib/passwordless/store";

// Prototype: log out after 30 seconds of inactivity.
// PRODUCTION: this should be 10 minutes (10 * 60 * 1000).
const INACTIVITY_TIMEOUT_MS = 30 * 1000;

export default function InactivityWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the logged-in learner after a refresh, and track session state.
  useEffect(() => {
    restoreSessionUserIfNeeded();
    const sync = () => setActive(isSessionActive());
    sync();
    return subscribePwless(sync);
  }, []);

  // Arm the inactivity timer whenever a session is active.
  useEffect(() => {
    if (!active) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        endSession();
        router.push("/learn/login");
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
    // pathname is included so navigating between pages counts as activity.
  }, [active, pathname, router]);

  return null;
}
