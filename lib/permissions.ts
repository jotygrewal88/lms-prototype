// Phase I Epic 1 & 3: Permission and navigation system
import { Role, NavItem } from "@/types";

// Route authorization
export function canAccessRoute(role: Role, path: string): boolean {
  // Learners can only access /learner and /learner/* routes
  if (role === "LEARNER") {
    return path === "/learner" || path.startsWith("/learner/");
  }
  
  // Managers can access admin routes except settings
  if (role === "MANAGER") {
    if (path.startsWith("/admin/settings")) {
      return false;
    }
    return path.startsWith("/admin") || path.startsWith("/learner");
  }
  
  // Admins can access everything
  if (role === "ADMIN") {
    return true;
  }
  
  return false;
}

// Navigation items filtered by role
export function getNavigationItems(role: Role): NavItem[] {
  const adminNav: NavItem[] = [
    {
      label: "Dashboard",
      path: "/admin",
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
    },
    {
      label: "Courses",
      path: "/admin/courses",
    },
    {
      label: "Library",
      path: "/admin/library",
    },
    {
      label: "Trainings",
      path: "/admin/trainings",
    },
    {
      label: "Compliance",
      path: "/admin/compliance",
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
    },
    {
      label: "Users",
      path: "/admin/users",
    },
    {
      label: "Reports",
      path: "/admin/reports",
      children: [
        {
          label: "Audit Snapshots",
          path: "/admin/reports/audits",
        },
      ],
    },
    {
      label: "Settings",
      path: "/admin/settings",
      children: [
        {
          label: "Brand",
          path: "/admin/settings/brand",
        },
        {
          label: "Localization",
          path: "/admin/settings/localization",
        },
        {
          label: "Reminders",
          path: "/admin/settings/notifications",
        },
        {
          label: "Style Guide",
          path: "/admin/settings/style-guide",
        },
        {
          label: "Certificates",
          path: "/admin/settings/certificates",
        },
      ],
    },
  ];

  // Learners have no sidebar navigation
  if (role === "LEARNER") {
    return [];
  }

  // Managers see everything except Settings
  if (role === "MANAGER") {
    return adminNav.filter(item => item.label !== "Settings");
  }

  // Admins see everything
  return adminNav;
}

