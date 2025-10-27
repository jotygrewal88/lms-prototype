// Phase I Epic 1 & 2: Learner layout with header only (no sidebar)
// Acceptance: Learners see header with role toggle but no admin navigation
"use client";

import React from "react";
import Header from "@/components/Header";

interface LearnerLayoutProps {
  children: React.ReactNode;
}

export default function LearnerLayout({ children }: LearnerLayoutProps) {
  return (
    <>
      <Header />
      <main className="p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </>
  );
}

