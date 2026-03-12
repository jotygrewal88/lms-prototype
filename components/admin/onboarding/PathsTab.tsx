"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Eye,
  Archive,
  Copy,
  Trash2,
  ArrowRight,
  FileText,
  Pencil,
  CheckCircle2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import {
  getOnboardingPaths,
  getJobTitles,
  getJobTitleById,
  deleteOnboardingPath,
  archiveOnboardingPath,
  publishOnboardingPath,
  getCurrentUser,
} from "@/lib/store";

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
  const currentUser = getCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "draft" | "published" | "archived">("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [openMenuId]);

  const departments = useMemo(
    () => Array.from(new Set(jobTitles.map((jt) => jt.department).filter(Boolean))).sort(),
    [jobTitles]
  );

  const uncoveredJTs = jobTitles.filter(
    (jt) => !paths.some((p) => p.jobTitleId === jt.id && p.status === "published")
  );

  const draftPaths = paths.filter((p) => p.status === "draft");

  const filteredPaths = useMemo(() => {
    return paths.filter((p) => {
      const jt = getJobTitleById(p.jobTitleId);
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterDepartment && jt?.department !== filterDepartment) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(q);
        const jtMatch = jt?.name.toLowerCase().includes(q);
        if (!titleMatch && !jtMatch) return false;
      }
      return true;
    });
  }, [paths, searchQuery, filterStatus, filterDepartment]);

  const hasActiveFilters = searchQuery || filterStatus || filterDepartment;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterDepartment("");
  };

  const courseCount = (p: (typeof paths)[0]) =>
    p.phases.reduce((s, ph) => s + ph.courses.length, 0);

  const handleApproveAll = () => {
    if (!confirm(`Publish ${draftPaths.length} onboarding paths? This will make them available for assignment.`)) return;
    for (const p of draftPaths) {
      publishOnboardingPath(p.id, currentUser.id);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "published") return "Published";
    if (status === "draft") return "Draft";
    return "Archived";
  };

  const getStatusVariant = (status: string): "success" | "info" | "default" => {
    if (status === "published") return "success";
    if (status === "draft") return "info";
    return "default";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
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

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Title or job title..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredPaths.length} of {paths.length} paths</span>
            <button onClick={clearFilters} className="text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Empty state */}
      {paths.length === 0 && uncoveredJTs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No onboarding paths yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by generating your first onboarding path.</p>
            <div className="mt-6">
              <Button variant="primary" onClick={() => onGenerate()}>
                Generate your first onboarding path
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPaths.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                      No paths match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPaths.map((path) => {
                    const jt = getJobTitleById(path.jobTitleId);
                    const courses = courseCount(path);
                    const totalSkills = path.skillsCovered.length + path.skillsGap.length;
                    const coveragePct = totalSkills > 0 ? Math.round((path.skillsCovered.length / totalSkills) * 100) : 100;

                    return (
                      <tr
                        key={path.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onPreview(path.id)}
                      >
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{path.title}</div>
                          {jt && <div className="text-xs text-gray-500">{jt.name}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {jt?.department || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {path.durationDays} days
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {courses}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {path.skillsCovered.length}/{totalSkills} ({coveragePct}%)
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${getConfidenceColor(path.confidenceScore)}`}>
                            {path.confidenceScore}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getStatusVariant(path.status)}>
                            {getStatusLabel(path.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === path.id ? null : path.id);
                              }}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenuId === path.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    onPreview(path.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Preview
                                </button>
                                {(path.status === "draft" || path.status === "published") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      onPreview(path.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                  </button>
                                )}
                                {path.status === "draft" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        onGenerate(path.jobTitleId);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      Regenerate
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        publishOnboardingPath(path.id, currentUser.id);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Publish
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        if (confirm("Delete this draft?")) deleteOnboardingPath(path.id);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete
                                    </button>
                                  </>
                                )}
                                {path.status === "published" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        onGenerate(path.jobTitleId);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        archiveOnboardingPath(path.id);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                      Archive
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Uncovered job titles nudge */}
      {uncoveredJTs.length > 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-5 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-700">No onboarding path for: </span>
            {uncoveredJTs.map((jt) => jt.name).join(", ")}
          </p>
          <button
            onClick={() => (onBatchGenerate ? onBatchGenerate() : onGenerate())}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-800"
          >
            Generate paths for these roles
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
