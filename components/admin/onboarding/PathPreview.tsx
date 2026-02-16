"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Zap,
  Pencil,
  Trash2,
} from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  getOnboardingPathById,
  getJobTitleById,
  getActiveSkillsV2,
  getLibraryItems,
  deleteOnboardingPath,
  getCurrentUser,
} from "@/lib/store";
import PublishConfirmModal from "./PublishConfirmModal";

export default function PathPreview({
  pathId,
  onBack,
}: {
  pathId: string;
  onBack: () => void;
}) {
  const [showPublish, setShowPublish] = useState(false);
  const path = getOnboardingPathById(pathId);
  const allSkills = getActiveSkillsV2();
  const allSources = getLibraryItems();

  if (!path) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Onboarding path not found.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
          Back to Paths
        </button>
      </div>
    );
  }

  const jt = getJobTitleById(path.jobTitleId);
  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;
  const getSourceTitle = (id: string) => allSources.find((s) => s.id === id)?.title || id;
  const totalCourses = path.phases.reduce((s, p) => s + p.courses.length, 0);
  const totalSkills = path.skillsCovered.length + path.skillsGap.length;
  const coveragePct = totalSkills > 0 ? Math.round((path.skillsCovered.length / totalSkills) * 100) : 100;

  // Source usage counts
  const sourceUsage: Record<string, number> = {};
  for (const ph of path.phases) {
    for (const c of ph.courses) {
      for (const sid of c.sourceAttributions) {
        sourceUsage[sid] = (sourceUsage[sid] || 0) + 1;
      }
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Onboarding Paths
      </button>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{path.title}</h1>
              <Badge
                variant={path.status === "published" ? "success" : path.status === "draft" ? "info" : "default"}
              >
                {path.status === "published" ? "Published" : path.status === "draft" ? "Draft" : "Archived"}
              </Badge>
            </div>
            {jt && (
              <p className="text-sm text-gray-500">
                {jt.department} &bull; {jt.site}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{path.description}</p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600 mb-5">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {path.durationDays} Days
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            {(path.totalEstimatedMinutes / 60).toFixed(1)} Hours Total
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-gray-400" />
            {totalCourses} Courses
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-gray-400" />
            {path.skillsCovered.length}/{totalSkills} Skills ({coveragePct}%)
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400" />
            {path.confidenceScore}% Confidence
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {path.status === "draft" && (
            <>
              <Button variant="primary" onClick={() => setShowPublish(true)}>
                <CheckCircle2 className="w-4 h-4" />
                Approve & Publish
              </Button>
              <Button variant="secondary" onClick={() => { if (confirm("Delete this draft?")) { deleteOnboardingPath(path.id); onBack(); } }}>
                <Trash2 className="w-4 h-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Skills Coverage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Skills Coverage</h2>
        <div className="space-y-2">
          {path.skillsCovered.map((skillId) => {
            const phase = path.phases.find((ph) =>
              ph.courses.some((c) => c.skillsGranted.includes(skillId))
            );
            return (
              <div key={skillId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {getSkillName(skillId)}
                </span>
                <span className="text-gray-500">
                  {phase?.name} — {phase?.timeline}
                </span>
              </div>
            );
          })}
          {path.skillsGap.map((skillId) => (
            <div key={skillId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {getSkillName(skillId)}
              </span>
              <span className="text-amber-600 text-xs">NOT COVERED — no source found</span>
            </div>
          ))}
        </div>
        {path.skillsGap.length > 0 && (
          <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
            <span>Add sources for uncovered skills in Learning Model → Sources, then regenerate this path.</span>
          </p>
        )}
      </div>

      {/* Source Attribution */}
      {Object.keys(sourceUsage).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Source Attribution</h2>
          <div className="space-y-2">
            {Object.entries(sourceUsage).map(([sid, count]) => (
              <div key={sid} className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>{getSourceTitle(sid)}</span>
                <span className="text-gray-400">— used in {count} course{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Timeline */}
      {path.phases.map((phase, phIdx) => (
        <div key={phase.id} className="mb-8">
          {/* Phase header */}
          <div className="bg-gray-100 border border-gray-200 rounded-t-lg px-5 py-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Phase {phIdx + 1}: {phase.timeline} — {phase.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
          </div>

          {/* Course cards */}
          <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-100">
            {phase.courses.map((course) => (
              <div key={course.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {course.category} &bull; {course.estimatedMinutes} min &bull;{" "}
                      {course.lessons.length} lesson{course.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Skills earned */}
                {course.skillsGranted.length > 0 && (
                  <p className="text-xs text-gray-600 mb-2">
                    → Earns:{" "}
                    {course.skillsGranted.map((sid, i) => (
                      <span key={sid}>
                        {i > 0 && ", "}
                        <span className="font-medium">{getSkillName(sid)}</span>
                        {allSkills.find((s) => s.id === sid)?.type === "certification" && (
                          <Zap className="w-3 h-3 inline ml-0.5 text-yellow-500" />
                        )}
                      </span>
                    ))}
                  </p>
                )}

                {/* Sources */}
                {course.sourceAttributions.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Sources: {course.sourceAttributions.map((sid) => getSourceTitle(sid)).join(", ")}
                  </p>
                )}

                {/* Passing score */}
                {course.passingScore && (
                  <p className="text-xs text-gray-500 mb-2">
                    Assessment: Certification Quiz — {course.passingScore}% passing score
                  </p>
                )}

                {/* Lessons */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-600">Lessons:</p>
                  {course.lessons.map((lesson, li) => (
                    <p key={li} className="text-xs text-gray-500 ml-3">
                      {li + 1}. {lesson.title} ({lesson.estimatedMinutes} min)
                      {lesson.isAssessment && (
                        <Pencil className="w-3 h-3 inline ml-1 text-gray-400" />
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Publish modal */}
      {showPublish && (
        <PublishConfirmModal
          path={path}
          onClose={() => setShowPublish(false)}
          onPublished={onBack}
        />
      )}
    </div>
  );
}
