// Phase I Epic 1 & UI Refresh v2: EHS-style sidebar with lucide icons
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen,
  GraduationCap, 
  ClipboardList, 
  Bell, 
  Users, 
  FileStack, 
  Palette, 
  Globe, 
  CalendarClock,
  TestTube,
  Paintbrush2,
  Award,
  BarChart3,
  Library
} from "lucide-react";
import { getCurrentUser, subscribe } from "@/lib/store";
import { getNavigationItems } from "@/lib/permissions";
import { NavItem } from "@/types";

const NAV_ICONS: Record<string, React.ElementType> = {
  "Dashboard": LayoutDashboard,
  "Analytics": BarChart3,
  "Courses": BookOpen,
  "Library": Library,
  "Trainings": GraduationCap,
  "Compliance": ClipboardList,
  "Notifications": Bell,
  "Users": Users,
  "Audit Snapshots": FileStack,
  "Brand": Palette,
  "Localization": Globe,
  "Reminders": CalendarClock,
  "Style Guide": Paintbrush2,
  "Certificates": Award,
  "Demo": TestTube,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [navItems, setNavItems] = useState<NavItem[]>(getNavigationItems(currentUser.role));

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setNavItems(getNavigationItems(user.role));
    });
    return unsubscribe;
  }, []);

  if (currentUser.role === "LEARNER") {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 overflow-y-auto">
      <nav className="py-6">
        {navItems.map((item) => (
          <div key={item.path}>
            {item.children ? (
              <div>
                <div className="px-3 pt-6 pb-2">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                    {item.label}
                  </div>
                </div>
                <div className="space-y-1">
                  {item.children.map((child) => {
                    const active = isActive(child.path);
                    const Icon = NAV_ICONS[child.label];
                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`
                          relative flex items-center gap-2 px-3 py-2 mx-2 rounded-md text-[14px] transition-colors
                          ${active
                            ? "text-[#2563EB] font-medium bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#2563EB]" />
                        )}
                        {Icon && <Icon className="w-[18px] h-[18px] text-gray-500" />}
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Link
                href={item.path}
                className={`
                  relative flex items-center gap-2 px-3 py-2 mx-2 rounded-md text-[14px] transition-colors
                  ${isActive(item.path)
                    ? "text-[#2563EB] font-medium bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {isActive(item.path) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#2563EB]" />
                )}
                {NAV_ICONS[item.label] && React.createElement(NAV_ICONS[item.label], { className: "w-[18px] h-[18px] text-gray-500" })}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
