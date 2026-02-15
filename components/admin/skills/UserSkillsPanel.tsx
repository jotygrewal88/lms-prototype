// Skills V2: User Skills management tab with filters
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Table from "@/components/Table";
import { getUserSkillRecords, getSkillV2ById, getActiveSkillsV2, getUsers, subscribe } from "@/lib/store";
import { getFullName } from "@/types";
import type { UserSkillRecord, UserSkillStatus, EvidenceType } from "@/types";

const STATUS_OPTIONS: { label: string; value: UserSkillStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  { label: "Pending", value: "pending" },
  { label: "Revoked", value: "revoked" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Certification", value: "certification" },
  { label: "Skill", value: "skill" },
];

const EVIDENCE_OPTIONS: { label: string; value: EvidenceType | "" }[] = [
  { label: "All Evidence", value: "" },
  { label: "Training", value: "training" },
  { label: "Course", value: "course" },
  { label: "Manual", value: "manual" },
  { label: "Import", value: "import" },
  { label: "Assessment", value: "assessment" },
];

export default function UserSkillsPanel() {
  const [records, setRecords] = useState<UserSkillRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [evidenceFilter, setEvidenceFilter] = useState("");

  useEffect(() => {
    const update = () => setRecords(getUserSkillRecords());
    update();
    return subscribe(update);
  }, []);

  const users = getUsers();

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const skill = getSkillV2ById(record.skillId);
      const user = users.find((u) => u.id === record.userId);
      if (!skill || !user) return false;

      // Search filter — matches user name or skill name
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = getFullName(user).toLowerCase().includes(q);
        const skillMatch = skill.name.toLowerCase().includes(q);
        if (!nameMatch && !skillMatch) return false;
      }

      // Status filter
      if (statusFilter && record.status !== statusFilter) return false;

      // Type filter (certification vs skill)
      if (typeFilter && skill.type !== typeFilter) return false;

      // Evidence type filter
      if (evidenceFilter && record.evidenceType !== evidenceFilter) return false;

      return true;
    });
  }, [records, users, searchQuery, statusFilter, typeFilter, evidenceFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "success" as const;
      case "expired": return "error" as const;
      case "pending": return "warning" as const;
      case "revoked": return "default" as const;
      default: return "default" as const;
    }
  };

  const hasActiveFilters = searchQuery || statusFilter || typeFilter || evidenceFilter;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Skill Records</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track which users have earned which skills and certifications
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user or skill name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Evidence */}
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {EVIDENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setTypeFilter("");
                setEvidenceFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result count */}
        {hasActiveFilters && (
          <p className="text-xs text-gray-500 mb-3">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        )}

        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No user skill records yet</p>
            <p className="text-sm">
              Skill records are created when trainings or courses are completed, or when manually granted.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No records match your filters.</p>
          </div>
        ) : (
          <Table
            headers={["User", "Skill", "Type", "Status", "Achieved", "Expiry", "Evidence"]}
          >
            {filteredRecords.map((record) => {
              const skill = getSkillV2ById(record.skillId);
              const user = users.find((u) => u.id === record.userId);
              if (!skill || !user) return null;

              return (
                <tr key={record.id}>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {getFullName(user)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{skill.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant={skill.type === "certification" ? "info" : "default"}>
                      {skill.type === "certification" ? "Certification" : "Skill"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.achievedDate || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.expiryDate || "No expiry"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.evidenceType}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
