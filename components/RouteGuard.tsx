// Phase I Epic 1 + Phase II Epic 1: Route guard for permission enforcement
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser, subscribe } from "@/lib/store";
import { canAccessRoute } from "@/lib/permissions";
import Unauthorized from "./Unauthorized";
import type { User } from "@/types";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: User["role"][]; // Optional explicit role allowlist
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const pathname = usePathname();
  const initialUser = getCurrentUser();
  
  // Check initial access synchronously
  const initialAccess = allowedRoles 
    ? allowedRoles.includes(initialUser.role)
    : canAccessRoute(initialUser.role, pathname);
  
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [hasAccess, setHasAccess] = useState(initialAccess);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // If explicit allowedRoles provided, use that; otherwise use permission system
    const access = allowedRoles 
      ? allowedRoles.includes(user.role)
      : canAccessRoute(user.role, pathname);
    
    setHasAccess(access);

    const unsubscribe = subscribe(() => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
      
      const updatedAccess = allowedRoles 
        ? allowedRoles.includes(updatedUser.role)
        : canAccessRoute(updatedUser.role, pathname);
      
      setHasAccess(updatedAccess);
    });

    return unsubscribe;
  }, [pathname, allowedRoles]);

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

