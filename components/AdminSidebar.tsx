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
  Library,
  MapPin,
  Shield,
  Sparkles,
  Milestone,
  AlertTriangle,
  Zap
} from "lucide-react";
import { getCurrentUser, getCourses, getActiveOnboardingAssignmentCount, getOpenSignals, getPendingTrainingResponses, subscribe } from "@/lib/store";
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
  "Skills": Shield,
  "Learning Model": Sparkles,
  "Onboarding": Milestone,
  "Audit Snapshots": FileStack,
  "Locations": MapPin,
  "Brand": Palette,
  "Localization": Globe,
  "Reminders": CalendarClock,
  "Style Guide": Paintbrush2,
  "Certificates": Award,
  "Demo": TestTube,
  "Signals": AlertTriangle,
  "Training Responses": Zap,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [navItems, setNavItems] = useState<NavItem[]>(getNavigationItems(currentUser.role));
  const [aiDraftCount, setAiDraftCount] = useState(0);
  const [activeOnboardingCount, setActiveOnboardingCount] = useState(0);
  const [openSignalCount, setOpenSignalCount] = useState(0);
  const [hasCriticalSignal, setHasCriticalSignal] = useState(false);
  const [pendingResponseCount, setPendingResponseCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      setAiDraftCount(getCourses().filter((c) => c.status === "ai-draft" || c.status === "in-review").length);
      setActiveOnboardingCount(getActiveOnboardingAssignmentCount());
      const open = getOpenSignals();
      setOpenSignalCount(open.length);
      setHasCriticalSignal(open.some((s) => s.severity === "critical"));
      setPendingResponseCount(getPendingTrainingResponses().length);
    };
    const unsubscribe = subscribe(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setNavItems(getNavigationItems(user.role));
      updateCounts();
    });
    updateCounts();
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
                        {child.label === "Courses" && aiDraftCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold">
                            {aiDraftCount}
                          </span>
                        )}
                        {child.label === "Signals" && openSignalCount > 0 && (
                          <span className={`ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                            hasCriticalSignal
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {openSignalCount}
                          </span>
                        )}
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
                {item.label === "Courses" && aiDraftCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold">
                    {aiDraftCount}
                  </span>
                )}
                {item.label === "Onboarding" && activeOnboardingCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                    {activeOnboardingCount}
                  </span>
                )}
                {item.label === "Training Responses" && pendingResponseCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold">
                    {pendingResponseCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
