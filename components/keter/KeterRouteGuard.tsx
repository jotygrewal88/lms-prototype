// Keter route guard: explicit-allowlist only. Does NOT consult
// `lib/permissions.ts → canAccessRoute`, so /keter/... paths bypass the
// main path-prefix check (which only knows about /admin and /learner).
"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, subscribe } from "@/lib/keter/store";
import Unauthorized from "@/components/Unauthorized";
import type { User } from "@/types";

interface KeterRouteGuardProps {
  children: React.ReactNode;
  allowedRoles: User["role"][]; // required — no canAccessRoute fallback
}

export default function KeterRouteGuard({ children, allowedRoles }: KeterRouteGuardProps) {
  const initialUser = getCurrentUser();
  const [hasAccess, setHasAccess] = useState(allowedRoles.includes(initialUser.role));

  useEffect(() => {
    const update = () => {
      const user = getCurrentUser();
      setHasAccess(allowedRoles.includes(user.role));
    };
    update();
    return subscribe(update);
  }, [allowedRoles]);

  if (!hasAccess) {
    return <Unauthorized />;
  }
  return <>{children}</>;
}
