"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Users,
  Zap,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Rocket,
} from "lucide-react";
import Button from "@/components/Button";
import {
  getUsersByJobTitle,
  getUserSkillGapsByJobTitle,
  getActiveSkillsV2,
  getActiveUserSkillRecordsByUserId,
} from "@/lib/store";
import type { JobTitle, SkillPriority } from "@/types";

interface JobTitleDetailViewProps {
  jobTitle: JobTitle;
  onBack: () => void;
  onEdit: () => void;
}

const PRIORITY_DOT: Record<SkillPriority, string> = {
  critical: "bg-red-500",
  high: "bg-yellow-400",
  medium: "bg-orange-400",
  low: "bg-green-400",
};

const PRIORITY_LABEL: Record<SkillPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function JobTitleDetailView({ jobTitle, onBack, onEdit }: JobTitleDetailViewProps) {
  const router = useRouter();
  const allSkills = getActiveSkillsV2();
  const employees = getUsersByJobTitle(jobTitle.id);

  const getSkillName = (skillId: string) =>
    allSkills.find((s) => s.id === skillId)?.name || skillId;

  const getSkillType = (skillId: string) =>
    allSkills.find((s) => s.id === skillId)?.type;

  // Compute per-skill team status
  const skillTeamStatus = useMemo(() => {
    const status: Record<string, { have: number; total: number }> = {};
    for (const req of jobTitle.requiredSkills) {
      status[req.skillId] = { have: 0, total: employees.length };
    }
    for (const emp of employees) {
      const records = getActiveUserSkillRecordsByUserId(emp.id);
      const activeIds = new Set(records.map((r) => r.skillId));
      for (const req of jobTitle.requiredSkills) {
        if (activeIds.has(req.skillId)) {
          status[req.skillId].have++;
        }
      }
    }
    return status;
  }, [jobTitle, employees]);

  // Compute per-employee compliance
  const employeeCompliance = useMemo(() => {
    return employees.map((emp) => {
      const gaps = getUserSkillGapsByJobTitle(emp.id);
      const missing = gaps
        ? gaps.gaps.map((g) => getSkillName(g.skillId))
        : [];
      return {
        user: emp,
        compliancePct: gaps?.compliancePct ?? 0,
        missingSkills: missing,
      };
    });
  }, [employees, jobTitle]);

  const avgCompliance =
    employeeCompliance.length > 0
      ? Math.round(
          employeeCompliance.reduce((sum, e) => sum + e.compliancePct, 0) /
            employeeCompliance.length
        )
      : 100;

  const employeesWithGaps = employeeCompliance.filter((e) => e.compliancePct < 100).length;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Titles
        </button>
        <Button variant="secondary" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{jobTitle.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {jobTitle.department} &bull; {jobTitle.site}
        </p>
        {jobTitle.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-2xl">
            {jobTitle.description}
          </p>
        )}
      </div>

      {/* Required Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            Required Skills ({jobTitle.requiredSkills.length})
          </h3>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium">Skill</th>
                <th className="text-left px-4 py-3 font-medium w-24">Priority</th>
                <th className="text-left px-4 py-3 font-medium w-28">Timeline</th>
                <th className="text-left px-4 py-3 font-medium w-40">Team Status</th>
              </tr>
            </thead>
            <tbody>
              {jobTitle.requiredSkills
                .sort(
                  (a, b) =>
                    ["critical", "high", "medium", "low"].indexOf(a.priority) -
                    ["critical", "high", "medium", "low"].indexOf(b.priority)
                )
                .map((req) => {
                  const team = skillTeamStatus[req.skillId];
                  const missing = team ? team.total - team.have : 0;
                  const isCert = getSkillType(req.skillId) === "certification";
                  return (
                    <tr key={req.skillId} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${PRIORITY_DOT[req.priority]}`}
                          />
                          {getSkillName(req.skillId)}
                          {isCert && <Zap className="w-3 h-3 text-yellow-500" />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{PRIORITY_LABEL[req.priority]}</td>
                      <td className="px-4 py-3 text-gray-600">Within {req.targetTimelineDays}d</td>
                      <td className="px-4 py-3">
                        {employees.length === 0 ? (
                          <span className="text-gray-400 text-xs">No employees</span>
                        ) : missing > 0 ? (
                          <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            {missing} of {team.total} missing
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            All {team.total} have it
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employees Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Employees ({employees.length})
        </h3>
        {employees.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
            No employees assigned to this job title.
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left px-4 py-3 font-medium">Employee</th>
                    <th className="text-left px-4 py-3 font-medium w-36">Compliance</th>
                    <th className="text-left px-4 py-3 font-medium">Missing Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeCompliance.map(({ user, compliancePct, missingSkills }) => (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {user.firstName} {user.lastName}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${
                                compliancePct === 100
                                  ? "bg-green-500"
                                  : compliancePct >= 70
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${compliancePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8">
                            {compliancePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {missingSkills.length > 0 ? missingSkills.join(", ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-sm text-gray-600 flex items-center gap-4">
              <span>
                Team compliance: <strong>{avgCompliance}%</strong> average
              </span>
              {employeesWithGaps > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {employeesWithGaps} of {employees.length} employee{employees.length !== 1 ? "s" : ""} have gaps
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Onboarding Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Onboarding</h3>
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          {jobTitle.onboardingPathId ? (
            <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Onboarding path published
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                No onboarding path configured for this job title.
              </p>
              <Button
                variant="primary"
                onClick={() =>
                  router.push(
                    `/admin/learningmodel?tab=onboarding&jobTitleId=${jobTitle.id}`
                  )
                }
              >
                <Rocket className="w-4 h-4" />
                Generate Onboarding Path
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Automatically creates a phased training plan based on the required skills above.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
