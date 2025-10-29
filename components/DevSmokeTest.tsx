// Phase II Epic 1: Dev-only smoke test component
"use client";

import { useEffect } from "react";

export default function DevSmokeTest() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Run smoke tests after a short delay
    const timer = setTimeout(() => {
      console.log("\n🔥 Client-Side Route Verification\n");
      
      const routes = [
        { path: "/admin/courses", name: "Admin Courses" },
        { path: "/admin/courses/crs_001/edit", name: "Course Editor" },
        { path: "/learner/courses", name: "Learner Courses" },
        { path: "/admin/diagnostic", name: "Diagnostic" },
        { path: "/dev/routes", name: "Dev Routes Index" },
      ];

      console.log("Target Routes:");
      routes.forEach((route) => {
        console.log(`  ${route.name}: ${route.path}`);
      });

      console.log("\n💡 Test routes at: /dev/routes");
      console.log("🔍 Check server logs for middleware output\n");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

