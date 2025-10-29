// Phase II Epic 1: Dev Routes Index (Development Only)
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getCurrentUser, getCourses } from "@/lib/store";

export default function DevRoutesPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const courses = getCourses();
  const sampleCourseId = courses.length > 0 ? courses[0].id : "crs_001";

  const routes = [
    {
      path: "/admin/courses",
      label: "Admin Courses List",
      description: "View all courses, create, edit, delete",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      path: `/admin/courses/${sampleCourseId}/edit`,
      label: "Admin Course Editor",
      description: "Multi-tab course editor (Overview, Lessons, Quiz, Settings)",
      roles: ["ADMIN"],
    },
    {
      path: "/learner/courses",
      label: "Learner Courses Grid",
      description: "View assigned courses with progress",
      roles: ["LEARNER"],
    },
    {
      path: "/admin/diagnostic",
      label: "Diagnostic Dashboard",
      description: "Test routes and verify functionality",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      path: "/admin",
      label: "Admin Dashboard",
      description: "Main admin dashboard",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      path: "/learner",
      label: "Learner Dashboard",
      description: "Main learner dashboard",
      roles: ["LEARNER"],
    },
  ];

  const testRoute = async (path: string) => {
    try {
      const response = await fetch(path);
      const status = response.status;
      const statusText = response.statusText;
      alert(`${path}\nStatus: ${status} ${statusText}\n${status === 200 ? "✅ Success" : "❌ Failed"}`);
    } catch (error: any) {
      alert(`${path}\nError: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛠️ Dev Routes Index
          </h1>
          <p className="text-gray-600">
            Phase II Epic 1 - Route Testing Dashboard
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current User:</strong> {currentUser.firstName} {currentUser.lastName} ({currentUser.role})
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Target Routes
          </h2>
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.path}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {route.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {route.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {route.path}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {route.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            role === currentUser.role
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={route.path}>
                      <Button variant="primary" className="text-sm">
                        Navigate
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="text-sm"
                      onClick={() => testRoute(route.path)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("=== Route Test Results ===");
                routes.forEach((route) => {
                  console.log(`${route.path} - ${route.label}`);
                });
              }}
            >
              Log Routes to Console
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (typeof window !== "undefined" && "caches" in window) {
                  caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                  });
                  alert("Browser cache cleared!");
                }
              }}
            >
              Clear Browser Cache
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/diagnostic")}
            >
              Go to Diagnostic
            </Button>
          </div>
        </Card>

        <Card className="bg-yellow-50 border border-yellow-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ⚠️ Development Only
          </h2>
          <p className="text-sm text-gray-700">
            This page is for development and testing purposes only. It should
            not be accessible in production.
          </p>
        </Card>
      </div>
    </div>
  );
}

