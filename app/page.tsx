// Phase I Epic 1 & Polish Pack: Root page - immediate redirect based on role
"use client";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/store";

export default function HomePage() {
  // Get current user synchronously from store
  const user = getCurrentUser();
  
  // Immediate redirect based on role (no useEffect, no loading state)
  if (user.role === "LEARNER") {
    redirect("/learner");
  } else {
    // ADMIN or MANAGER → /admin
    redirect("/admin");
  }
  
  // This return is never reached due to redirect
  return null;
}

