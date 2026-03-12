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
  Archive,
  RotateCcw,
  X as XIcon,
  Check,
  Users,
  MoreVertical,
  Download,
} from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  getOnboardingPathById,
  getOnboardingAssignmentsByPathId,
  getJobTitleById,
  getActiveSkillsV2,
  getLibraryItems,
  getUser,
  deleteOnboardingPath,
  updateOnboardingPath,
  archiveOnboardingPath,
  getCurrentUser,
} from "@/lib/store";
import { getFullName } from "@/types";
import { useRouter } from "next/navigation";
import PublishConfirmModal from "./PublishConfirmModal";

export default function PathPreview({
  pathId,
  onBack,
}: {
  pathId: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [showPublish, setShowPublish] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState(0);
  const [editInstructions, setEditInstructions] = useState("");

  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhaseDesc, setEditPhaseDesc] = useState("");
  const [editPhaseTimeline, setEditPhaseTimeline] = useState("");

  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseMinutes, setEditCourseMinutes] = useState(0);
  const [editCourseScore, setEditCourseScore] = useState<number | undefined>(undefined);

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

  const sourceUsage: Record<string, number> = {};
  for (const ph of path.phases) {
    for (const c of ph.courses) {
      for (const sid of c.sourceAttributions) {
        sourceUsage[sid] = (sourceUsage[sid] || 0) + 1;
      }
    }
  }

  const openEditModal = () => {
    setEditTitle(path.title);
    setEditDescription(path.description);
    setEditDuration(path.durationDays);
    setEditInstructions(path.additionalInstructions || "");
    setShowEditModal(true);
  };

  const saveMetadata = () => {
    updateOnboardingPath(pathId, {
      title: editTitle,
      description: editDescription,
      durationDays: editDuration,
      additionalInstructions: editInstructions || undefined,
    });
    setShowEditModal(false);
  };

  const startEditPhase = (phaseId: string) => {
    const phase = path.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    setEditPhaseName(phase.name);
    setEditPhaseDesc(phase.description);
    setEditPhaseTimeline(phase.timeline);
    setEditingPhaseId(phaseId);
    setEditingCourseId(null);
  };

  const savePhase = () => {
    if (!editingPhaseId) return;
    const newPhases = path.phases.map((p) =>
      p.id === editingPhaseId ? { ...p, name: editPhaseName, description: editPhaseDesc, timeline: editPhaseTimeline } : p
    );
    updateOnboardingPath(pathId, { phases: newPhases });
    setEditingPhaseId(null);
  };

  const startEditCourse = (courseId: string) => {
    for (const ph of path.phases) {
      const course = ph.courses.find((c) => c.id === courseId);
      if (course) {
        setEditCourseTitle(course.title);
        setEditCourseMinutes(course.estimatedMinutes);
        setEditCourseScore(course.passingScore);
        setEditingCourseId(courseId);
        setEditingPhaseId(null);
        return;
      }
    }
  };

  const saveCourse = () => {
    if (!editingCourseId) return;
    const newPhases = path.phases.map((ph) => ({
      ...ph,
      courses: ph.courses.map((c) =>
        c.id === editingCourseId
          ? { ...c, title: editCourseTitle, estimatedMinutes: editCourseMinutes, passingScore: editCourseScore }
          : c
      ),
    }));
    updateOnboardingPath(pathId, { phases: newPhases });
    setEditingCourseId(null);
  };

  return (
    <div>
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

          {/* Edit + Overflow — top right */}
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={openEditModal} className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <div className="relative">
              <button
                onClick={() => setOverflowOpen(!overflowOpen)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {overflowOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOverflowOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
                    <button
                      onClick={() => { setOverflowOpen(false); alert("PDF download will be available in the next release."); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    {path.status === "published" && (
                      <button
                        onClick={() => { setOverflowOpen(false); archiveOnboardingPath(path.id); onBack(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    )}
                    {path.status === "archived" && (
                      <button
                        onClick={() => { setOverflowOpen(false); updateOnboardingPath(path.id, { status: "draft" }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore to Draft
                      </button>
                    )}
                    {path.status === "draft" && (
                      <button
                        onClick={() => { setOverflowOpen(false); if (confirm("Delete this draft?")) { deleteOnboardingPath(path.id); onBack(); } }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
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

        {/* Status actions */}
        {path.status === "draft" && (
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setShowPublish(true)}>
              <CheckCircle2 className="w-4 h-4" />
              Approve & Publish
            </Button>
          </div>
        )}
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
          <p className="text-xs text-gray-500 mt-3">
            Add sources for uncovered skills in Learning Model, then regenerate this path.
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

      {/* Assignments */}
      {(() => {
        const assignments = getOnboardingAssignmentsByPathId(pathId);
        const activeCount = assignments.filter((a) => a.status === "active").length;
        const completedCount = assignments.filter((a) => a.status === "completed").length;
        const cancelledCount = assignments.filter((a) => a.status === "cancelled").length;

        return (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              Assignments
            </h2>

            {assignments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{assignments.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{activeCount}</p>
                  <p className="text-xs text-blue-600">Active</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{completedCount}</p>
                  <p className="text-xs text-emerald-600">Completed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-500">{cancelledCount}</p>
                  <p className="text-xs text-gray-400">Cancelled</p>
                </div>
              </div>
            )}

            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No assignments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((a) => {
                      const user = getUser(a.userId);
                      if (!user) return null;
                      const totalCrs = a.phaseProgress.reduce((s, p) => s + p.coursesTotal, 0);
                      const doneCrs = a.phaseProgress.reduce((s, p) => s + p.coursesCompleted, 0);
                      const pct = totalCrs > 0 ? Math.round((doneCrs / totalCrs) * 100) : 0;

                      const statusVariant: Record<string, "success" | "info" | "default" | "error"> = {
                        active: "info", completed: "success", cancelled: "default",
                      };
                      const statusLabel: Record<string, string> = {
                        active: "Active", completed: "Completed", cancelled: "Cancelled",
                      };

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/admin/users/${a.userId}`)}
                        >
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{getFullName(user)}</td>
                          <td className="px-4 py-2.5 text-sm">
                            <Badge variant={statusVariant[a.status] || "default"}>{statusLabel[a.status] || a.status}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">
                            {new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                                <div
                                  className={`h-full rounded-full ${a.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">
                            {a.completedAt ? new Date(a.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Phase Timeline */}
      {path.phases.map((phase, phIdx) => (
        <div key={phase.id} className="mb-8">
          {/* Phase header */}
          <div className="bg-gray-100 border border-gray-200 rounded-t-lg px-5 py-3">
            {editingPhaseId === phase.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Phase Name</label>
                    <input
                      type="text"
                      value={editPhaseName}
                      onChange={(e) => setEditPhaseName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Timeline</label>
                    <input
                      type="text"
                      value={editPhaseTimeline}
                      onChange={(e) => setEditPhaseTimeline(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Description</label>
                  <textarea
                    value={editPhaseDesc}
                    onChange={(e) => setEditPhaseDesc(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={savePhase} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button onClick={() => setEditingPhaseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                    <XIcon className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Phase {phIdx + 1}: {phase.timeline} — {phase.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
                </div>
                <button
                  onClick={() => startEditPhase(phase.id)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit phase"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Course cards */}
          <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-100">
            {phase.courses.map((course) => (
              <div key={course.id} className="p-5">
                {editingCourseId === course.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-0.5">Course Title</label>
                        <input
                          type="text"
                          value={editCourseTitle}
                          onChange={(e) => setEditCourseTitle(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Minutes</label>
                          <input
                            type="number"
                            value={editCourseMinutes}
                            onChange={(e) => setEditCourseMinutes(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Pass %</label>
                          <input
                            type="number"
                            value={editCourseScore ?? ""}
                            onChange={(e) => setEditCourseScore(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="—"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={saveCourse} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditingCourseId(null)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <XIcon className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      <button
                        onClick={() => startEditCourse(course.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit course"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

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

                    {course.sourceAttributions.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2">
                        Sources: {course.sourceAttributions.map((sid) => getSourceTitle(sid)).join(", ")}
                      </p>
                    )}

                    {course.passingScore && (
                      <p className="text-xs text-gray-500 mb-2">
                        Assessment: Certification Quiz — {course.passingScore}% passing score
                      </p>
                    )}

                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-600">Lessons:</p>
                      {course.lessons.map((lesson, li) => (
                        <p key={li} className="text-xs text-gray-500 ml-3">
                          {li + 1}. {lesson.title} ({lesson.estimatedMinutes} min)
                          {lesson.isAssessment && (
                            <span className="ml-1 text-gray-400 text-[10px]">Assessment</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </>
                )}
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

      {/* Edit Metadata Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl max-w-lg w-full shadow-xl p-6">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Onboarding Path</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</label>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  rows={2}
                  placeholder="Any extra guidance for this path..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveMetadata}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
