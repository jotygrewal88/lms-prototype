"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Milestone, Route, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import { subscribe, getJobTitles, getOnboardingPaths } from "@/lib/store";
import PathsTab from "@/components/admin/onboarding/PathsTab";
import ActiveTab from "@/components/admin/onboarding/ActiveTab";
import CompletedTab from "@/components/admin/onboarding/CompletedTab";
import GenerateWizard from "@/components/admin/onboarding/GenerateWizard";
import PathPreview from "@/components/admin/onboarding/PathPreview";
import BatchGenerateModal from "@/components/admin/onboarding/BatchGenerateModal";

const TABS = [
  { id: "paths", label: "Paths", icon: Route },
  { id: "active", label: "Active", icon: Milestone },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as TabId | null;
  const actionParam = searchParams.get("action");
  const jobTitleIdParam = searchParams.get("jobTitleId");
  const previewParam = searchParams.get("preview");

  const validTab = TABS.find((t) => t.id === tabParam)?.id;
  const [activeTab, setActiveTab] = useState<TabId>(validTab || "paths");
  const [showWizard, setShowWizard] = useState(actionParam === "generate");
  const [previewPathId, setPreviewPathId] = useState<string | null>(previewParam || null);
  const [showBatchGenerate, setShowBatchGenerate] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (validTab && validTab !== activeTab) setActiveTab(validTab);
  }, [validTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (actionParam === "generate") setShowWizard(true);
    if (previewParam) setPreviewPathId(previewParam);
  }, [actionParam, previewParam]);

  const switchTab = useCallback(
    (tabId: TabId) => {
      setActiveTab(tabId);
      setShowWizard(false);
      setPreviewPathId(null);
      router.replace(`/admin/onboarding?tab=${tabId}`, { scroll: false });
    },
    [router]
  );

  const openWizard = useCallback(
    (jtId?: string) => {
      setShowWizard(true);
      setPreviewPathId(null);
      const url = jtId
        ? `/admin/onboarding?action=generate&jobTitleId=${jtId}`
        : `/admin/onboarding?action=generate`;
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const openPreview = useCallback(
    (pathId: string) => {
      setPreviewPathId(pathId);
      setShowWizard(false);
      router.replace(`/admin/onboarding?tab=paths&preview=${pathId}`, { scroll: false });
    },
    [router]
  );

  const closePreview = useCallback(() => {
    setPreviewPathId(null);
    router.replace(`/admin/onboarding?tab=paths`, { scroll: false });
  }, [router]);

  const onWizardComplete = useCallback(
    (pathId: string) => {
      setShowWizard(false);
      openPreview(pathId);
    },
    [openPreview]
  );

  // If showing wizard
  if (showWizard) {
    return (
      <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
        <AdminLayout>
          <GenerateWizard
            preselectedJobTitleId={jobTitleIdParam || undefined}
            onCancel={() => {
              setShowWizard(false);
              router.replace("/admin/onboarding?tab=paths", { scroll: false });
            }}
            onComplete={onWizardComplete}
          />
        </AdminLayout>
      </RouteGuard>
    );
  }

  // If showing preview
  if (previewPathId) {
    return (
      <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
        <AdminLayout>
          <PathPreview pathId={previewPathId} onBack={closePreview} />
        </AdminLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <AdminLayout>
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Milestone className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Onboarding</h1>
            </div>
            <p className="text-sm text-gray-500">
              Create and manage onboarding programs for new hires
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "paths" && (
            <PathsTab
              onGenerate={openWizard}
              onPreview={openPreview}
              onBatchGenerate={() => setShowBatchGenerate(true)}
            />
          )}
          {activeTab === "active" && <ActiveTab />}
          {activeTab === "completed" && <CompletedTab />}
        </div>

        {/* Batch Generate Modal */}
        {showBatchGenerate && (
          <BatchGenerateModal
            uncoveredJTs={getJobTitles()
              .filter((jt) => jt.active)
              .filter(
                (jt) =>
                  !getOnboardingPaths().some(
                    (p) => p.jobTitleId === jt.id && p.status === "published"
                  )
              )}
            onClose={() => setShowBatchGenerate(false)}
            onComplete={() => setShowBatchGenerate(false)}
          />
        )}
      </AdminLayout>
    </RouteGuard>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <OnboardingPageInner />
    </Suspense>
  );
}
