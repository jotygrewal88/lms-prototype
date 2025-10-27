import { 
  User, 
  Training, 
  TrainingCompletion, 
  Site, 
  Department,
  Scope 
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
export function onTimePctLast30d(completions: TrainingCompletion[]): number {
  const cutoff = addDays(today(), -30);
  const recentCompletions = completions.filter(
    (c) => c.status === "COMPLETED" && c.completedAt && c.completedAt >= cutoff
  );

  if (recentCompletions.length === 0) return 100;

  const onTime = recentCompletions.filter((c) => {
    return c.completedAt && c.dueAt && c.completedAt <= c.dueAt;
  }).length;

  return Math.round((onTime / recentCompletions.length) * 100);
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
    .map(([managerId, count]) => ({
      managerId,
      managerName: userMap.get(managerId)?.name || managerId,
      overdueCount: count,
    }))
    .sort((a, b) => b.overdueCount - a.overdueCount);
}

