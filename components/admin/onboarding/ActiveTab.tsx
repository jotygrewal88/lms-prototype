"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  Target,
  Calendar,
  Users,
  MoreVertical,
  Send,
  CalendarClock,
  UserCircle,
  X as XIcon,
  Trash2,
} from "lucide-react";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import {
  getActiveOnboardingAssignments,
  getOnboardingPathById,
  getUser,
  getActiveSkillsV2,
  updateOnboardingAssignment,
  getContentCurrency,
} from "@/lib/store";
import { getFullName } from "@/types";
import type { OnboardingAssignment } from "@/types";

function daysBetween(a: string, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - new Date(a).getTime()) / 86400000));
}

export default function ActiveTab() {
  const assignments = getActiveOnboardingAssignments();
  const allSkills = getActiveSkillsV2();
  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;
  const today = new Date();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No employees are currently onboarding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Active Onboarding</h2>
        <span className="text-sm text-gray-500">{assignments.length} in progress</span>
      </div>

      {assignments.map((a) => (
        <AssignmentCard
          key={a.id}
          assignment={a}
          today={today}
          getSkillName={getSkillName}
          onToast={(msg) => { setToast({ message: msg, type: "success" }); setTimeout(() => setToast(null), 3000); }}
        />
      ))}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function AssignmentCard({
  assignment: a,
  today,
  getSkillName,
  onToast,
}: {
  assignment: OnboardingAssignment;
  today: Date;
  getSkillName: (id: string) => string;
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const path = getOnboardingPathById(a.pathId);
  const user = getUser(a.userId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [adjustedDeadline, setAdjustedDeadline] = useState<string | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineReason, setDeadlineReason] = useState("");

  if (!path || !user) return null;

  const userName = getFullName(user);
  const dayNum = daysBetween(a.startDate, today);
  const totalCompletedCourses = a.phaseProgress.reduce((s, p) => s + p.coursesCompleted, 0);
  const totalCourses = a.phaseProgress.reduce((s, p) => s + p.coursesTotal, 0);
  const progressPct = totalCourses > 0 ? Math.round((totalCompletedCourses / totalCourses) * 100) : 0;

  const currentPhase = a.phaseProgress.find((p) => p.status === "in_progress");
  const currentPathPhase = currentPhase
    ? path.phases.find((ph) => ph.id === currentPhase.phaseId)
    : null;

  // Enhanced behind schedule logic
  let behindSchedule = false;
  if (currentPathPhase) {
    if (dayNum > currentPathPhase.dayEnd) {
      behindSchedule = true;
    } else if (currentPhase && currentPhase.coursesCompleted === 0) {
      const daysSincePhaseStart = dayNum - currentPathPhase.dayStart + 1;
      const phaseDuration = currentPathPhase.dayEnd - currentPathPhase.dayStart + 1;
      if (daysSincePhaseStart > phaseDuration * 0.5) {
        behindSchedule = true;
      }
    }
  }

  const originalDeadline = new Date(new Date(a.startDate).getTime() + path.durationDays * 86400000);
  const displayDeadline = adjustedDeadline ? new Date(adjustedDeadline) : originalDeadline;

  let nextDueLabel = "";
  if (currentPathPhase) {
    const startDate = new Date(a.startDate);
    const dueDate = new Date(startDate.getTime() + currentPathPhase.dayEnd * 86400000);
    const nextCourse = currentPathPhase.courses[currentPhase!.coursesCompleted];
    if (nextCourse) {
      nextDueLabel = `${nextCourse.title} (${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    }
  }

  const totalSkills = path.skillsCovered.length;

  const handleSendReminder = () => {
    setShowReminder(false);
    setMenuOpen(false);
    onToast(`Reminder sent to ${userName}`);
  };

  const handleAdjustDeadline = () => {
    if (!deadlineDate) return;
    setAdjustedDeadline(deadlineDate);
    setShowDeadline(false);
    setMenuOpen(false);
    onToast(`Deadline adjusted for ${userName}`);
  };

  const handleRemove = () => {
    updateOnboardingAssignment(a.id, { status: "cancelled" });
    setShowRemove(false);
    setMenuOpen(false);
    onToast(`${userName} removed from ${path.title}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white relative">
      {/* User + Path + Menu */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-500">{path.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {behindSchedule && (
            <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full font-medium">
              <AlertTriangle className="w-3 h-3" />
              Behind Schedule
            </span>
          )}
          {adjustedDeadline && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
              Deadline adjusted
            </span>
          )}
          {/* Overflow menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
                  <button
                    onClick={() => { setMenuOpen(false); setShowReminder(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setDeadlineDate(displayDeadline.toISOString().split("T")[0]); setShowDeadline(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    Adjust Deadline
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); router.push(`/admin/users/${a.userId}`); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); setShowRemove(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove from Path
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Started: {new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span>Day {dayNum} of {path.durationDays}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                behindSchedule ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">{progressPct}%</span>
        </div>
      </div>

      {/* Currency warning */}
      {(() => {
        const cur = getContentCurrency(a.pathId);
        if (!cur || cur.currentScore >= 70) return null;
        return (
          <div className="flex items-center gap-2 p-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              ⚠ Training content may be outdated. {cur.activeSignals.length} change{cur.activeSignals.length !== 1 ? "s" : ""} since this path was assigned.
            </p>
          </div>
        );
      })()}

      {/* Phase status */}
      <div className="space-y-1.5 mb-3">
        {a.phaseProgress.map((pp, i) => {
          const phase = path.phases.find((ph) => ph.id === pp.phaseId);
          if (!phase) return null;
          const icon =
            pp.status === "completed" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : pp.status === "in_progress" ? (
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-gray-300" />
            );
          const label =
            pp.status === "completed"
              ? "Complete"
              : pp.status === "in_progress"
              ? `In Progress (${pp.coursesCompleted} of ${pp.coursesTotal} courses done)`
              : "Locked";

          return (
            <div key={pp.phaseId} className="flex items-center gap-2 text-xs">
              {icon}
              <span className="text-gray-700 font-medium">
                Phase {i + 1}: {phase.timeline}
              </span>
              <span className="text-gray-400">— {label}</span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5" />
          Skills earned: {a.skillsEarned.length} of {totalSkills}
        </span>
        {nextDueLabel && (
          <span>Next due: {nextDueLabel}</span>
        )}
      </div>

      {/* ─── Send Reminder Dialog ─── */}
      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowReminder(false)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
            <button onClick={() => setShowReminder(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Send Reminder</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send {userName} a reminder about their upcoming training?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowReminder(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSendReminder}>Send</Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Adjust Deadline Dialog ─── */}
      {showDeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowDeadline(false)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
            <button onClick={() => setShowDeadline(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Adjust Deadline</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current deadline</label>
                <p className="text-sm text-gray-700">{originalDeadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">New deadline</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={deadlineReason}
                  onChange={(e) => setDeadlineReason(e.target.value)}
                  placeholder="e.g., Extended leave"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowDeadline(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAdjustDeadline}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Remove Confirmation ─── */}
      {showRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowRemove(false)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl p-6">
            <button onClick={() => setShowRemove(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <XIcon className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Remove from Path</h3>
            <p className="text-sm text-gray-600 mb-4">
              Remove {userName} from {path.title}? Their progress will be saved but the assignment will be cancelled.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRemove(false)}>Cancel</Button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
