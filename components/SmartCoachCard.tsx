// Phase I AI Uplift: Smart Compliance Coach Card v2.1
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Filter, Bell, Settings, ChevronDown, ChevronUp, Info } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import Sparkline from "./Sparkline";
import NotificationComposeModal from "./NotificationComposeModal";
import { useScope } from "@/hooks/useScope";
import { subscribe, setScope, getUser, getSiteById, getDepartmentById } from "@/lib/store";
import { getCoachInsights, CoachInsight, CoachInsightSeverity, ManagerEscalationInsight } from "@/lib/coach";
import { buildManagerEscalationContext, defaultEscalationForManager } from "@/lib/notifyAI";

const severityConfig: Record<CoachInsightSeverity, { bgColor: string; textColor: string; badgeColor: string }> = {
  critical: { 
    bgColor: "bg-red-50", 
    textColor: "text-red-900", 
    badgeColor: "bg-red-600 text-white" 
  },
  warning: { 
    bgColor: "bg-amber-50", 
    textColor: "text-amber-900", 
    badgeColor: "bg-amber-600 text-white" 
  },
  info: { 
    bgColor: "bg-blue-50", 
    textColor: "text-blue-900", 
    badgeColor: "bg-blue-600 text-white" 
  },
  positive: { 
    bgColor: "bg-green-50", 
    textColor: "text-green-900", 
    badgeColor: "bg-green-600 text-white" 
  },
};

function getRiskBadgeColor(risk: number): string {
  if (risk >= 70) return "bg-red-100 text-red-800";
  if (risk >= 40) return "bg-amber-100 text-amber-800";
  return "bg-green-100 text-green-800";
}

function getConfidenceDotColor(confidence: "low" | "med" | "high"): string {
  if (confidence === "high") return "bg-green-500";
  if (confidence === "med") return "bg-amber-500";
  return "bg-gray-400";
}

function hasTrendDown(series: number[]): boolean {
  if (series.length < 4) return false;
  const last4 = series.slice(-4);
  const drop = last4[0] - last4[last4.length - 1];
  return drop >= 10;
}

export default function SmartCoachCard() {
  const router = useRouter();
  const { scope } = useScope();
  const [insights, setInsights] = useState<(ManagerEscalationInsight | CoachInsight)[]>([]);
  const [, forceUpdate] = useState({});
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [escalationContext, setEscalationContext] = useState<any>(null);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [whatIfInsightId, setWhatIfInsightId] = useState<string | null>(null);
  const [whatIfSelection, setWhatIfSelection] = useState<string | null>(null);

  useEffect(() => {
    const updateInsights = () => {
      const newInsights = getCoachInsights(scope);
      setInsights(newInsights);
    };

    updateInsights();
    const unsubscribe = subscribe(() => {
      updateInsights();
      forceUpdate({});
    });

    return unsubscribe;
  }, [scope]);

  const handleViewTeam = (insight: ManagerEscalationInsight) => {
    const { siteId, deptId } = insight.actions.find(a => a.type === "viewTeam")?.payload || {};
    if (siteId && deptId) {
      setScope({ siteId, deptId });
      router.push("/admin/compliance");
    }
  };

  const handleDraftEscalation = (insight: ManagerEscalationInsight) => {
    const manager = getUser(insight.managerId);
    const ctx = buildManagerEscalationContext(insight);
    const { subject, body } = defaultEscalationForManager(ctx);
    
    setEscalationContext({
      recipients: manager ? [{ 
        userId: manager.id, 
        name: `${manager.firstName} ${manager.lastName}`, 
        email: manager.email 
      }] : [],
      subject,
      body,
      audience: "MANAGERS" as const,
    });
    
    setIsComposeModalOpen(true);
  };

  const handleAdjustCadence = () => {
    router.push("/admin/settings/notifications");
  };

  const toggleExplainability = (insightId: string) => {
    setExpandedInsightId(expandedInsightId === insightId ? null : insightId);
  };

  const toggleWhatIf = (insightId: string) => {
    setWhatIfInsightId(whatIfInsightId === insightId ? null : insightId);
    setWhatIfSelection(null);
  };

  const renderManagerInsight = (insight: ManagerEscalationInsight) => {
    const isExpanded = expandedInsightId === insight.id;
    const isWhatIfOpen = whatIfInsightId === insight.id;
    const trendDown = hasTrendDown(insight.onTimePctSeries);

    return (
      <div
        key={insight.id}
        className="border border-gray-200 rounded-lg p-4 bg-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-gray-900">
              {insight.managerName} — {insight.siteName}/{insight.deptName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] px-2 py-0.5 ${getRiskBadgeColor(insight.risk)}`}>
              Risk: {insight.risk}
            </Badge>
            <span 
              className={`w-2 h-2 rounded-full ${getConfidenceDotColor(insight.confidence)}`}
              title={`Confidence: ${insight.confidence}`}
            />
          </div>
        </div>

        {/* Metrics */}
        <ul className="text-[12px] text-gray-700 space-y-1 mb-3">
          <li>
            {insight.overdueCount} overdue of team {insight.teamSize} ({Math.round(insight.overdueRate * 100)}%)
          </li>
          <li>
            Aging: median {insight.medianDays}d, max {insight.maxDays}d
          </li>
          {insight.topProblemTraining && (
            <li>
              Top issue: {insight.topProblemTraining.title} ({insight.topProblemTraining.overdueCount})
            </li>
          )}
        </ul>

        {/* Trend Visualization */}
        <div className="flex items-center gap-3 mb-3">
          <Sparkline data={insight.onTimePctSeries} width={120} height={28} />
          {trendDown && (
            <Badge className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800">
              Trend down
            </Badge>
          )}
        </div>

        {/* What-if Dropdown */}
        <div className="mb-3">
          <button
            onClick={() => toggleWhatIf(insight.id)}
            className="text-[12px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            What-if scenarios
            {isWhatIfOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {isWhatIfOpen && (
            <div className="mt-2 space-y-2">
              <div 
                className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => setWhatIfSelection("reminder")}
              >
                <div className="text-[12px] font-medium text-gray-800">+1 reminder (T-3)</div>
                {whatIfSelection === "reminder" && (
                  <div className="text-[11px] text-green-700 mt-1">
                    Predicted lift: +6-9 pts
                  </div>
                )}
              </div>
              
              <div 
                className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => setWhatIfSelection("nudge")}
              >
                <div className="text-[12px] font-medium text-gray-800">Manager nudge now</div>
                {whatIfSelection === "nudge" && (
                  <div className="text-[11px] text-green-700 mt-1">
                    Predicted lift: +4-7 pts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Button 
            variant="secondary" 
            onClick={() => handleViewTeam(insight)}
            className="text-[12px] py-1 px-3"
          >
            View Team
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleDraftEscalation(insight)}
            className="text-[12px] py-1 px-3"
          >
            <Bell className="w-3 h-3" />
            Draft Escalation
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleAdjustCadence}
            className="text-[12px] py-1 px-3"
          >
            <Settings className="w-3 h-3" />
            Adjust Cadence
          </Button>
        </div>

        {/* Explainability Toggle */}
        <button
          onClick={() => toggleExplainability(insight.id)}
          className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          Why this insight?
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded text-[11px] text-gray-700 space-y-1">
            <div><strong>Risk Inputs:</strong></div>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Overdue rate: {Math.round(insight.overdueRate * 100)}%</li>
              <li>Median overdue days: {insight.medianDays}</li>
              <li>Max overdue days: {insight.maxDays}</li>
              <li>Due soon rate: {Math.round(insight.dueSoonRate * 100)}%</li>
              <li>Active assignments: {insight.teamSize}</li>
            </ul>
            <div className="mt-2"><strong>Risk Formula:</strong></div>
            <div className="font-mono text-[10px]">
              Risk = 40×overdueRate + 0.6×medianDays + 0.3×maxDays + 8×dueSoonRate
            </div>
            <div className="mt-2"><strong>Thresholds:</strong></div>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Trigger: overdueCount ≥ 3 AND (overdueRate ≥ 25% OR medianDays ≥ 10)</li>
              <li>Severity: Risk ≥ 70 = Critical, else Warning</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderGenericInsight = (insight: CoachInsight) => {
    const config = severityConfig[insight.severity];
    const action = insight.action;
    const hasFilterAction = action?.type === "filterDept" && "payload" in action && action.payload;
    
    return (
      <div
        key={insight.id}
        className={`p-3 rounded-lg ${config.bgColor} border border-gray-200`}
      >
        <div className="flex items-start gap-3">
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${config.badgeColor} flex-shrink-0 mt-0.5`}>
            {insight.severity}
          </span>
          <div className="flex-1">
            <p className={`text-[13px] leading-relaxed ${config.textColor}`}>
              {insight.message}
            </p>
            {hasFilterAction && action?.type === "filterDept" && "payload" in action && (
              <button
                onClick={() => {
                  setScope({ siteId: "ALL", deptId: action.payload.deptId });
                  router.push("/admin/compliance");
                }}
                className="mt-2 inline-flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 font-medium"
              >
                <Filter className="w-3 h-3" />
                Filter to {action.payload.deptName}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get scope display name
  const getScopeDisplay = () => {
    if (scope.siteId === "ALL" && scope.deptId === "ALL") {
      return "Organization-wide";
    }
    const site = scope.siteId !== "ALL" ? getSiteById(scope.siteId) : null;
    const dept = scope.deptId !== "ALL" ? getDepartmentById(scope.deptId) : null;
    
    if (site && dept) return `${site.name}${site.region ? ` (${site.region})` : ""} / ${dept.name}`;
    if (site) return site.region ? `${site.name} (${site.region})` : site.name;
    if (dept) return dept.name;
    return "Current scope";
  };

  return (
    <>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-[16px] font-semibold text-gray-900">Smart Compliance Coach</h2>
          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {getScopeDisplay()}
          </span>
          <span className="ml-auto text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
            AI Insight
          </span>
        </div>

        <div className={`space-y-3 ${insights.length > 4 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
          {insights.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">
              Loading insights...
            </div>
          ) : (
            <>
              {insights.length > 4 && (
                <div className="text-[11px] text-gray-600 mb-2 pb-2 border-b border-gray-200">
                  Showing {insights.filter(i => 'kind' in i && i.kind === "managerEscalation").length} manager insights (scroll to see all)
                </div>
              )}
              {insights.map((insight) => {
                if ("kind" in insight && insight.kind === "managerEscalation") {
                  return renderManagerInsight(insight);
                } else {
                  return renderGenericInsight(insight as CoachInsight);
                }
              })}
            </>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Insights refresh automatically based on current scope and data changes. Recommendations are generated using compliance metrics, trend analysis, and risk scoring.
          </p>
        </div>
      </Card>

      <NotificationComposeModal
        open={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        initialTone="escalation"
        initialSource="Coach"
        defaultRecipientMode="managers"
        prefilledData={escalationContext}
      />
    </>
  );
}
