"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NotificationComposeModal from "./NotificationComposeModal";
import CoachCTAGroup from "./CoachCTAGroup";
import { useScope } from "@/hooks/useScope";
import { aggregateCoachStats, TeamRow } from "@/lib/stats";
import { subscribe, setScope, getUser } from "@/lib/store";
import { buildManagerEscalationContext, defaultEscalationForManager } from "@/lib/notifyAI";

// Mini overdue bar component
function OverdueBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }}
        className="h-2 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
      />
    </div>
  );
}

// Risk pill component
function RiskPill({ risk }: { risk: number }) {
  if (risk >= 40) {
    return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">High Risk</span>;
  }
  if (risk >= 25) {
    return <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700">Moderate</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-700">Healthy</span>;
}

export default function SmartComplianceCoach() {
  const { scope } = useScope();
  const router = useRouter();
  const [stats, setStats] = useState<ReturnType<typeof aggregateCoachStats> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<any>(null);

  useEffect(() => {
    const update = () => setStats(aggregateCoachStats(scope));
    update();
    return subscribe(update);
  }, [scope]);

  if (!stats) return null;

  // Build AI summary paragraph
  const buildSummary = () => {
    const { summary, high } = stats;
    const target = 90;
    const delta = summary.overallCompliancePct - target;
    const deltaText = delta >= 0 ? `${delta}% above target` : `${Math.abs(delta)}% below target`;
    
    if (high.length === 0) {
      return `Overall compliance at ${summary.overallCompliancePct}% (${deltaText}). No high-risk teams identified. Continue monitoring.`;
    }
    
    const highDepts = [...new Set(high.map(h => h.deptName))].slice(0, 2).join(" and ");
    const agingTrend = summary.worstAgingDays > 14 ? ` Avg overdue aging is ${summary.worstAgingDays} days (trending high).` : "";
    const offender = summary.topOffenderTraining ? ` '${summary.topOffenderTraining}' drives ${summary.topOffenderSharePct}% of open items.` : "";
    const recommendation = high.length > 0 ? ` Recommend escalating ${high[0].deptName} first.` : "";
    
    return `${highDepts} trending high risk.${agingTrend}${offender}${recommendation}`.trim();
  };

  const handleViewTeam = (row: TeamRow) => {
    setScope({ siteId: row.siteId, deptId: row.deptId });
    router.push("/admin/compliance");
  };

  const handleDraftEscalation = (row: TeamRow) => {
    const manager = getUser(row.managerId);
    if (!manager) return;
    
    const ctx = buildManagerEscalationContext({
      deptName: row.deptName,
      siteName: row.siteName,
      managerName: row.managerName,
      overdueCount: row.overdueCount,
      dueSoonRate: 0,
      teamSize: row.teamCount,
      topProblemTraining: row.topTrainingName ? { title: row.topTrainingName, overdueCount: row.topTrainingCount || 0 } : undefined,
      onTimePctSeries: [100],
    });
    
    const { subject, body } = defaultEscalationForManager(ctx);
    
    setModalContext({
      recipients: [{ userId: manager.id, name: row.managerName, email: manager.email }],
      subject,
      body,
      audience: "MANAGERS",
    });
    setIsModalOpen(true);
  };

  const renderTeamCard = (row: TeamRow) => (
    <div
      key={row.managerId}
      className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
    >
      {/* Header row with manager info and risk/actions */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {row.managerName}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {row.siteName} • {row.deptName}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <RiskPill risk={row.risk} />
          <CoachCTAGroup
            onView={() => handleViewTeam(row)}
            onEscalate={() => handleDraftEscalation(row)}
            onCadence={() => router.push("/admin/settings/notifications")}
          />
        </div>
      </div>

      {/* Content: metrics and visualization */}
      <div className="p-4 space-y-3">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-500 mb-0.5">Overdue</div>
            <div className="text-sm font-semibold text-gray-900">
              {row.overdueCount} of {row.teamCount} ({Math.round(row.overduePct * 100)}%)
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Aging</div>
            <div className="text-sm font-semibold text-gray-900">
              {row.agingMedianDays}d median, {row.agingMaxDays}d max
            </div>
          </div>
        </div>

        {/* Top issue */}
        {row.topTrainingName && (
          <div className="text-xs">
            <span className="text-gray-500">Top issue:</span>{" "}
            <span className="font-medium text-gray-900">{row.topTrainingName}</span>
            <span className="text-gray-500"> ({row.topTrainingCount})</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Overdue Rate</span>
            <span className="text-[10px] font-medium text-gray-700">{Math.round(row.overduePct * 100)}%</span>
          </div>
          <OverdueBar pct={row.overduePct} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-6 space-y-4">
        {/* AI Summary Banner */}
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Compliance Advisor</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {buildSummary()}
          </p>
        </div>

        {/* High Risk Section */}
        {stats.high.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold text-gray-700">High Risk Teams</h3>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                {stats.high.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {stats.high.map(renderTeamCard)}
            </div>
          </div>
        )}

        {/* Moderate Section */}
        {stats.med.length > 0 && (
          <div className="space-y-3 border-t border-gray-200 pt-4 mt-2">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold text-gray-700">Moderate Teams</h3>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                {stats.med.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {stats.med.map(renderTeamCard)}
            </div>
          </div>
        )}

        {/* Healthy Section */}
        {stats.low.length > 0 && (
          <div className="space-y-3 border-t border-gray-200 pt-4 mt-2">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold text-gray-700">Healthy Teams</h3>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                {stats.low.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {stats.low.slice(0, 4).map(renderTeamCard)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.high.length === 0 && stats.med.length === 0 && stats.low.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No team data available for the current scope.
          </div>
        )}
      </div>

      <NotificationComposeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTone="escalation"
        initialSource="Coach"
        defaultRecipientMode="managers"
        prefilledData={modalContext}
      />
    </>
  );
}

