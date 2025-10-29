// Phase II Epic 1: Smoke test for route verification (Dev Only)

export async function runSmokeTests() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("\n🔥 Running Route Smoke Tests...\n");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  
  const routes = [
    { path: "/admin/courses", name: "Admin Courses List" },
    { path: "/admin/courses/crs_001/edit", name: "Admin Course Editor" },
    { path: "/learner/courses", name: "Learner Courses Grid" },
    { path: "/admin/diagnostic", name: "Diagnostic Dashboard" },
  ];

  const results: Array<{ route: string; status: number | string; success: boolean }> = [];

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: "GET",
        headers: {
          "User-Agent": "SmokeTest/1.0",
        },
      });
      
      const success = response.status === 200;
      results.push({
        route: route.path,
        status: response.status,
        success,
      });

      const icon = success ? "✅" : "❌";
      console.log(`${icon} ${route.name}: ${response.status} ${response.statusText}`);
      console.log(`   ${baseUrl}${route.path}`);
    } catch (error: any) {
      results.push({
        route: route.path,
        status: error.message,
        success: false,
      });
      console.log(`❌ ${route.name}: ERROR`);
      console.log(`   ${error.message}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`\n📊 Results: ${successCount}/${totalCount} routes returned 200\n`);

  if (successCount === totalCount) {
    console.log("✅ All smoke tests passed!\n");
  } else {
    console.log("⚠️ Some routes failed. Check errors above.\n");
    console.log("💡 Try:");
    console.log("   1. rm -rf .next && npm run dev");
    console.log("   2. Hard refresh browser (Cmd+Shift+R)");
    console.log("   3. Check /dev/routes for manual testing\n");
  }

  return results;
}

// Client-side smoke test (runs in browser)
export function runClientSmokeTests() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  console.log("\n🔥 Running Client-Side Route Tests...\n");

  const routes = [
    "/admin/courses",
    "/admin/courses/crs_001/edit",
    "/learner/courses",
    "/admin/diagnostic",
  ];

  routes.forEach((route) => {
    console.log(`Testing: ${route}`);
  });

  console.log("\n💡 Navigate to /dev/routes to test interactively\n");
}

