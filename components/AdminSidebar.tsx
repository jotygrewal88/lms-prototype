// Phase I Epic 1: Admin sidebar navigation
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser, subscribe } from "@/lib/store";
import { getNavigationItems } from "@/lib/permissions";
import { NavItem } from "@/types";

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

  // Don't show sidebar for learners
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 pt-4">
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <div key={item.path}>
            {item.children ? (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  {item.label}
                </div>
                <div className="ml-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(child.path)
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      style={isActive(child.path) ? { backgroundColor: 'var(--primary-color)' } : undefined}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={item.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={isActive(item.path) ? { backgroundColor: 'var(--primary-color)' } : undefined}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

