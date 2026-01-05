// Learner layout with sidebar navigation and full-width content area
"use client";

import React from "react";
import Header from "@/components/Header";
import LearnerSidebar from "@/components/layouts/LearnerSidebar";

interface LearnerLayoutProps {
  children: React.ReactNode;
}

export default function LearnerLayout({ children }: LearnerLayoutProps) {
  return (
    <>
      <Header />
      <div className="flex">
        <LearnerSidebar />
        <main id="main-content" className="flex-1 p-6 bg-gray-50 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </>
  );
}
