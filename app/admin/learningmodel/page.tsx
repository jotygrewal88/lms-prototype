"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getCurrentUser, getCourses, subscribe } from "@/lib/store";
import HistoryTab from "@/components/admin/learningmodel/HistoryTab";
import SettingsTab from "@/components/admin/learningmodel/SettingsTab";

type Tab = "history" | "settings";

export default function LearningModelPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [aiDraftCount, setAiDraftCount] = useState(0);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    const refresh = () => {
      const courses = getCourses();
      setAiDraftCount(courses.filter((c) => c.status === "ai-draft" || c.status === "in-review").length);
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "history", label: "History" },
    { id: "settings", label: "Settings" },
  ];

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
            AI generation history and synthesis configuration
          </p>
        </div>

        {/* Quick-action card */}
        <Card className="mb-6 p-5 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Generate a New Course</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 max-w-lg">
                Use AI to build training from your library sources, skills data, and compliance context.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => router.push("/admin/courses/generate")}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Course
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {aiDraftCount > 0 && (
                  <button
                    onClick={() => router.push("/admin/courses")}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    <BookOpen className="w-4 h-4" />
                    {aiDraftCount} draft{aiDraftCount !== 1 ? "s" : ""} pending review
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </AdminLayout>
  );
}
