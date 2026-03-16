"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Award,
  Stamp,
  Bell,
  User,
} from "lucide-react";
import {
  getCurrentUser,
  getReceivedNotifications,
  getAssignedCoursesForUser,
  getProgressCoursesByUserId,
  subscribe,
} from "@/lib/store";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

function MiniProgressRing({ percent, size = 36, stroke = 3 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#10b981"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function LearnerSidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [notificationCount, setNotificationCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const updateState = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setNotificationCount(getReceivedNotifications(user.id).length);

      const assigned = getAssignedCoursesForUser(user.id);
      const progress = getProgressCoursesByUserId(user.id);
      const done = progress.filter((p) => p.status === "completed").length;
      setTotalCount(assigned.length);
      setCompletedCount(done);
    };

    updateState();
    const unsubscribe = subscribe(updateState);
    return unsubscribe;
  }, []);

  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const navItems: NavItem[] = [
    { label: "My Learning", path: "/learner", icon: BookOpen },
    { label: "Completed", path: "/learner/completed", icon: CheckCircle2 },
    { label: "Certificates", path: "/learner/certificates", icon: Award },
    { label: "Skill Passport", path: "/learner/passport", icon: Stamp },
    { label: "Notifications", path: "/learner/notifications", icon: Bell, badge: notificationCount },
  ];

  const isActive = (path: string) => {
    if (path === "/learner") return pathname === "/learner";
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen sticky top-14 overflow-y-auto">
      {/* User greeting + progress */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <MiniProgressRing percent={completionPct} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-gray-700">{completionPct}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentUser.firstName}
            </p>
            <p className="text-xs text-gray-500">{completedCount} course{completedCount !== 1 ? "s" : ""} completed</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${active
                    ? "text-emerald-700 font-medium bg-emerald-50 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-500" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile link at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-100 bg-white">
        <Link
          href="/learner/profile"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
            ${pathname === "/learner/profile"
              ? "text-emerald-700 font-medium bg-emerald-50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }
          `}
        >
          <User className={`w-5 h-5 ${pathname === "/learner/profile" ? "text-emerald-600" : "text-gray-400"}`} />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
}
