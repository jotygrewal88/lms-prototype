// Passwordless Login Prototype — demo-only role switcher
// Fixed top-right control for jumping between prototype role views during a
// demo. This would NOT exist in production.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDemoRole, setDemoRole } from "@/lib/passwordless/store";
import type { PwlessRole } from "@/data/passwordlessSeed";

const ROLE_ENTRY_ROUTES: Record<PwlessRole, string> = {
  LEARNER: "/learn/login",
  ADMIN: "/learn/admin",
  MANAGER: "/learn/manager",
};

export default function DemoRoleSwitcher() {
  const router = useRouter();
  const [role, setRole] = useState<PwlessRole>(getDemoRole());

  const handleChange = (next: PwlessRole) => {
    setRole(next);
    setDemoRole(next);
    router.push(ROLE_ENTRY_ROUTES[next]);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm">
      <span className="text-xs font-medium text-gray-500">Demo only — switch role:</span>
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as PwlessRole)}
        className="bg-gray-50 text-gray-900 rounded-lg px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="LEARNER">Learner</option>
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
      </select>
    </div>
  );
}
