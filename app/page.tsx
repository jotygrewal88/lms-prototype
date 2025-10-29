// Phase I Epic 1 & Polish Pack: Root page - immediate redirect based on role
// Phase II Epic 1: Updated to use courses as default landing
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Get current user from store
    const user = getCurrentUser();
    
    // Redirect based on role to guaranteed entry points
    if (user.role === "LEARNER") {
      router.replace("/learner/courses");
    } else {
      // ADMIN or MANAGER → courses page as default
      router.replace("/admin/courses");
    }
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

