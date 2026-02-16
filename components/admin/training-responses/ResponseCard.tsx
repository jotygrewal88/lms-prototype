"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Badge from "@/components/Badge";
import { getUser, getSkillV2ById } from "@/lib/store";
import { getFullName } from "@/types";
import type { TrainingResponse } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  incident_retraining: "Incident Retraining",
  corrective_training: "Corrective Training",
  near_miss_briefing: "Near-Miss Briefing",
  regulatory_update: "Regulatory Update",
  delta_renewal: "Delta Renewal",
  rebuilt_renewal: "Full Rebuild",
  clean_renewal: "Clean Renewal",
  path_refresh: "Path Refresh",
  role_change_gap: "Role Change Gap",
  new_equipment_process: "New Equipment/Process",
};

const URGENCY_VARIANTS: Record<string, "error" | "warning" | "info" | "default"> = {
  immediate: "error",
  urgent: "warning",
  standard: "info",
  blocking: "error",
};

const STATUS_VARIANTS: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  draft: "default",
  approved: "info",
  assigned: "warning",
  completed: "success",
  rejected: "error",
};

export default function ResponseCard({ response }: { response: TrainingResponse }) {
  const completedTargets = response.targets.filter((t) => t.status === "completed").length;
  const totalTargets = response.targets.length;
  const progressPct = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

  const skillNames = response.affectedSkillIds
    .map((id) => getSkillV2ById(id)?.name || id)
    .join(", ");

  const targetPreview = response.targetUserIds
    .slice(0, 3)
    .map((uid) => {
      const u = getUser(uid);
      return u ? getFullName(u) : uid;
    });
  const extraTargets = response.targetUserIds.length - 3;

  return (
    <Link href={`/admin/training-responses/${response.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        {/* Top row: badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant={URGENCY_VARIANTS[response.urgency] || "default"}>
            {response.urgency.toUpperCase()}
          </Badge>
          <Badge variant="default">{TYPE_LABELS[response.type] || response.type}</Badge>
          <Badge variant={STATUS_VARIANTS[response.status] || "default"}>
            {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
          </Badge>
          <span className="ml-auto text-xs text-gray-400">
            {new Date(response.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{response.title}</h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {response.targetUserIds.length} user{response.targetUserIds.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {response.totalEstimatedMinutes} min
          </span>
          {response.assessmentRequired && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Assessment
            </span>
          )}
          {response.deadline && (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              Due{" "}
              {new Date(response.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Progress bar for assigned responses */}
        {response.status === "assigned" && totalTargets > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>
                {completedTargets} of {totalTargets} completed
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom: skill impact + users + arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-gray-400" />
              {skillNames}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}
