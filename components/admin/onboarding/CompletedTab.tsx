"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Target,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  getCompletedOnboardingAssignments,
  getOnboardingPathById,
  getUser,
  getActiveSkillsV2,
  getUserSkillRecordsByUserId,
} from "@/lib/store";
import { getFullName } from "@/types";

export default function CompletedTab() {
  const assignments = getCompletedOnboardingAssignments();
  const allSkills = getActiveSkillsV2();
  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;
  const today = new Date();

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No completed onboarding assignments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Completed Onboarding</h2>
        <span className="text-sm text-gray-500">{assignments.length} completed</span>
      </div>

      {assignments.map((a) => {
        const path = getOnboardingPathById(a.pathId);
        const user = getUser(a.userId);
        if (!path || !user) return null;

        const startDate = new Date(a.startDate);
        const completedDate = a.completedAt ? new Date(a.completedAt) : null;
        const totalDays = completedDate
          ? Math.max(1, Math.ceil((completedDate.getTime() - startDate.getTime()) / 86400000))
          : path.durationDays;

        const userRecords = getUserSkillRecordsByUserId(a.userId);

        // Count certs expiring within 90 days
        const ninetyDaysMs = 90 * 86400000;
        const sixtyDaysMs = 60 * 86400000;
        let expiringCount = 0;
        for (const sid of a.skillsEarned) {
          const rec = userRecords.find((r) => r.skillId === sid && (r.status === "active" || r.status === "expired"));
          if (rec?.expiryDate) {
            const expMs = new Date(rec.expiryDate).getTime() - today.getTime();
            if (expMs < ninetyDaysMs) expiringCount++;
          }
        }

        return (
          <div
            key={a.id}
            className="border border-gray-200 rounded-lg p-5 bg-white"
          >
            {/* User + Path */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{getFullName(user)}</h3>
                <p className="text-sm text-gray-500">{path.title}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
                <span className="text-xs font-medium text-emerald-600">100%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {completedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Completed:{" "}
                  {completedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Finished in {totalDays} days
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {a.skillsEarned.length}/{path.skillsCovered.length} skills earned
              </span>
            </div>

            {/* Skills earned with expiry dates */}
            {a.skillsEarned.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {a.skillsEarned.map((sid) => {
                  const rec = userRecords.find((r) => r.skillId === sid && (r.status === "active" || r.status === "expired"));
                  let expiryLabel = "";
                  let expiryColor = "text-gray-400";

                  if (rec?.expiryDate) {
                    const expDate = new Date(rec.expiryDate);
                    const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / 86400000);
                    if (daysUntil < 0) {
                      expiryLabel = "Expired";
                      expiryColor = "text-red-600";
                    } else if (daysUntil <= 60) {
                      expiryLabel = `Expires ${expDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                      expiryColor = "text-amber-600";
                    } else {
                      expiryLabel = `Expires ${expDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                      expiryColor = "text-gray-400";
                    }
                  }

                  return (
                    <div key={sid} className="flex flex-col items-start">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {getSkillName(sid)}
                      </span>
                      {expiryLabel && (
                        <span className={`text-[10px] ml-2 mt-0.5 ${expiryColor}`}>
                          {expiryLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Next Steps */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {expiringCount > 0 ? (
                <p className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {expiringCount} certification{expiringCount !== 1 ? "s" : ""} expiring soon
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All certifications current
                </p>
              )}
            </div>

            {/* View Full Profile link */}
            <div className="mt-3">
              <Link
                href={`/admin/users/${a.userId}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full Profile
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
