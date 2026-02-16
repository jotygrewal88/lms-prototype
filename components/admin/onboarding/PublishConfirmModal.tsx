"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import Button from "@/components/Button";
import {
  publishOnboardingPath,
  getJobTitleById,
  getActiveSkillsV2,
  getCurrentUser,
} from "@/lib/store";
import type { OnboardingPath } from "@/types";

export default function PublishConfirmModal({
  path,
  onClose,
  onPublished,
}: {
  path: OnboardingPath;
  onClose: () => void;
  onPublished: () => void;
}) {
  const jt = getJobTitleById(path.jobTitleId);
  const allSkills = getActiveSkillsV2();
  const currentUser = getCurrentUser();
  const totalCourses = path.phases.reduce((s, p) => s + p.courses.length, 0);
  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;

  const handlePublish = () => {
    publishOnboardingPath(path.id, currentUser.id);
    onPublished();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-lg w-full shadow-xl p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Onboarding Path</h2>

        <p className="text-sm text-gray-600 mb-4">
          Publishing &ldquo;{path.title}&rdquo; will:
        </p>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>Create {totalCourses} courses in your course library</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>Link courses to {path.skillsCovered.length} skills (auto-granted on completion)</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>
              Set phased due dates when assigned (
              {path.phases.map((p) => p.timeline).join(", ")})
            </span>
          </div>
          {jt && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
              <span>Link this path to the &ldquo;{jt.name}&rdquo; job title</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>Auto-offer to new hires assigned this job title</span>
          </div>
        </div>

        {path.skillsGap.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mb-5">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {path.skillsGap.length} skill gap{path.skillsGap.length !== 1 ? "s" : ""} remain
              </p>
              <p className="text-xs mt-0.5">
                {path.skillsGap.map((id) => getSkillName(id)).join(", ")} — these will need
                training assigned separately.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePublish}>
            Publish Path
          </Button>
        </div>
      </div>
    </div>
  );
}
