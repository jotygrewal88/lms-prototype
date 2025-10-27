// Phase I Epic 1: Route guard for permission enforcement
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser, subscribe } from "@/lib/store";
import { canAccessRoute } from "@/lib/permissions";
import Unauthorized from "./Unauthorized";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setHasAccess(canAccessRoute(user.role, pathname));

    const unsubscribe = subscribe(() => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
      setHasAccess(canAccessRoute(updatedUser.role, pathname));
    });

    return unsubscribe;
  }, [pathname]);

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

