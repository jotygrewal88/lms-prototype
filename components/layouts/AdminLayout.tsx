// Phase I Epic 1 & 2: Admin layout with header and sidebar
// Acceptance: Admin/Manager can access admin routes with filtered navigation
"use client";

import React from "react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </>
  );
}

