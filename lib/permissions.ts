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
      label: "Compliance",
      path: "/admin/compliance",
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
    },
    {
      label: "Trainings",
      path: "/admin/trainings",
    },
    {
      label: "Courses",
      path: "/admin/courses",
    },
    {
      label: "Onboarding",
      path: "/admin/onboarding",
    },
    {
      label: "Training Actions",
      path: "/admin/training-responses",
    },
    {
      label: "Library",
      path: "/admin/library",
    },
    {
      label: "Reports",
      path: "/admin/reports",
      children: [
        {
          label: "Analytics",
          path: "/admin/analytics",
        },
        {
          label: "Audit Snapshots",
          path: "/admin/reports/audits",
        },
        {
          label: "Signals",
          path: "/admin/signals",
        },
      ],
    },
    {
      label: "Settings",
      path: "/admin/settings",
      children: [
        {
          label: "Users",
          path: "/admin/users",
        },
        {
          label: "Learning Model",
          path: "/admin/learningmodel",
        },
        {
          label: "Locations",
          path: "/admin/settings/locations",
        },
        {
          label: "Customization",
          path: "/admin/settings/customization",
        },
        {
          label: "Reminders",
          path: "/admin/settings/notifications",
        },
      ],
    },
  ];

  // Learners have no sidebar navigation
  if (role === "LEARNER") {
    return [];
  }

  // Managers see everything except admin-only settings (brand, localization, etc.)
  if (role === "MANAGER") {
    const managerVisibleSettings = ["Users", "Learning Model", "Locations"];
    return adminNav.map(item => {
      if (item.label === "Settings" && item.children) {
        const filtered = item.children.filter(c => managerVisibleSettings.includes(c.label));
        if (filtered.length === 0) return null;
        return { ...item, children: filtered };
      }
      return item;
    }).filter((item): item is NavItem => item !== null);
  }

  // Admins see everything
  return adminNav;
}

