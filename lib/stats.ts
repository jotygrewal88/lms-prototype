import { 
  User, 
  Training, 
  TrainingCompletion, 
  Site, 
  Department,
  Scope,
  getFullName
} from "@/types";
import { today, addDays } from "./utils";
import { 
  getUsers, 
  getTrainings, 
  getCompletions, 
  getSites, 
  getDepartments 
} from "./store";

/**
 * Filter data by scope
 */
export function getScopedData(scope: Scope) {
  const allUsers = getUsers();
  const allTrainings = getTrainings();
  const allCompletions = getCompletions();
  const allSites = getSites();
  const allDepartments = getDepartments();

  // Filter users
  const scopedUsers = allUsers.filter((user) => {
    if (scope.siteId !== "ALL" && user.siteId !== scope.siteId) return false;
    if (scope.deptId !== "ALL" && user.departmentId !== scope.deptId) return false;
    return true;
  });

  // Filter completions (by user's site/dept)
  const userIds = new Set(scopedUsers.map((u) => u.id));
  const scopedCompletions = allCompletions.filter((c) => userIds.has(c.userId));

  // Filter trainings (those that have assignments matching scope)
  const scopedTrainings = allTrainings.filter((training) => {
    const assignment = training.assignment;
    
    // If scope is ALL for both, include all trainings
    if (scope.siteId === "ALL" && scope.deptId === "ALL") {
      return true;
    }
    
    // Check site match
    if (scope.siteId !== "ALL") {
      if (assignment.sites && !assignment.sites.includes(scope.siteId)) {
        return false;
      }
    }
    
    // Check department match
    if (scope.deptId !== "ALL") {
      if (assignment.departments && !assignment.departments.includes(scope.deptId)) {
        return false;
      }
    }
    
    return true;
  });

  return {
    users: scopedUsers,
    trainings: scopedTrainings,
    completions: scopedCompletions,
    sites: allSites,
    departments: allDepartments,
  };
}

/**
 * Calculate distribution of completion statuses
 */
export function calculateDistribution(completions: TrainingCompletion[]) {
  const total = completions.length;
  if (total === 0) {
    return {
      completed: 0,
      assigned: 0,
      dueSoon: 0,
      overdue: 0,
      exempt: 0,
      completedPct: 0,
      assignedPct: 0,
      dueSoonPct: 0,
      overduePct: 0,
      exemptPct: 0,
    };
  }

  const todayStr = today();
  const dueSoonThreshold = addDays(todayStr, 7);

  let completed = 0;
  let assigned = 0;
  let dueSoon = 0;
  let overdue = 0;
  let exempt = 0;

  completions.forEach((c) => {
    if (c.status === "COMPLETED") completed++;
    else if (c.status === "OVERDUE") overdue++;
    else if (c.status === "EXEMPT") exempt++;
    else if (c.status === "ASSIGNED") {
      if (c.dueAt <= dueSoonThreshold) dueSoon++;
      else assigned++;
    }
  });

  return {
    completed,
    assigned,
    dueSoon,
    overdue,
    exempt,
    completedPct: Math.round((completed / total) * 100),
    assignedPct: Math.round((assigned / total) * 100),
    dueSoonPct: Math.round((dueSoon / total) * 100),
    overduePct: Math.round((overdue / total) * 100),
    exemptPct: Math.round((exempt / total) * 100),
  };
}

/**
 * Calculate on-time completion percentage (last 30 days)
 */
export function onTimePctLast30d(completions: TrainingCompletion[]): { pct: number; onTimeCount: number; totalCompletions: number } {
  const cutoff = addDays(today(), -30);
  const recentCompletions = completions.filter(
    (c) => c.status === "COMPLETED" && c.completedAt && c.completedAt >= cutoff
  );

  if (recentCompletions.length === 0) return { pct: 100, onTimeCount: 0, totalCompletions: 0 };

  const onTime = recentCompletions.filter((c) => {
    return c.completedAt && c.dueAt && c.completedAt <= c.dueAt;
  }).length;

  return {
    pct: Math.round((onTime / recentCompletions.length) * 100),
    onTimeCount: onTime,
    totalCompletions: recentCompletions.length,
  };
}

/**
 * Calculate average days overdue (last 30 days)
 */
export function avgDaysOverdueLast30d(completions: TrainingCompletion[]): number {
  const cutoff = addDays(today(), -30);
  const todayStr = today();
  
  const overdueItems = completions.filter((c) => {
    if (c.status !== "OVERDUE") return false;
    // Item became overdue within last 30 days
    return c.dueAt >= cutoff && c.dueAt < todayStr;
  });

  if (overdueItems.length === 0) return 0;

  const totalDays = overdueItems.reduce((sum, c) => sum + (c.overdueDays || 0), 0);
  return Math.round(totalDays / overdueItems.length);
}

/**
 * Calculate items expiring in next 30 days
 */
export function expiringNext30d(completions: TrainingCompletion[]): number {
  const todayStr = today();
  const futureThreshold = addDays(todayStr, 30);
  
  return completions.filter((c) => {
    return (
      c.status === "COMPLETED" &&
      c.expiresAt &&
      c.expiresAt >= todayStr &&
      c.expiresAt <= futureThreshold
    );
  }).length;
}

/**
 * Get overdue rate by department
 */
export function overdueRateByDept(
  completions: TrainingCompletion[],
  users: User[],
  departments: Department[]
): Array<{ deptId: string; deptName: string; overdueCount: number; totalCount: number; rate: number }> {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const deptMap = new Map(departments.map((d) => [d.id, d]));

  const deptStats = new Map<string, { overdue: number; total: number }>();

  completions.forEach((c) => {
    const user = userMap.get(c.userId);
    if (!user || !user.departmentId) return;

    const deptId = user.departmentId;
    if (!deptStats.has(deptId)) {
      deptStats.set(deptId, { overdue: 0, total: 0 });
    }

    const stats = deptStats.get(deptId)!;
    stats.total++;
    if (c.status === "OVERDUE") stats.overdue++;
  });

  return Array.from(deptStats.entries())
    .map(([deptId, stats]) => ({
      deptId,
      deptName: deptMap.get(deptId)?.name || deptId,
      overdueCount: stats.overdue,
      totalCount: stats.total,
      rate: stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
}

/**
 * Get due soon counts by site
 */
export function dueSoonBySite(
  completions: TrainingCompletion[],
  users: User[],
  sites: Site[]
): Array<{ siteId: string; siteName: string; dueSoonCount: number }> {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const siteMap = new Map(sites.map((s) => [s.id, s]));

  const siteStats = new Map<string, number>();

  const todayStr = today();
  const dueSoonThreshold = addDays(todayStr, 7);

  completions.forEach((c) => {
    if (c.status !== "ASSIGNED" || c.dueAt > dueSoonThreshold) return;

    const user = userMap.get(c.userId);
    if (!user || !user.siteId) return;

    siteStats.set(user.siteId, (siteStats.get(user.siteId) || 0) + 1);
  });

  return Array.from(siteStats.entries())
    .map(([siteId, count]) => ({
      siteId,
      siteName: siteMap.get(siteId)?.name || siteId,
      dueSoonCount: count,
    }))
    .sort((a, b) => b.dueSoonCount - a.dueSoonCount);
}

/**
 * Get manager overdue counts
 */
export function managerOverdueCounts(
  completions: TrainingCompletion[],
  users: User[]
): Array<{ managerId: string; managerName: string; overdueCount: number }> {
  const managerStats = new Map<string, number>();
  const userMap = new Map(users.map((u) => [u.id, u]));

  completions.forEach((c) => {
    if (c.status !== "OVERDUE" || !c.assignedManagerId) return;

    managerStats.set(
      c.assignedManagerId,
      (managerStats.get(c.assignedManagerId) || 0) + 1
    );
  });

  return Array.from(managerStats.entries())
    .map(([managerId, count]) => {
      const manager = userMap.get(managerId);
      return {
        managerId,
        managerName: manager ? getFullName(manager) : managerId,
        overdueCount: count,
      };
    })
    .sort((a, b) => b.overdueCount - a.overdueCount);
}

/**
 * Get training with most overdue completions
 */
export function topOverdueTraining(
  completions: TrainingCompletion[],
  trainings: Training[]
): { trainingId: string; title: string; overdueCount: number } | null {
  const trainingMap = new Map(trainings.map((t) => [t.id, t]));
  const overdueByTraining = new Map<string, number>();

  completions.forEach((c) => {
    if (c.status === "OVERDUE") {
      overdueByTraining.set(
        c.trainingId,
        (overdueByTraining.get(c.trainingId) || 0) + 1
      );
    }
  });

  if (overdueByTraining.size === 0) return null;

  const sorted = Array.from(overdueByTraining.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const [trainingId, overdueCount] = sorted[0];
  const training = trainingMap.get(trainingId);

  return {
    trainingId,
    title: training?.title || trainingId,
    overdueCount,
  };
}

/**
 * Count active (non-exempt) assignments
 */
export function activeAssignments(completions: TrainingCompletion[]): number {
  return completions.filter((c) => 
    c.status !== "EXEMPT" && 
    (c.status === "ASSIGNED" || c.status === "OVERDUE")
  ).length;
}

/**
 * Calculate median of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) 
    : sorted[mid];
}

/**
 * Calculate weekly on-time completion percentage over N weeks
 */
export function onTimePctSeries(completions: TrainingCompletion[], weeks = 8): number[] {
  const todayStr = today();
  const series: number[] = [];
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = addDays(todayStr, -(i * 7));
    const weekStart = addDays(weekEnd, -7);
    
    const weekCompletions = completions.filter((c) => 
      c.status === "COMPLETED" && 
      c.completedAt && 
      c.completedAt >= weekStart && 
      c.completedAt < weekEnd
    );
    
    if (weekCompletions.length === 0) {
      series.push(100); // Default to 100% if no data
    } else {
      const onTime = weekCompletions.filter((c) => 
        c.completedAt && c.dueAt && c.completedAt <= c.dueAt
      ).length;
      series.push(Math.round((onTime / weekCompletions.length) * 100));
    }
  }
  
  return series;
}

/**
 * Manager overdue detail interface
 */
export interface ManagerOverdueDetail {
  managerId: string;
  managerName: string;
  siteId: string;
  siteName: string;
  deptId: string;
  deptName: string;
  teamUserIds: string[];
  teamSize: number;
  overdueCount: number;
  dueSoonCount: number;
  activeAssignments: number;
  overdueRate: number;
  dueSoonRate: number;
  overdueAging: {
    medianDays: number;
    maxDays: number;
  };
  topProblemTraining?: {
    trainingId: string;
    title: string;
    overdueCount: number;
  };
  onTimePctSeries: number[];
}

/**
 * Get detailed overdue statistics by manager
 */
export function overdueDetailByManager(scoped: ReturnType<typeof getScopedData>): ManagerOverdueDetail[] {
  const { completions, users, trainings } = scoped;
  const userMap = new Map(users.map((u) => [u.id, u]));
  
  // Group users by manager
  const managerTeams = new Map<string, User[]>();
  users.forEach((user) => {
    if (user.managerId) {
      if (!managerTeams.has(user.managerId)) {
        managerTeams.set(user.managerId, []);
      }
      managerTeams.get(user.managerId)!.push(user);
    }
  });
  
  const results: ManagerOverdueDetail[] = [];
  
  for (const [managerId, teamMembers] of managerTeams.entries()) {
    const manager = userMap.get(managerId);
    if (!manager) continue;
    
    const teamUserIds = teamMembers.map((u) => u.id);
    const teamCompletions = completions.filter((c) => teamUserIds.includes(c.userId));
    
    if (teamCompletions.length === 0) continue;
    
    const overdueCompletions = teamCompletions.filter((c) => c.status === "OVERDUE");
    const dueSoonCompletions = teamCompletions.filter((c) => c.status === "ASSIGNED" && c.dueAt <= addDays(today(), 7));
    const active = activeAssignments(teamCompletions);
    
    // Calculate aging for overdue items
    const overdueDays = overdueCompletions.map((c) => c.overdueDays || 0).filter(d => d > 0);
    const medianDays = median(overdueDays);
    const maxDays = overdueDays.length > 0 ? Math.max(...overdueDays) : 0;
    
    // Find top problem training for this team
    const trainingMap = new Map(trainings.map((t) => [t.id, t]));
    const overdueByTraining = new Map<string, number>();
    overdueCompletions.forEach((c) => {
      overdueByTraining.set(
        c.trainingId,
        (overdueByTraining.get(c.trainingId) || 0) + 1
      );
    });
    
    let topProblemTraining: ManagerOverdueDetail["topProblemTraining"] = undefined;
    if (overdueByTraining.size > 0) {
      const sorted = Array.from(overdueByTraining.entries()).sort((a, b) => b[1] - a[1]);
      const [trainingId, overdueCount] = sorted[0];
      const training = trainingMap.get(trainingId);
      if (training) {
        topProblemTraining = {
          trainingId,
          title: training.title,
          overdueCount,
        };
      }
    }
    
    // Calculate on-time percentage series for this team
    const series = onTimePctSeries(teamCompletions, 8);
    
    results.push({
      managerId,
      managerName: getFullName(manager),
      siteId: manager.siteId || "unknown",
      siteName: manager.siteId ? getSites().find(s => s.id === manager.siteId)?.name || "Unknown" : "Unknown",
      deptId: manager.departmentId || "unknown",
      deptName: manager.departmentId ? getDepartments().find(d => d.id === manager.departmentId)?.name || "Unknown" : "Unknown",
      teamUserIds,
      teamSize: teamMembers.length,
      overdueCount: overdueCompletions.length,
      dueSoonCount: dueSoonCompletions.length,
      activeAssignments: active,
      overdueRate: active > 0 ? overdueCompletions.length / active : 0,
      dueSoonRate: active > 0 ? dueSoonCompletions.length / active : 0,
      overdueAging: {
        medianDays,
        maxDays,
      },
      topProblemTraining,
      onTimePctSeries: series,
    });
  }
  
  return results;
}

/**
 * Calculate team risk score (0-100) based on compliance metrics
 */
export function teamRiskScore(
  overdueCount: number,
  teamAssignments: number,
  medianAgingDays: number
): number {
  const overduePct = overdueCount / Math.max(1, teamAssignments);
  const medianAgingScaled = Math.min(medianAgingDays / 30, 1);
  const volumeFactor = Math.min(overdueCount / 10, 1);
  
  return Math.round(100 * (0.65 * overduePct + 0.25 * medianAgingScaled + 0.10 * volumeFactor));
}

/**
 * Team row interface for compliance coach
 */
export interface TeamRow {
  managerId: string;
  managerName: string;
  siteName: string;
  deptName: string;
  siteId: string;
  deptId: string;
  overdueCount: number;
  teamCount: number;
  overduePct: number;
  agingMedianDays: number;
  agingMaxDays: number;
  topTrainingName?: string;
  topTrainingCount?: number;
  risk: number;
}

/**
 * Coach summary interface
 */
export interface CoachSummary {
  highCount: number;
  medCount: number;
  worstAgingDays: number;
  topOffenderTraining?: string;
  topOffenderSharePct: number;
  overallCompliancePct: number;
}

/**
 * Aggregate all coach statistics with risk tiering
 */
export function aggregateCoachStats(scope: Scope): {
  high: TeamRow[];
  med: TeamRow[];
  low: TeamRow[];
  summary: CoachSummary;
} {
  const scoped = getScopedData(scope);
  const { completions, users, trainings } = scoped;
  
  // Group users by manager
  const managerTeams = new Map<string, User[]>();
  users.forEach(u => {
    if (u.managerId && !managerTeams.has(u.managerId)) {
      managerTeams.set(u.managerId, []);
    }
    if (u.managerId) managerTeams.get(u.managerId)!.push(u);
  });
  
  const allRows: TeamRow[] = [];
  
  for (const [managerId, teamMembers] of managerTeams.entries()) {
    const manager = users.find(u => u.id === managerId);
    if (!manager) continue;
    
    const teamUserIds = teamMembers.map(u => u.id);
    const teamCompletions = completions.filter(c => 
      teamUserIds.includes(c.userId) && c.status !== "EXEMPT"
    );
    
    if (teamCompletions.length === 0) continue;
    
    const overdueItems = teamCompletions.filter(c => c.status === "OVERDUE");
    const overdueDays = overdueItems.map(c => c.overdueDays || 0).filter(d => d > 0);
    
    // Top training
    const trainingCounts = new Map<string, number>();
    overdueItems.forEach(c => {
      trainingCounts.set(c.trainingId, (trainingCounts.get(c.trainingId) || 0) + 1);
    });
    const topEntry = Array.from(trainingCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    
    const row: TeamRow = {
      managerId,
      managerName: `${manager.firstName} ${manager.lastName}`,
      siteName: getSites().find(s => s.id === manager.siteId)?.name || "",
      deptName: getDepartments().find(d => d.id === manager.departmentId)?.name || "",
      siteId: manager.siteId || "",
      deptId: manager.departmentId || "",
      overdueCount: overdueItems.length,
      teamCount: teamCompletions.length,
      overduePct: overdueItems.length / teamCompletions.length,
      agingMedianDays: median(overdueDays),
      agingMaxDays: overdueDays.length > 0 ? Math.max(...overdueDays) : 0,
      topTrainingName: topEntry ? trainings.find(t => t.id === topEntry[0])?.title : undefined,
      topTrainingCount: topEntry?.[1],
      risk: teamRiskScore(overdueItems.length, teamCompletions.length, median(overdueDays)),
    };
    
    allRows.push(row);
  }
  
  // Tier teams by risk
  const high = allRows.filter(r => r.risk >= 40).sort((a, b) => b.risk - a.risk);
  const med = allRows.filter(r => r.risk >= 25 && r.risk < 40).sort((a, b) => b.risk - a.risk);
  const low = allRows.filter(r => r.risk < 25).sort((a, b) => b.risk - a.risk);
  
  // Build summary
  const totalCompletions = completions.filter(c => c.status !== "EXEMPT").length;
  const completedCount = completions.filter(c => c.status === "COMPLETED").length;
  const worstAging = Math.max(...allRows.map(r => r.agingMaxDays), 0);
  
  // Find top offender training across all teams
  const globalTrainingCounts = new Map<string, number>();
  completions.filter(c => c.status === "OVERDUE").forEach(c => {
    globalTrainingCounts.set(c.trainingId, (globalTrainingCounts.get(c.trainingId) || 0) + 1);
  });
  const topGlobal = Array.from(globalTrainingCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const totalOverdue = completions.filter(c => c.status === "OVERDUE").length;
  
  const summary: CoachSummary = {
    highCount: high.length,
    medCount: med.length,
    worstAgingDays: worstAging,
    topOffenderTraining: topGlobal ? trainings.find(t => t.id === topGlobal[0])?.title : undefined,
    topOffenderSharePct: topGlobal && totalOverdue > 0 ? Math.round((topGlobal[1] / totalOverdue) * 100) : 0,
    overallCompliancePct: totalCompletions > 0 ? Math.round((completedCount / totalCompletions) * 100) : 0,
  };
  
  return { high, med, low, summary };
}

