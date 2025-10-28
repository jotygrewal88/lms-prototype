// Phase I AI Uplift: Smart Compliance Coach - Insight Rules Engine
import { Scope } from "@/types";
import { 
  getScopedData, 
  calculateDistribution, 
  onTimePctLast30d,
  overdueRateByDept,
  dueSoonBySite,
  expiringNext30d,
  topOverdueTraining,
  overdueDetailByManager,
  ManagerOverdueDetail,
} from "./stats";

export type CoachInsightSeverity = "critical" | "warning" | "info" | "positive";

export type CoachInsightAction = 
  | { type: "filterDept"; payload: { deptId: string; deptName: string } }
  | { type: "openNotify" }
  | { type: "openSettings" }
  | { type: "viewTeam"; payload: { siteId: string; deptId: string } }
  | { type: "draftEscalation"; payload: { managerId: string } }
  | { type: "adjustCadence" };

export interface CoachInsight {
  id: string;
  severity: CoachInsightSeverity;
  message: string;
  action?: CoachInsightAction;
}

/**
 * Manager escalation insight with full risk analysis
 */
export interface ManagerEscalationInsight {
  id: string;
  kind: "managerEscalation";
  severity: "critical" | "warning";
  managerId: string;
  managerName: string;
  siteName?: string;
  deptName?: string;
  overdueCount: number;
  teamSize: number;
  overdueRate: number;
  medianDays: number;
  maxDays: number;
  dueSoonRate: number;
  topProblemTraining?: {
    trainingId: string;
    title: string;
    overdueCount: number;
  };
  risk: number;
  confidence: "low" | "med" | "high";
  onTimePctSeries: number[];
  message: string;
  actions: Array<{
    type: "viewTeam" | "draftEscalation" | "adjustCadence";
    payload?: any;
  }>;
}

/**
 * Calculate risk score based on compliance metrics
 */
export function riskScore(x: {
  overdueRate: number;
  medianDays: number;
  maxDays: number;
  dueSoonRate: number;
}): number {
  const score = 
    40 * x.overdueRate +
    0.6 * x.medianDays +
    0.3 * x.maxDays +
    8 * x.dueSoonRate;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Determine confidence level based on sample size
 */
export function confidence(sample: {
  activeAssignments: number;
  recentWeeks: number;
}): "low" | "med" | "high" {
  if (sample.activeAssignments < 5 || sample.recentWeeks < 4) return "low";
  if (sample.activeAssignments < 15 || sample.recentWeeks < 6) return "med";
  return "high";
}

interface CoachStats {
  distribution: ReturnType<typeof calculateDistribution>;
  onTimeStats: ReturnType<typeof onTimePctLast30d>;
  deptOverdueRates: ReturnType<typeof overdueRateByDept>;
  siteDueSoon: ReturnType<typeof dueSoonBySite>;
  expiringCount: number;
  totalAssignments: number;
  topOverdue: ReturnType<typeof topOverdueTraining>;
}

/**
 * Get smart coaching insights based on current scope and data
 */
export function getCoachInsights(scope: Scope): (ManagerEscalationInsight | CoachInsight)[] {
  const insights: (ManagerEscalationInsight | CoachInsight)[] = [];
  
  // Gather scoped data
  const scoped = getScopedData(scope);
  const { completions, trainings, users, sites, departments } = scoped;
  
  // Get manager-level details
  const managerDetails = overdueDetailByManager(scoped);
  
  // Build manager escalation insights
  for (const detail of managerDetails) {
    // Trigger: overdueCount >= 3 && (overdueRate >= 0.25 || medianDays >= 10)
    if (detail.overdueCount >= 3 && 
        (detail.overdueRate >= 0.25 || detail.overdueAging.medianDays >= 10)) {
      
      const risk = riskScore({
        overdueRate: detail.overdueRate,
        medianDays: detail.overdueAging.medianDays,
        maxDays: detail.overdueAging.maxDays,
        dueSoonRate: detail.dueSoonRate,
      });
      
      const conf = confidence({
        activeAssignments: detail.activeAssignments,
        recentWeeks: 8,
      });
      
      const severity = risk >= 70 ? "critical" : "warning";
      
      // Fully resolved message
      const message = `Escalate: ${detail.managerName} • ${detail.siteName}/${detail.deptName} — ${detail.overdueCount} overdue / team ${detail.teamSize} (${Math.round(detail.overdueRate * 100)}%), median ${detail.overdueAging.medianDays}d, max ${detail.overdueAging.maxDays}d${detail.topProblemTraining ? `. Top: ${detail.topProblemTraining.title}` : ''}.`;
      
      insights.push({
        id: `mgr-esc-${detail.managerId}`,
        kind: "managerEscalation",
        severity,
        managerId: detail.managerId,
        managerName: detail.managerName,
        siteName: detail.siteName,
        deptName: detail.deptName,
        overdueCount: detail.overdueCount,
        teamSize: detail.teamSize,
        overdueRate: detail.overdueRate,
        medianDays: detail.overdueAging.medianDays,
        maxDays: detail.overdueAging.maxDays,
        dueSoonRate: detail.dueSoonRate,
        topProblemTraining: detail.topProblemTraining,
        risk,
        confidence: conf,
        onTimePctSeries: detail.onTimePctSeries,
        message,
        actions: [
          { type: "viewTeam", payload: { siteId: detail.siteId, deptId: detail.deptId } },
          { type: "draftEscalation", payload: { managerId: detail.managerId } },
          { type: "adjustCadence" },
        ],
      });
    }
  }
  
  // Sort by priority: overdueCount desc, overdueRate desc, medianDays desc
  const managerInsights = insights.filter(i => 'kind' in i && i.kind === "managerEscalation") as ManagerEscalationInsight[];
  managerInsights.sort((a, b) => {
    if (a.overdueCount !== b.overdueCount) return b.overdueCount - a.overdueCount;
    if (a.overdueRate !== b.overdueRate) return b.overdueRate - a.overdueRate;
    return b.medianDays - a.medianDays;
  });
  
  // Determine how many insights to show based on scope
  // If scope is ALL/ALL (org-wide), show more insights (up to 8)
  // If scope is filtered, show top 3-4
  const isOrgWide = scope.siteId === "ALL" && scope.deptId === "ALL";
  const maxInsights = isOrgWide ? 8 : 4;
  
  const topManagerInsights: (ManagerEscalationInsight | CoachInsight)[] = managerInsights.slice(0, maxInsights);
  
  // Add 1 positive/info insight if applicable and space allows
  if (topManagerInsights.length < 4) {
    const stats: CoachStats = {
      distribution: calculateDistribution(completions),
      onTimeStats: onTimePctLast30d(completions),
      deptOverdueRates: overdueRateByDept(completions, users, departments),
      siteDueSoon: dueSoonBySite(completions, users, sites),
      expiringCount: expiringNext30d(completions),
      totalAssignments: completions.length,
      topOverdue: topOverdueTraining(completions, trainings),
    };
    
    // POSITIVE - Strong on-time performance (> 85%)
    if (stats.onTimeStats.pct > 85 && stats.onTimeStats.totalCompletions >= 5) {
      topManagerInsights.push({
        id: "positive-ontime",
        severity: "positive",
        message: `Excellent on-time completion rate: ${stats.onTimeStats.pct}% over the last 30 days. Keep up the great work!`,
      });
    } else if (stats.expiringCount > 0) {
      // INFO - Certifications expiring
      topManagerInsights.push({
        id: "info-expiring",
        severity: "info",
        message: `${stats.expiringCount} certifications will expire in the next 30 days. Review retraining schedules to avoid gaps.`,
      });
    }
  }
  
  // Default fallback if no insights
  if (topManagerInsights.length === 0) {
    topManagerInsights.push({
      id: "info-default",
      severity: "info",
      message: "All compliance metrics are within normal ranges. Continue monitoring for changes.",
    });
  }
  
  return topManagerInsights;
}

