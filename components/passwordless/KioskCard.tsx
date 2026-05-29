// Passwordless Login Prototype — centered kiosk card shell
// Shared full-screen layout with UpKeep Learn branding, reused by the login
// and first-time PIN setup pages.
"use client";

import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import DemoRoleSwitcher from "@/components/passwordless/DemoRoleSwitcher";

interface KioskCardProps {
  children: ReactNode;
  showRoleSwitcher?: boolean;
}

export default function KioskCard({
  children,
  showRoleSwitcher = true,
}: KioskCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {showRoleSwitcher && <DemoRoleSwitcher />}

      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-gray-800" />
        <span className="text-xl font-semibold tracking-tight text-gray-900">
          UpKeep Learn
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}
