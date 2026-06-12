// Shared phase/item rendering for an onboarding assignment.
//
// Used by:
//   - Learner dashboard (mode="learner")  → to-do checkboxes interactive,
//     courses/trainings link to the player/detail view
//   - User profile page (mode="admin")    → read-only, all controls disabled,
//     to-do completion state shown but not editable
//
// Status for each item is derived from real completion data via
// `getOnboardingItemStatus` in the store, so this component does NOT keep
// its own per-item completion state — it just reflects the assignment.
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  ChevronDown,
  ChevronRight,
  Book,
  GraduationCap,
  ClipboardList,
  ExternalLink,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import type {
  OnboardingPath,
  OnboardingAssignment,
  OnboardingPhase,
  OnboardingPhaseCourse,
} from "@/types";
import {
  getOnboardingItemStatus,
  toggleOnboardingTodoCompletion,
  setCourseCompletionForUser,
  setTrainingCompletionForUser,
  getUser,
} from "@/lib/store";
import { getFullName } from "@/types";

export type OnboardingPlanViewMode = "learner" | "admin";

interface Props {
  path: OnboardingPath;
  assignment: OnboardingAssignment;
  mode: OnboardingPlanViewMode;
  /** Optional className to apply to the root wrapper. */
  className?: string;
  /** Show the celebration banner when complete. */
  showCompletionBanner?: boolean;
  /** Viewer can check/uncheck to-do items. Always required for any
   *  interactivity. Default: derived from `mode` ("learner" → true, otherwise false). */
  canMarkTodos?: boolean;
  /** Viewer can mark courses + trainings complete/incomplete as an override
   *  AND all phases are visible regardless of lock state. Admin + the
   *  learner's direct/additional manager only. */
  canOverride?: boolean;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

const formatShortDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

export default function OnboardingPlanView({
  path,
  assignment,
  mode,
  className = "",
  showCompletionBanner = true,
  canMarkTodos: canMarkTodosProp,
  canOverride = false,
}: Props) {
  // If `canMarkTodos` wasn't passed, fall back to the legacy "learner can
  // toggle their own to-dos" behavior so older callers don't break.
  const canMarkTodos =
    canMarkTodosProp ?? (mode === "learner" && assignment.status === "active");
  // Day X of Y, clamped to the path duration.
  const dayNum = useMemo(() => {
    const startMs = new Date(assignment.startDate).getTime();
    const diff = Math.ceil((Date.now() - startMs) / 86400000);
    return Math.max(1, Math.min(path.durationDays, diff));
  }, [assignment.startDate, path.durationDays]);

  // Per-item statuses (live from real completion data) — used by the
  // progress bar, phase row counts, and item rendering. Phase locked/in-
  // progress/completed state is also DERIVED from these statuses rather
  // than read from assignment.phaseProgress[].status, so the UI stays
  // correct even if course/training completions happen outside of the
  // onboarding-aware code paths (e.g. the course player).
  const livePhaseStatuses = useMemo(() => {
    const out: Array<{
      phaseId: string;
      status: "locked" | "in_progress" | "completed";
      completedCount: number;
      totalCount: number;
      itemStatuses: Array<{
        itemId: string;
        status: "not_started" | "in_progress" | "completed";
        completedAt?: string;
      }>;
    }> = [];
    let previousComplete = true;
    for (const phase of path.phases) {
      const itemStatuses = phase.courses.map((item) => ({
        itemId: item.id,
        ...getOnboardingItemStatus(item, phase.id, assignment),
      }));
      const completedCount = itemStatuses.filter((s) => s.status === "completed").length;
      const totalCount = phase.courses.length;
      const allComplete = totalCount > 0 && completedCount === totalCount;
      let phaseStatus: "locked" | "in_progress" | "completed";
      // Admin/manager override: skip the lock state entirely so they can
      // work on any phase out of sequence.
      if (!previousComplete && !canOverride) phaseStatus = "locked";
      else if (allComplete) phaseStatus = "completed";
      else phaseStatus = "in_progress";
      out.push({
        phaseId: phase.id,
        status: phaseStatus,
        completedCount,
        totalCount,
        itemStatuses,
      });
      previousComplete = allComplete;
    }
    return out;
  }, [path, assignment, canOverride]);

  const totalItems = livePhaseStatuses.reduce((s, p) => s + p.totalCount, 0);
  const completedItems = livePhaseStatuses.reduce((s, p) => s + p.completedCount, 0);
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allPhasesComplete =
    livePhaseStatuses.length > 0 &&
    livePhaseStatuses.every((p) => p.totalCount === 0 || p.completedCount === p.totalCount);
  // Effective status for header pill + banner — show "completed" the moment
  // all items are done, even if the assignment record hasn't been recomputed.
  const effectiveStatus: OnboardingAssignment["status"] =
    assignment.status === "cancelled"
      ? "cancelled"
      : allPhasesComplete
      ? "completed"
      : "active";

  // Default expansion: first non-locked, non-completed phase open.
  // (Falls back to first phase if everything is either locked or complete.)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const firstActive = livePhaseStatuses.find((p) => p.status === "in_progress");
    if (firstActive) initial.add(firstActive.phaseId);
    else if (livePhaseStatuses[0]) initial.add(livePhaseStatuses[0].phaseId);
    return initial;
  });

  const togglePhase = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isCompleted = effectiveStatus === "completed";
  const isCancelled = effectiveStatus === "cancelled";
  const learner = mode === "admin" ? getUser(assignment.userId) : null;
  // If the assignment record hasn't been completion-stamped yet (e.g. the
  // last item was just completed via the course player), surface today's
  // date as a fallback so the banner doesn't show "Invalid Date".
  const displayedCompletedAt =
    assignment.completedAt ||
    (isCompleted ? new Date().toISOString() : undefined);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top-level status header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {path.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1.5">
              <span>Started {formatDate(assignment.startDate)}</span>
              <span>·</span>
              <span>
                Day {dayNum} of {path.durationDays}
              </span>
              <span>·</span>
              <span>
                {completedItems} of {totalItems} item{totalItems === 1 ? "" : "s"} complete
              </span>
              {displayedCompletedAt && isCompleted && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700">
                    Completed {formatDate(displayedCompletedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
          <StatusPill status={effectiveStatus} />
        </div>

        {/* Overall progress bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCancelled
                  ? "bg-gray-300"
                  : isCompleted
                  ? "bg-emerald-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 tabular-nums w-10 text-right">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Completion banner */}
      {showCompletionBanner && isCompleted && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-emerald-900">
              Onboarding complete{learner ? ` — ${getFullName(learner)}` : ""}!
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              {mode === "learner"
                ? `You finished “${path.title}” on ${formatDate(displayedCompletedAt)}. Nice work.`
                : `Finished “${path.title}” on ${formatDate(displayedCompletedAt)}.`}
            </p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-600">
          This onboarding assignment was cancelled. Progress shown below is preserved
          but no longer active.
        </div>
      )}

      {/* Phases */}
      <div className="space-y-2">
        {path.phases.map((phase, i) => {
          const live = livePhaseStatuses[i];
          return (
            <PhaseRow
              key={phase.id}
              phase={phase}
              phaseIndex={i}
              previousPhase={i > 0 ? path.phases[i - 1] : null}
              assignment={assignment}
              mode={mode}
              isExpanded={expanded.has(phase.id)}
              onToggle={() => togglePhase(phase.id)}
              liveStatus={live?.status || "in_progress"}
              liveCompletedCount={live?.completedCount || 0}
              liveTotalCount={live?.totalCount || phase.courses.length}
              liveItemStatuses={live?.itemStatuses || []}
              canMarkTodos={canMarkTodos}
              canOverride={canOverride}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Status pill ───────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: OnboardingAssignment["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
      <Clock className="w-3 h-3" />
      Active
    </span>
  );
}

/* ─── Phase row ─────────────────────────────────────────────────────────── */

interface PhaseRowProps {
  phase: OnboardingPhase;
  phaseIndex: number;
  previousPhase: OnboardingPhase | null;
  assignment: OnboardingAssignment;
  mode: OnboardingPlanViewMode;
  isExpanded: boolean;
  onToggle: () => void;
  liveStatus: "locked" | "in_progress" | "completed";
  liveCompletedCount: number;
  liveTotalCount: number;
  liveItemStatuses: Array<{
    itemId: string;
    status: "not_started" | "in_progress" | "completed";
    completedAt?: string;
  }>;
  canMarkTodos: boolean;
  canOverride: boolean;
}

function PhaseRow({
  phase,
  phaseIndex,
  previousPhase,
  assignment,
  mode,
  isExpanded,
  onToggle,
  liveStatus,
  liveCompletedCount,
  liveTotalCount,
  liveItemStatuses,
  canMarkTodos,
  canOverride,
}: PhaseRowProps) {
  const isLocked = liveStatus === "locked";
  const isComplete = liveStatus === "completed";
  const totalItems = liveTotalCount;
  const completedItems = liveCompletedCount;

  const borderColor = isComplete
    ? "border-emerald-200 bg-emerald-50/30"
    : isLocked
    ? "border-gray-200 bg-gray-50/30"
    : "border-blue-200 bg-blue-50/20";

  return (
    <div className={`rounded-lg border overflow-hidden ${borderColor}`}>
      <button
        type="button"
        onClick={() => !isLocked && onToggle()}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
          isLocked ? "cursor-default" : "hover:bg-white/60"
        }`}
        aria-expanded={!isLocked && isExpanded}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
        ) : isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Phase {phaseIndex + 1}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{phase.timeline}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{phase.name}</h4>
          {isLocked && previousPhase && (
            <p className="text-xs text-gray-500 mt-0.5">
              Complete {previousPhase.name} to unlock.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isComplete && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-100 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </span>
          )}
          {!isComplete && !isLocked && (
            <span className="text-xs text-gray-500">
              {completedItems}/{totalItems}
            </span>
          )}
        </div>
      </button>

      {isExpanded && !isLocked && (
        <div className="divide-y divide-gray-100 border-t border-gray-100 bg-white">
          {phase.courses.map((item, idx) => {
            const itemStatus = liveItemStatuses[idx] || { status: "not_started" as const };
            return (
              <ItemRow
                key={item.id}
                item={item}
                status={{ status: itemStatus.status, completedAt: itemStatus.completedAt }}
                assignment={assignment}
                phaseId={phase.id}
                mode={mode}
                canMarkTodos={canMarkTodos}
                canOverride={canOverride}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Item row ──────────────────────────────────────────────────────────── */

interface ItemRowProps {
  item: OnboardingPhaseCourse;
  status: { status: "not_started" | "in_progress" | "completed"; completedAt?: string };
  assignment: OnboardingAssignment;
  phaseId: string;
  mode: OnboardingPlanViewMode;
  canMarkTodos: boolean;
  canOverride: boolean;
}

function ItemRow({
  item,
  status,
  assignment,
  phaseId,
  mode,
  canMarkTodos,
  canOverride,
}: ItemRowProps) {
  const isCourse = item.kind !== "todo" && item.kind !== "training";
  const isTraining = item.kind === "training";
  const isTodo = item.kind === "todo";

  const isLearner = mode === "learner";

  // To-do is interactive iff:
  //  - assignment is active (no editing cancelled / completed records)
  //  - viewer has permission to mark to-dos (learner own, or admin/manager override)
  const canInteractTodo =
    isTodo && canMarkTodos && assignment.status !== "cancelled";

  // Course/Training override controls only when the viewer has admin/manager
  // permission AND the item is linked (placeholders can't be marked complete).
  const canOverrideThisItem =
    canOverride &&
    assignment.status !== "cancelled" &&
    ((isCourse && Boolean(item.linkedCourseId)) ||
      (isTraining && Boolean(item.linkedTrainingId)));

  const onTodoToggle = () => {
    if (!canInteractTodo) return;
    toggleOnboardingTodoCompletion(assignment.id, phaseId, item.id);
  };

  const onCourseOverride = () => {
    if (!canOverrideThisItem || !item.linkedCourseId) return;
    setCourseCompletionForUser(
      assignment.userId,
      item.linkedCourseId,
      status.status !== "completed",
    );
  };

  const onTrainingOverride = () => {
    if (!canOverrideThisItem || !item.linkedTrainingId) return;
    setTrainingCompletionForUser(
      assignment.userId,
      item.linkedTrainingId,
      status.status !== "completed",
    );
  };

  // Status visuals
  const statusBadge =
    status.status === "completed" ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Complete
      </span>
    ) : status.status === "in_progress" ? (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-100 rounded">
        <Clock className="w-2.5 h-2.5" />
        In Progress
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded">
        Not Started
      </span>
    );

  // Item type icon
  const typeIcon = isTodo ? (
    <ClipboardList className="w-4 h-4 text-violet-500" />
  ) : isTraining ? (
    <GraduationCap className="w-4 h-4 text-emerald-600" />
  ) : (
    <Book className="w-4 h-4 text-blue-500" />
  );

  // Override toggle button — shown next to navigation when admin/manager
  // can manually flip the real completion record.
  const overrideButton =
    canOverrideThisItem && (isCourse || isTraining) ? (
      <button
        type="button"
        onClick={isCourse ? onCourseOverride : onTrainingOverride}
        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
          status.status === "completed"
            ? "text-gray-600 border-gray-300 bg-white hover:bg-gray-50"
            : "text-emerald-700 border-emerald-300 bg-white hover:bg-emerald-50"
        }`}
        title={
          status.status === "completed"
            ? "Mark as incomplete (admin override)"
            : "Mark as complete (admin override)"
        }
      >
        {status.status === "completed" ? (
          <>
            <Circle className="w-3 h-3" /> Mark incomplete
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3" /> Mark complete
          </>
        )}
      </button>
    ) : null;

  // Navigation link to the actual course/training record
  const navLink = (() => {
    if (isTodo) return null;
    if (isCourse && item.linkedCourseId) {
      if (isLearner) {
        return (
          <Link
            href={`/learner/courses/${item.linkedCourseId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {status.status === "completed"
              ? "Review"
              : status.status === "in_progress"
              ? "Continue"
              : "Go to Course"}
            <ExternalLink className="w-3 h-3" />
          </Link>
        );
      }
      return (
        <Link
          href={`/admin/courses/${item.linkedCourseId}`}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View course
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    }
    if (isTraining && item.linkedTrainingId) {
      if (isLearner) {
        return (
          <Link
            href={`/learner/training/${item.linkedTrainingId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded hover:bg-emerald-200"
          >
            View Training
            <ExternalLink className="w-3 h-3" />
          </Link>
        );
      }
      return (
        <Link
          href={`/admin/trainings/${item.linkedTrainingId}`}
          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
        >
          View training
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    }
    return <span className="text-[11px] text-gray-400 italic">No {isCourse ? "course" : "training"} linked</span>;
  })();

  // Compose the right-side action area
  let actionEl: React.ReactNode = null;
  if (isTodo) {
    actionEl = (
      <label
        className={`inline-flex items-center gap-1.5 text-xs ${
          canInteractTodo ? "cursor-pointer text-gray-700 hover:text-gray-900" : "text-gray-500 cursor-default"
        }`}
      >
        <input
          type="checkbox"
          checked={status.status === "completed"}
          onChange={onTodoToggle}
          disabled={!canInteractTodo}
          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-300 disabled:opacity-60"
        />
        <span>{status.status === "completed" ? "Done" : "Mark done"}</span>
      </label>
    );
  } else {
    actionEl = (
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {overrideButton}
        {navLink}
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {status.status === "completed" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : status.status === "in_progress" ? (
          <Clock className="w-4 h-4 text-blue-500" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="flex-shrink-0">{typeIcon}</span>
          <p
            className={`text-sm font-medium min-w-0 ${
              status.status === "completed" ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {item.title}
          </p>
          {statusBadge}
        </div>
        {/* Subline: minutes / todo note / completion timestamp */}
        <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
          <span>{item.estimatedMinutes} min</span>
          {status.status === "completed" && status.completedAt && (
            <>
              <span>·</span>
              <span className="text-emerald-700">
                Completed {formatShortDate(status.completedAt)}
              </span>
            </>
          )}
          {isTodo && !status.completedAt && item.todoNote && (
            <>
              <span>·</span>
              <span className="text-gray-500 line-clamp-1">{item.todoNote}</span>
            </>
          )}
        </div>
        {isTodo && status.completedAt && item.todoNote && (
          <p className="text-[11px] text-gray-500 mt-1 italic line-clamp-2">{item.todoNote}</p>
        )}
      </div>
      <div className="flex-shrink-0">{actionEl}</div>
    </div>
  );
}
