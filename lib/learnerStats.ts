// Phase I Epic 4: Learner statistics and filtering helpers
import { TrainingCompletion } from "@/types";
import { today } from "@/lib/utils";

export type FilterType = "all" | "due-soon" | "overdue" | "completed";

/**
 * Calculate learner progress percentage
 */
export function calculateProgress(completions: TrainingCompletion[]): number {
  if (completions.length === 0) return 0;
  const completed = completions.filter(c => c.status === "COMPLETED").length;
  return Math.round((completed / completions.length) * 100);
}

/**
 * Count completions by status
 */
export function getStatusCounts(completions: TrainingCompletion[]) {
  return {
    assigned: completions.filter(c => c.status === "ASSIGNED").length,
    overdue: completions.filter(c => c.status === "OVERDUE").length,
    completed: completions.filter(c => c.status === "COMPLETED").length,
    dueSoon: completions.filter(c => isDueSoon(c)).length,
  };
}

/**
 * Check if a completion is due soon (within 7 days and not completed)
 */
export function isDueSoon(completion: TrainingCompletion): boolean {
  if (completion.status === "COMPLETED") return false;
  
  const todayDate = new Date(today());
  const dueDate = new Date(completion.dueAt);
  const daysUntilDue = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilDue >= 0 && daysUntilDue <= 7;
}

/**
 * Filter completions by type
 */
export function filterCompletions(
  completions: TrainingCompletion[],
  filterType: FilterType
): TrainingCompletion[] {
  switch (filterType) {
    case "all":
      return completions;
    case "due-soon":
      return completions.filter(c => isDueSoon(c));
    case "overdue":
      return completions.filter(c => c.status === "OVERDUE");
    case "completed":
      return completions.filter(c => c.status === "COMPLETED");
    default:
      return completions;
  }
}

/**
 * Sort completions by priority (overdue first, then due soon, then by due date)
 */
export function sortByPriority(completions: TrainingCompletion[]): TrainingCompletion[] {
  return [...completions].sort((a, b) => {
    // Overdue first
    if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
    if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1;
    
    // Then due soon
    const aDueSoon = isDueSoon(a);
    const bDueSoon = isDueSoon(b);
    if (aDueSoon && !bDueSoon) return -1;
    if (bDueSoon && !aDueSoon) return 1;
    
    // Then by due date (earliest first)
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

