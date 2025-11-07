import { 
  User, 
  Training, 
  TrainingCompletion, 
  Site, 
  Department,
  Scope,
  getFullName,
  CourseAssignment,
  ProgressCourse,
  Certificate,
  QuizAttempt,
  Course
} from "@/types";
import { today, addDays } from "./utils";
import { 
  getUsers, 
  getTrainings, 
  getCompletions, 
  getSites, 
  getDepartments,
  getAssignments,
  getProgressCourses,
  getCertificates,
  getAllQuizAttempts,
  resolveAssigneesForCourse,
  getCourses,
  getDepartments as getDepartmentsFromStore,
  getSkills,
  getEarnedSkillsByUser,
  getAssignmentsByCourseId
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

// ============================================================================
// Phase II — 1K.1 Analytics Functions
// ============================================================================

/**
 * Filter course assignments by scope (resolve assignees, then filter by their site/dept)
 */
export function getScopedAssignments(scope: Scope): CourseAssignment[] {
  const allAssignments = getAssignments();
  const scopedUsers = getScopedData(scope).users;
  const scopedUserIds = new Set(scopedUsers.map(u => u.id));

  return allAssignments.filter(assignment => {
    // Resolve assignees for this course
    const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
    // Check if any assignee is in scoped users
    return assigneeIds.some(assigneeId => scopedUserIds.has(assigneeId));
  });
}

/**
 * Filter certificates by user scope
 */
export function getScopedCertificates(scope: Scope): Certificate[] {
  const allCertificates = getCertificates();
  const scopedUsers = getScopedData(scope).users;
  const scopedUserIds = new Set(scopedUsers.map(u => u.id));

  return allCertificates.filter(cert => scopedUserIds.has(cert.userId));
}

/**
 * Filter progress courses by user scope
 */
export function getScopedProgressCourses(scope: Scope): ProgressCourse[] {
  const allProgress = getProgressCourses();
  const scopedUsers = getScopedData(scope).users;
  const scopedUserIds = new Set(scopedUsers.map(u => u.id));

  return allProgress.filter(progress => scopedUserIds.has(progress.userId));
}

/**
 * Filter quiz attempts by user scope
 */
export function getScopedQuizAttempts(scope: Scope): QuizAttempt[] {
  const allAttempts = getAllQuizAttempts();
  const scopedUsers = getScopedData(scope).users;
  const scopedUserIds = new Set(scopedUsers.map(u => u.id));

  return allAttempts.filter(attempt => scopedUserIds.has(attempt.userId));
}

/**
 * Compute KPIs for analytics dashboard
 */
export function computeKpis(scope: Scope): {
  activeLearners: number;
  completionPct: number;
  avgQuizScore: number;
  overdueCount: number;
  dueSoonCount: number;
  certificatesIssued: number;
} {
  const scopedUsers = getScopedData(scope).users;
  const scopedAssignments = getScopedAssignments(scope);
  const scopedProgress = getScopedProgressCourses(scope);
  const scopedCertificates = getScopedCertificates(scope);
  const scopedQuizAttempts = getScopedQuizAttempts(scope);

  // Active Learners: Count users with ≥1 assignment OR ≥1 progress record
  const usersWithAssignments = new Set<string>();
  const usersWithProgress = new Set<string>();
  
  scopedAssignments.forEach(assignment => {
    const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
    assigneeIds.forEach(id => usersWithAssignments.add(id));
  });
  
  scopedProgress.forEach(progress => {
    usersWithProgress.add(progress.userId);
  });
  
  const activeLearners = new Set([...usersWithAssignments, ...usersWithProgress]).size;

  // Overall Completion %: (Completed assignments + courses) / Total assignments
  // Count completed: ProgressCourse.status === "completed" OR TrainingCompletion.status === "COMPLETED"
  const scopedCompletions = getScopedData(scope).completions;
  const completedCourses = scopedProgress.filter(p => p.status === "completed").length;
  const completedTrainings = scopedCompletions.filter(c => c.status === "COMPLETED").length;
  const totalAssignments = scopedAssignments.length + scopedCompletions.length;
  const totalCompleted = completedCourses + completedTrainings;
  const completionPct = totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0;

  // Avg Quiz Score: Average of latest quiz attempt per user/course in last 30 days
  const thirtyDaysAgo = addDays(today(), -30);
  const recentAttempts = scopedQuizAttempts.filter(
    a => a.submittedAt && a.submittedAt >= thirtyDaysAgo && a.scorePct !== undefined
  );
  
  // Group by userId + courseId, take latest per group
  const latestAttempts = new Map<string, QuizAttempt>();
  recentAttempts.forEach(attempt => {
    const key = `${attempt.userId}:${attempt.courseId}`;
    const existing = latestAttempts.get(key);
    if (!existing || !existing.submittedAt || (attempt.submittedAt && attempt.submittedAt > existing.submittedAt)) {
      latestAttempts.set(key, attempt);
    }
  });
  
  const scores = Array.from(latestAttempts.values())
    .map(a => a.scorePct!)
    .filter(s => s !== undefined);
  const avgQuizScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) 
    : 0;

  // Overdue: Assignments with dueAt < today and not completed
  const todayStr = today();
  const overdueAssignments = scopedAssignments.filter(assignment => {
    if (!assignment.dueAt) return false;
    if (assignment.dueAt >= todayStr) return false;
    // Check if completed
    const progress = scopedProgress.find(p => p.courseId === assignment.courseId);
    return !progress || progress.status !== "completed";
  });
  
  const overdueCompletions = scopedCompletions.filter(c => c.status === "OVERDUE");
  const overdueCount = overdueAssignments.length + overdueCompletions.length;

  // Due Soon: Assignments with dueAt within next 7 days (not completed)
  const sevenDaysFromNow = addDays(todayStr, 7);
  const dueSoonAssignments = scopedAssignments.filter(assignment => {
    if (!assignment.dueAt) return false;
    if (assignment.dueAt < todayStr || assignment.dueAt > sevenDaysFromNow) return false;
    // Check if completed
    const progress = scopedProgress.find(p => p.courseId === assignment.courseId);
    return !progress || progress.status !== "completed";
  });
  
  const dueSoonCompletions = scopedCompletions.filter(c => {
    if (c.status !== "ASSIGNED") return false;
    return c.dueAt && c.dueAt >= todayStr && c.dueAt <= sevenDaysFromNow;
  });
  const dueSoonCount = dueSoonAssignments.length + dueSoonCompletions.length;

  // Certificates Issued: Count certificates issued in last 30 days
  const certificatesIssued = scopedCertificates.filter(
    cert => cert.issuedAt >= thirtyDaysAgo
  ).length;

  return {
    activeLearners,
    completionPct,
    avgQuizScore,
    overdueCount,
    dueSoonCount,
    certificatesIssued,
  };
}

/**
 * Build completion by department data for bar chart
 */
export function buildCompletionByDept(scope: Scope): Array<{
  deptName: string;
  completed: number;
  inProgress: number;
  notStarted: number;
}> {
  const scopedUsers = getScopedData(scope).users;
  const scopedAssignments = getScopedAssignments(scope);
  const scopedProgress = getScopedProgressCourses(scope);
  const scopedCompletions = getScopedData(scope).completions;
  const departments = getDepartmentsFromStore();

  // Group by department
  const deptStats = new Map<string, {
    completed: number;
    inProgress: number;
    notStarted: number;
  }>();

  // Process course assignments
  scopedAssignments.forEach(assignment => {
    const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
    assigneeIds.forEach(userId => {
      const user = scopedUsers.find(u => u.id === userId);
      if (!user || !user.departmentId) return;
      
      const deptId = user.departmentId;
      if (!deptStats.has(deptId)) {
        deptStats.set(deptId, { completed: 0, inProgress: 0, notStarted: 0 });
      }
      
      const stats = deptStats.get(deptId)!;
      const progress = scopedProgress.find(p => p.courseId === assignment.courseId && p.userId === userId);
      
      if (progress?.status === "completed") {
        stats.completed++;
      } else if (progress?.status === "in_progress") {
        stats.inProgress++;
      } else {
        stats.notStarted++;
      }
    });
  });

  // Process training completions
  scopedCompletions.forEach(completion => {
    const user = scopedUsers.find(u => u.id === completion.userId);
    if (!user || !user.departmentId) return;
    
    const deptId = user.departmentId;
    if (!deptStats.has(deptId)) {
      deptStats.set(deptId, { completed: 0, inProgress: 0, notStarted: 0 });
    }
    
    const stats = deptStats.get(deptId)!;
    if (completion.status === "COMPLETED") {
      stats.completed++;
    } else if (completion.status === "ASSIGNED") {
      stats.inProgress++;
    } else {
      stats.notStarted++;
    }
  });

  return Array.from(deptStats.entries())
    .map(([deptId, stats]) => ({
      deptName: departments.find(d => d.id === deptId)?.name || deptId,
      completed: stats.completed,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
    }))
    .filter(item => item.completed + item.inProgress + item.notStarted > 0);
}

/**
 * Build completions trend (daily counts for last 30 days)
 */
export function buildCompletionsTrend(scope: Scope): Array<{
  date: string;
  count: number;
}> {
  const scopedProgress = getScopedProgressCourses(scope);
  const scopedCompletions = getScopedData(scope).completions;
  const thirtyDaysAgo = addDays(today(), -30);
  
  // Daily map
  const dailyCounts = new Map<string, number>();
  
  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = addDays(today(), -i);
    const dateKey = date.split('T')[0]; // YYYY-MM-DD
    dailyCounts.set(dateKey, 0);
  }
  
  // Count course completions
  scopedProgress.forEach(progress => {
    if (progress.completedAt && progress.completedAt >= thirtyDaysAgo) {
      const dateKey = progress.completedAt.split('T')[0];
      const current = dailyCounts.get(dateKey) || 0;
      dailyCounts.set(dateKey, current + 1);
    }
  });
  
  // Count training completions
  scopedCompletions.forEach(completion => {
    if (completion.completedAt && completion.completedAt >= thirtyDaysAgo) {
      const dateKey = completion.completedAt.split('T')[0];
      const current = dailyCounts.get(dateKey) || 0;
      dailyCounts.set(dateKey, current + 1);
    }
  });
  
  return Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Build assignment status mix for donut chart
 */
export function buildStatusMix(scope: Scope): {
  completed: number;
  inProgress: number;
  dueSoon: number;
  overdue: number;
} {
  const scopedAssignments = getScopedAssignments(scope);
  const scopedProgress = getScopedProgressCourses(scope);
  const scopedCompletions = getScopedData(scope).completions;
  const todayStr = today();
  const sevenDaysFromNow = addDays(todayStr, 7);
  
  let completed = 0;
  let inProgress = 0;
  let dueSoon = 0;
  let overdue = 0;
  
  // Process course assignments
  scopedAssignments.forEach(assignment => {
    const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
    assigneeIds.forEach(userId => {
      const progress = scopedProgress.find(p => p.courseId === assignment.courseId && p.userId === userId);
      
      if (progress?.status === "completed") {
        completed++;
      } else if (progress?.status === "in_progress") {
        inProgress++;
      } else if (assignment.dueAt) {
        if (assignment.dueAt < todayStr) {
          overdue++;
        } else if (assignment.dueAt <= sevenDaysFromNow) {
          dueSoon++;
        }
      }
    });
  });
  
  // Process training completions
  scopedCompletions.forEach(completion => {
    if (completion.status === "COMPLETED") {
      completed++;
    } else if (completion.status === "ASSIGNED") {
      if (completion.dueAt) {
        if (completion.dueAt < todayStr) {
          overdue++;
        } else if (completion.dueAt <= sevenDaysFromNow) {
          dueSoon++;
        } else {
          inProgress++;
        }
      } else {
        inProgress++;
      }
    } else if (completion.status === "OVERDUE") {
      overdue++;
    }
  });
  
  return { completed, inProgress, dueSoon, overdue };
}

/**
 * Compute AI insights (deterministic stub)
 */
export function computeAiInsights(scope: Scope): {
  risks: string[];
  wins: string[];
  focus: string[];
} {
  const scopedUsers = getScopedData(scope).users;
  const scopedAssignments = getScopedAssignments(scope);
  const scopedProgress = getScopedProgressCourses(scope);
  const scopedCompletions = getScopedData(scope).completions;
  const scopedQuizAttempts = getScopedQuizAttempts(scope);
  const departments = getDepartmentsFromStore();
  const courses = getCourses();
  const todayStr = today();
  
  // Risks: Top 3 departments by overdue percentage
  const deptOverdue = new Map<string, { overdue: number; total: number }>();
  
  scopedAssignments.forEach(assignment => {
    const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
    assigneeIds.forEach(userId => {
      const user = scopedUsers.find(u => u.id === userId);
      if (!user || !user.departmentId) return;
      
      const deptId = user.departmentId;
      if (!deptOverdue.has(deptId)) {
        deptOverdue.set(deptId, { overdue: 0, total: 0 });
      }
      
      const stats = deptOverdue.get(deptId)!;
      stats.total++;
      
      if (assignment.dueAt && assignment.dueAt < todayStr) {
        const progress = scopedProgress.find(p => p.courseId === assignment.courseId && p.userId === userId);
        if (!progress || progress.status !== "completed") {
          stats.overdue++;
        }
      }
    });
  });
  
  scopedCompletions.forEach(completion => {
    const user = scopedUsers.find(u => u.id === completion.userId);
    if (!user || !user.departmentId) return;
    
    const deptId = user.departmentId;
    if (!deptOverdue.has(deptId)) {
      deptOverdue.set(deptId, { overdue: 0, total: 0 });
    }
    
    const stats = deptOverdue.get(deptId)!;
    stats.total++;
    if (completion.status === "OVERDUE") {
      stats.overdue++;
    }
  });
  
  const risks = Array.from(deptOverdue.entries())
    .map(([deptId, stats]) => ({
      deptName: departments.find(d => d.id === deptId)?.name || deptId,
      pct: stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0,
    }))
    .filter(item => item.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map(item => `${item.deptName}: ${item.pct}% overdue`);
  
  // Wins: Top 3 courses with highest near-complete (80-99% progress)
  const courseProgress = new Map<string, number>();
  
  scopedProgress.forEach(progress => {
    if (progress.lessonTotal > 0) {
      const pct = Math.round((progress.lessonDoneCount / progress.lessonTotal) * 100);
      if (pct >= 80 && pct < 100) {
        const current = courseProgress.get(progress.courseId) || 0;
        courseProgress.set(progress.courseId, Math.max(current, pct));
      }
    }
  });
  
  const wins = Array.from(courseProgress.entries())
    .map(([courseId, pct]) => ({
      courseName: courses.find(c => c.id === courseId)?.title || courseId,
      pct,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map(item => `${item.courseName}: ${item.pct}% complete`);
  
  // Focus: Top 3 courses with lowest avg quiz score
  const courseScores = new Map<string, number[]>();
  
  scopedQuizAttempts.forEach(attempt => {
    if (attempt.submittedAt && attempt.scorePct !== undefined) {
      const existing = courseScores.get(attempt.courseId) || [];
      existing.push(attempt.scorePct);
      courseScores.set(attempt.courseId, existing);
    }
  });
  
  const focus = Array.from(courseScores.entries())
    .map(([courseId, scores]) => ({
      courseName: courses.find(c => c.id === courseId)?.title || courseId,
      avgScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)
    .map(item => `${item.courseName}: ${item.avgScore}% avg score`);
  
  return { risks, wins, focus };
}

// ============================================================================
// Phase II — 1M.1: Skills Tagging Stats (Optional)
// ============================================================================

/**
 * Compute earned skills count for a user
 */
export function computeEarnedSkills(userId: string): number {
  const { getEarnedSkillsByUser } = require("./store");
  const earnedSkills = getEarnedSkillsByUser(userId);
  return earnedSkills.length;
}

/**
 * Get skill counts by department (for future analytics)
 */
export function skillCountsByDept(scope: Scope): Array<{ deptName: string; skillCount: number }> {
  const { getEarnedSkillsByUser, getUsers } = require("./store");
  const departments = getDepartmentsFromStore();
  const scopedUsers = getScopedData(scope).users;
  
  const deptSkillCounts = new Map<string, Set<string>>();
  
  scopedUsers.forEach(user => {
    if (!user.departmentId) return;
    const earnedSkills = getEarnedSkillsByUser(user.id);
    earnedSkills.forEach(({ skill }) => {
      if (!deptSkillCounts.has(user.departmentId)) {
        deptSkillCounts.set(user.departmentId, new Set());
      }
      deptSkillCounts.get(user.departmentId)!.add(skill.id);
    });
  });
  
  return Array.from(deptSkillCounts.entries())
    .map(([deptId, skillSet]) => ({
      deptName: departments.find(d => d.id === deptId)?.name || deptId,
      skillCount: skillSet.size,
    }))
    .sort((a, b) => b.skillCount - a.skillCount);
}

// ============================================================================
// Phase II — 1M.2: Skill Coverage Analytics
// ============================================================================

/**
 * Get skill coverage by scope (top 8 skills by demand)
 */
export function skillCoverageByScope(scope: Scope): Array<{
  skillId: string;
  skillName: string;
  category?: string;
  coveragePct: number;
  haveCount: number;
  needCount: number;
}> {
  const scopedUsers = getScopedData(scope).users;
  const scopedUserIds = new Set(scopedUsers.map(u => u.id));
  const allSkills = getSkills();
  const allCourses = getCourses();
  const allAssignments = getAssignments();
  
  // Get all courses with skills that are assigned to scoped users
  const coursesWithSkills = allCourses.filter(c => c.skills && c.skills.length > 0);
  
  // Build skill demand map: skillId -> Set of userIds assigned to courses with that skill
  const skillDemandMap = new Map<string, Set<string>>();
  
  coursesWithSkills.forEach(course => {
    if (!course.skills) return;
    
    // Find all assignments for this course
    const courseAssignments = allAssignments.filter(a => a.courseId === course.id);
    
    course.skills.forEach(skillId => {
      if (!skillDemandMap.has(skillId)) {
        skillDemandMap.set(skillId, new Set());
      }
      
      // Resolve assignees for each assignment
      courseAssignments.forEach(assignment => {
        const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
        assigneeIds.forEach(assigneeId => {
          // Only count if assignee is in scoped users
          if (scopedUserIds.has(assigneeId)) {
            skillDemandMap.get(skillId)!.add(assigneeId);
          }
        });
      });
    });
  });
  
  // Calculate coverage for each skill
  const coverageData = Array.from(skillDemandMap.entries())
    .map(([skillId, needUserIds]) => {
      const needCount = needUserIds.size;
      
      // Count how many of these users have the skill
      let haveCount = 0;
      needUserIds.forEach(userId => {
        const earnedSkills = getEarnedSkillsByUser(userId);
        if (earnedSkills.some(({ skill }) => skill.id === skillId)) {
          haveCount++;
        }
      });
      
      const coveragePct = needCount > 0 ? Math.round((haveCount / needCount) * 100) : 0;
      
      const skill = allSkills.find(s => s.id === skillId);
      if (!skill) return null;
      
      return {
        skillId,
        skillName: skill.name,
        category: skill.category,
        coveragePct,
        haveCount,
        needCount,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.needCount - a.needCount) // Sort by demand (needCount) descending
    .slice(0, 8); // Top 8
  
  return coverageData;
}

/**
 * Get learners missing a specific skill (scoped)
 */
export function learnersMissingSkill(
  scope: Scope,
  skillId: string
): Array<{
  user: User;
  siteName: string;
  deptName: string;
  assignedCourses: Course[];
}> {
  const scopedUsers = getScopedData(scope).users;
  const allCourses = getCourses();
  const allAssignments = getAssignments();
  const sites = getSites();
  const departments = getDepartments();
  
  // Find courses that include this skill
  const coursesWithSkill = allCourses.filter(
    c => c.skills && c.skills.includes(skillId)
  );
  
  // Find learners who don't have the skill
  const missingLearners = scopedUsers.filter(user => {
    const earnedSkills = getEarnedSkillsByUser(user.id);
    return !earnedSkills.some(({ skill }) => skill.id === skillId);
  });
  
  // For each missing learner, find assigned courses that confer the skill
  return missingLearners.map(user => {
    // Get all assignments for this user
    const userAssignments = allAssignments.filter(assignment => {
      const assigneeIds = resolveAssigneesForCourse(assignment.courseId);
      return assigneeIds.includes(user.id);
    });
    
    // Find which of these assignments are for courses with the skill
    const assignedCoursesWithSkill = coursesWithSkill.filter(course =>
      userAssignments.some(a => a.courseId === course.id)
    );
    
    return {
      user,
      siteName: user.siteId ? sites.find(s => s.id === user.siteId)?.name || '' : '',
      deptName: user.departmentId ? departments.find(d => d.id === user.departmentId)?.name || '' : '',
      assignedCourses: assignedCoursesWithSkill,
    };
  });
}

// Phase II — 1N.3: Library stats functions
export function countLibraryByType() {
  const { getLibraryItems } = require('./store');
  const items = getLibraryItems();
  
  const byType: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  
  items.forEach((item: any) => {
    if (item.type === 'file' && item.fileType) {
      byType[item.fileType] = (byType[item.fileType] || 0) + 1;
    }
    if (item.source) {
      bySource[item.source] = (bySource[item.source] || 0) + 1;
    }
  });
  
  return { byType, bySource };
}

export function recentLibraryActivity(limit = 10) {
  const { getLibraryItems } = require('./store');
  const items = getLibraryItems();
  
  return items
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

