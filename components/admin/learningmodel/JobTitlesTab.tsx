"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  GraduationCap,
} from "lucide-react";
import Button from "@/components/Button";
import {
  getJobTitles,
  getUsersByJobTitle,
  getUserSkillGapsByJobTitle,
  getActiveSkillsV2,
  subscribe,
} from "@/lib/store";
import type { JobTitle, SkillPriority } from "@/types";
import JobTitleDetailView from "./JobTitleDetailView";
import JobTitleModal from "./JobTitleModal";

export default function JobTitlesTab() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingJT, setEditingJT] = useState<JobTitle | undefined>();
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setJobTitles(getJobTitles());
      setTick((t) => t + 1);
    };
    refresh();
    return subscribe(refresh);
  }, []);

  const allSkills = getActiveSkillsV2();
  const getSkillName = (skillId: string) =>
    allSkills.find((s) => s.id === skillId)?.name || skillId;
  const getSkillType = (skillId: string) =>
    allSkills.find((s) => s.id === skillId)?.type;

  const filtered = useMemo(() => {
    if (!search) return jobTitles;
    const q = search.toLowerCase();
    return jobTitles.filter(
      (jt) =>
        jt.name.toLowerCase().includes(q) ||
        jt.department.toLowerCase().includes(q) ||
        jt.site.toLowerCase().includes(q)
    );
  }, [jobTitles, search]);

  // If a job title is selected, show the detail view
  const selectedJT = selectedId ? jobTitles.find((jt) => jt.id === selectedId) : null;
  if (selectedJT) {
    return (
      <>
        <JobTitleDetailView
          jobTitle={selectedJT}
          onBack={() => setSelectedId(null)}
          onEdit={() => {
            setEditingJT(selectedJT);
            setShowModal(true);
          }}
        />
        {showModal && (
          <JobTitleModal
            editJobTitle={editingJT}
            onClose={() => {
              setShowModal(false);
              setEditingJT(undefined);
            }}
            onSaved={() => {
              setShowModal(false);
              setEditingJT(undefined);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Job Titles</h2>
        <p className="text-sm text-gray-500">
          Define roles in your organization and the skills each one requires
        </p>
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job titles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingJT(undefined);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Job Title
        </Button>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          {search ? "No job titles match your search." : "No job titles created yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((jt) => (
            <JobTitleCard
              key={jt.id}
              jobTitle={jt}
              getSkillName={getSkillName}
              getSkillType={getSkillType}
              onView={() => setSelectedId(jt.id)}
              onEdit={() => {
                setEditingJT(jt);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <JobTitleModal
          editJobTitle={editingJT}
          onClose={() => {
            setShowModal(false);
            setEditingJT(undefined);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingJT(undefined);
          }}
        />
      )}
    </div>
  );
}

/* ─── Job Title Card ────────────────────────────────────────────────────── */

function JobTitleCard({
  jobTitle,
  getSkillName,
  getSkillType,
  onView,
  onEdit,
}: {
  jobTitle: JobTitle;
  getSkillName: (id: string) => string;
  getSkillType: (id: string) => string | undefined;
  onView: () => void;
  onEdit: () => void;
}) {
  const employees = getUsersByJobTitle(jobTitle.id);

  // Compute average gaps
  const avgGaps = useMemo(() => {
    if (employees.length === 0) return 0;
    let totalGaps = 0;
    for (const emp of employees) {
      const result = getUserSkillGapsByJobTitle(emp.id);
      if (result) totalGaps += result.gaps.length;
    }
    return Math.round(totalGaps / employees.length);
  }, [employees, jobTitle]);

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors bg-white">
      {/* Name + Meta */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{jobTitle.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobTitle.department} &bull; {jobTitle.site}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-5 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          {employees.length} employee{employees.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4 text-gray-400" />
          {jobTitle.requiredSkills.length} required skill{jobTitle.requiredSkills.length !== 1 ? "s" : ""}
        </span>
        {employees.length > 0 && (
          <span className="flex items-center gap-1">
            {avgGaps > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600">{avgGaps} avg gap{avgGaps !== 1 ? "s" : ""}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-600">0 avg gaps</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Skill badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {jobTitle.requiredSkills.map((req) => {
          const isCert = getSkillType(req.skillId) === "certification";
          return (
            <span
              key={req.skillId}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {getSkillName(req.skillId)}
              {isCert && <Zap className="w-3 h-3 text-yellow-500" />}
            </span>
          );
        })}
      </div>

      {/* Onboarding status */}
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
        <GraduationCap className="w-3.5 h-3.5" />
        Onboarding:{" "}
        {jobTitle.onboardingPathId ? (
          <span className="text-green-600 font-medium flex items-center gap-0.5">
            Published <CheckCircle2 className="w-3 h-3" />
          </span>
        ) : (
          "Not configured"
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onView}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
        <button
          onClick={onEdit}
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
