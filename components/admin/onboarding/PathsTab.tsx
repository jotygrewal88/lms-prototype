"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  BookOpen,
  Target,
  Star,
  Users,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Copy,
  Eye,
  Trash2,
  ArrowRight,
  FileText,
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import PathRefreshModal from "./PathRefreshModal";
import {
  getOnboardingPaths,
  getOnboardingAssignmentsByPathId,
  getJobTitles,
  getJobTitleById,
  deleteOnboardingPath,
  archiveOnboardingPath,
  getActiveSkillsV2,
  publishOnboardingPath,
  getCurrentUser,
  getContentCurrency,
  getOperationalSignalById,
} from "@/lib/store";
import Link from "next/link";
import type { OnboardingPath } from "@/types";

const PRIORITY_DOTS: Record<string, { dot: string; label: string }> = {
  critical: { dot: "bg-red-500", label: "CRITICAL" },
  high: { dot: "bg-amber-500", label: "HIGH" },
  medium: { dot: "bg-orange-400", label: "MEDIUM" },
  low: { dot: "bg-gray-400", label: "LOW" },
};

export default function PathsTab({
  onGenerate,
  onPreview,
  onBatchGenerate,
}: {
  onGenerate: (jtId?: string) => void;
  onPreview: (pathId: string) => void;
  onBatchGenerate?: () => void;
}) {
  const paths = getOnboardingPaths();
  const jobTitles = getJobTitles().filter((jt) => jt.active);
  const allSkills = getActiveSkillsV2();
  const currentUser = getCurrentUser();
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());
  const [refreshPath, setRefreshPath] = useState<OnboardingPath | null>(null);

  const uncoveredJTs = jobTitles.filter(
    (jt) => !paths.some((p) => p.jobTitleId === jt.id && p.status === "published")
  );

  const draftPaths = paths.filter((p) => p.status === "draft");

  const courseCount = (p: typeof paths[0]) =>
    p.phases.reduce((s, ph) => s + ph.courses.length, 0);

  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;

  const toggleGap = (pathId: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(pathId)) next.delete(pathId);
      else next.add(pathId);
      return next;
    });
  };

  const handleApproveAll = () => {
    if (!confirm(`Publish ${draftPaths.length} onboarding paths? This will make them available for assignment.`)) return;
    for (const p of draftPaths) {
      publishOnboardingPath(p.id, currentUser.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Onboarding Paths</h2>
        <Button variant="primary" onClick={() => onGenerate()}>
          <Plus className="w-4 h-4" />
          Generate New Path
        </Button>
      </div>

      {/* Batch action bar */}
      {draftPaths.length > 1 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800 font-medium">
            {draftPaths.length} draft paths pending review
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreview(draftPaths[0].id)}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              Review All
            </button>
            <button
              onClick={handleApproveAll}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Approve All
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {paths.length === 0 && uncoveredJTs.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No onboarding paths yet.</p>
          <Button variant="primary" onClick={() => onGenerate()}>
            Generate your first onboarding path
          </Button>
        </div>
      )}

      {/* Path cards */}
      {paths.map((path) => {
        const jt = getJobTitleById(path.jobTitleId);
        const activeAssignments = getOnboardingAssignmentsByPathId(path.id).filter(
          (a) => a.status === "active"
        );
        const courses = courseCount(path);
        const gapExpanded = expandedGaps.has(path.id);

        return (
          <div
            key={path.id}
            className="border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition-colors"
          >
            {/* Title + Status */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{path.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {jt?.department || "—"} &bull; {jt?.site || "—"}
                </p>
              </div>
              <Badge
                variant={
                  path.status === "published"
                    ? "success"
                    : path.status === "draft"
                    ? "info"
                    : "default"
                }
              >
                {path.status === "published"
                  ? "Published"
                  : path.status === "draft"
                  ? "Draft"
                  : "Archived"}
              </Badge>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {path.durationDays} days
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-400" />
                {courses} course{courses !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4 text-gray-400" />
                {path.skillsCovered.length}/{path.skillsCovered.length + path.skillsGap.length} skills (
                {Math.round(
                  (path.skillsCovered.length /
                    (path.skillsCovered.length + path.skillsGap.length || 1)) *
                    100
                )}
                %)
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                {path.confidenceScore}% confidence
              </span>
              {(() => {
                const cur = getContentCurrency(path.id);
                if (!cur) return null;
                const s = cur.currentScore;
                const cls =
                  s >= 90
                    ? "bg-emerald-100 text-emerald-700"
                    : s >= 70
                    ? "bg-yellow-100 text-yellow-700"
                    : s >= 40
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700";
                const label =
                  s >= 90 ? "Current" : s >= 70 ? "Aging" : s >= 40 ? "Stale" : "Outdated";
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                    {s >= 90 ? "●" : s >= 70 ? "◐" : s >= 40 ? "◑" : "○"} {label}
                  </span>
                );
              })()}
              {activeAssignments.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  {activeAssignments.length} active assignment{activeAssignments.length !== 1 ? "s" : ""}
                </span>
              )}
              {path.skillsGap.length > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {path.skillsGap.length} skill gap{path.skillsGap.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Phase summary */}
            <div className="text-sm text-gray-500 mb-3">
              <span className="font-medium text-gray-700">Phases: </span>
              {path.phases.map((ph, i) => (
                <span key={ph.id}>
                  {i > 0 && " → "}
                  {ph.name}
                </span>
              ))}
            </div>

            {/* Skill Gap Callout */}
            {path.skillsGap.length > 0 && (
              <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-lg mb-3">
                <button
                  onClick={() => toggleGap(path.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Skill Gap Warning — {path.skillsGap.length} skill{path.skillsGap.length !== 1 ? "s" : ""} not covered
                  </span>
                  {gapExpanded ? (
                    <ChevronDown className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  )}
                </button>
                {gapExpanded && (
                  <div className="px-4 pb-3 space-y-2">
                    {path.skillsGap.map((skillId) => {
                      const req = jt?.requiredSkills.find((r) => r.skillId === skillId);
                      const priority = req?.priority || "medium";
                      const cfg = PRIORITY_DOTS[priority] || PRIORITY_DOTS.medium;
                      return (
                        <div key={skillId} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="font-medium text-gray-800 uppercase text-xs tracking-wide">{cfg.label}:</span>
                          <span className="text-gray-700">{getSkillName(skillId)}</span>
                        </div>
                      );
                    })}
                    <p className="text-xs text-amber-700 mt-2">
                      New hires on this path will not earn these skills. Add sources or courses to close gaps.
                    </p>
                    <button
                      onClick={() => onGenerate(path.jobTitleId)}
                      className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 mt-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Path
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Currency Alert */}
            {(() => {
              const cur = getContentCurrency(path.id);
              if (!cur || cur.currentScore >= 70) return null;
              return (
                <div className="border-l-4 border-red-400 bg-red-50 rounded-r-lg p-4 mb-3">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    ⚠ Content Currency Alert — Score: {cur.currentScore}/100
                  </p>
                  {cur.activeSignals.length > 0 && (
                    <div className="space-y-1 mb-2">
                      <p className="text-xs text-red-700">{cur.activeSignals.length} signal{cur.activeSignals.length !== 1 ? "s" : ""} affecting this path:</p>
                      {cur.activeSignals.map((as) => {
                        const sig = getOperationalSignalById(as.signalId);
                        return (
                          <p key={as.signalId} className="text-xs text-red-600 flex items-center gap-1">
                            <span>{as.signalType === "incident" ? "🔴" : as.signalType === "regulatory_change" ? "🟡" : "🟠"}</span>
                            {sig ? sig.title : as.signalType.replace(/_/g, " ")} (−{as.impact} pts)
                          </p>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-red-600 mb-2">
                    Recommended: Review and refresh this path before new assignments.
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/admin/signals"
                      className="text-xs font-medium text-red-700 hover:text-red-900 underline"
                    >
                      Review Signals
                    </Link>
                    <button
                      onClick={() => setRefreshPath(path)}
                      className="text-xs font-medium text-red-700 hover:text-red-900 underline"
                    >
                      Refresh Path
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Date */}
            <p className="text-xs text-gray-400 mb-4">
              {path.publishedAt
                ? `Published ${new Date(path.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : `Generated ${new Date(path.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPreview(path.id)}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>

              {path.status === "draft" && (
                <>
                  <button
                    onClick={() => onPreview(path.id)}
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this draft?")) deleteOnboardingPath(path.id);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              )}

              {path.status === "published" && (
                <>
                  <button
                    onClick={() => onGenerate(path.jobTitleId)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => archiveOnboardingPath(path.id)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Uncovered job titles nudge */}
      {uncoveredJTs.length > 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-5 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-700">No onboarding path for: </span>
            {uncoveredJTs.map((jt) => jt.name).join(", ")}
          </p>
          <button
            onClick={() => onBatchGenerate ? onBatchGenerate() : onGenerate()}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-800"
          >
            Generate paths for these roles
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {refreshPath && (
        <PathRefreshModal
          path={refreshPath}
          onClose={() => setRefreshPath(null)}
        />
      )}
    </div>
  );
}
