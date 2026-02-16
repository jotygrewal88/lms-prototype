"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Briefcase,
  Wrench,
  Library,
  GraduationCap,
  FileText,
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getCurrentUser, getCourses, subscribe } from "@/lib/store";
import HistoryTab from "@/components/admin/learningmodel/HistoryTab";
import JobTitlesTab from "@/components/admin/learningmodel/JobTitlesTab";
import SkillsTab from "@/components/admin/learningmodel/SkillsTab";

const TABS = [
  // Config group
  { id: "jobtitles", label: "Job Titles", icon: Briefcase, group: "config" },
  { id: "skills", label: "Skills", icon: Wrench, group: "config" },
  { id: "sources", label: "Sources", icon: Library, group: "config" },
  // Workflow group
  { id: "generate", label: "Generate", icon: Sparkles, group: "workflow" },
  { id: "onboarding", label: "Onboarding", icon: GraduationCap, group: "workflow" },
  { id: "drafts", label: "Drafts", icon: FileText, group: "workflow" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function LearningModelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as TabId | null;
  const validTab = TABS.find((t) => t.id === tabParam)?.id;
  const [activeTab, setActiveTab] = useState<TabId>(validTab || "jobtitles");
  const [aiDraftCount, setAiDraftCount] = useState(0);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  // Sync tab from URL
  useEffect(() => {
    if (validTab && validTab !== activeTab) {
      setActiveTab(validTab);
    }
  }, [validTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = useCallback(
    (tabId: TabId) => {
      setActiveTab(tabId);
      router.replace(`/admin/learningmodel?tab=${tabId}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const refresh = () => {
      const courses = getCourses();
      setAiDraftCount(
        courses.filter((c) => c.status === "ai-draft" || c.status === "in-review").length
      );
    };
    refresh();
    return subscribe(refresh);
  }, []);

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access the Learning Model.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Learning Model</h1>
          </div>
          <p className="text-gray-600">
            Manage job roles, skills, knowledge sources, and AI-generated training
          </p>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex items-center">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              // Add a divider between config and workflow groups
              const showDivider =
                idx > 0 && TABS[idx - 1].group !== tab.group;

              return (
                <div key={tab.id} className="flex items-center">
                  {showDivider && (
                    <div className="mx-3 h-6 w-px bg-gray-300" />
                  )}
                  <button
                    onClick={() => switchTab(tab.id)}
                    className={`flex items-center gap-1.5 py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === "drafts" && aiDraftCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                        {aiDraftCount}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "jobtitles" && <JobTitlesTab />}
        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "sources" && <SourcesPlaceholder onNavigate={() => router.push("/admin/library")} />}
        {activeTab === "generate" && <GeneratePlaceholder onNavigate={() => router.push("/admin/courses/generate")} aiDraftCount={aiDraftCount} />}
        {activeTab === "onboarding" && <OnboardingPlaceholder />}
        {activeTab === "drafts" && <HistoryTab />}
      </div>
    </AdminLayout>
  );
}

/* ─── Placeholder tabs ──────────────────────────────────────────────────── */

function SourcesPlaceholder({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Card className="p-8 text-center border-gray-200">
      <Library className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Sources</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Your library contains the documents, SOPs, and reference materials that feed into AI course
        generation. Manage sources in the Library.
      </p>
      <Button variant="primary" onClick={onNavigate}>
        <Library className="w-4 h-4" />
        Go to Library
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}

function GeneratePlaceholder({
  onNavigate,
  aiDraftCount,
}: {
  onNavigate: () => void;
  aiDraftCount: number;
}) {
  return (
    <Card className="p-8 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate a New Course</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Use AI to build training from your library sources, skills data, and compliance context.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" onClick={onNavigate}>
            <Sparkles className="w-4 h-4" />
            Generate Course
            <ArrowRight className="w-4 h-4" />
          </Button>
          {aiDraftCount > 0 && (
            <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {aiDraftCount} draft{aiDraftCount !== 1 ? "s" : ""} pending review
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function OnboardingPlaceholder() {
  return (
    <Card className="p-8 text-center border-gray-200">
      <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Paths</h3>
      <p className="text-gray-600 mb-2 max-w-md mx-auto">
        Create phased onboarding programs for each job title — automatically sequencing courses
        based on skill priority and timeline requirements.
      </p>
      <span className="inline-block mt-4 px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded-full">
        Coming soon
      </span>
    </Card>
  );
}

/* ─── Wrap in Suspense for useSearchParams ────────────────────────────── */

export default function LearningModelPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">Loading...</div>
        </AdminLayout>
      }
    >
      <LearningModelContent />
    </Suspense>
  );
}
