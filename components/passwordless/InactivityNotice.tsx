// Passwordless Login Prototype — low-emphasis inactivity helper text
// Shown only during a passwordless session so it doesn't appear for other users.
"use client";

import { useEffect, useState } from "react";
import { isSessionActive, subscribePwless } from "@/lib/passwordless/store";

export default function InactivityNotice() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(isSessionActive());
    sync();
    return subscribePwless(sync);
  }, []);

  if (!active) return null;

  return (
    <p className="text-xs text-gray-400 text-right">
      You&apos;ll be logged out after 10 minutes of inactivity.
    </p>
  );
}
