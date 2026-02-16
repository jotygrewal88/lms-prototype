"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  FileText,
  Wrench,
  BarChart3,
  Radio,
  Scale,
  CheckCircle2,
  Clock,
  Eye,
  MoreVertical,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
} from "lucide-react";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import ResolveModal from "./ResolveModal";
import {
  acknowledgeSignal,
  resolveSignal,
  getCurrentUser,
  getActiveSkillsV2,
  getUser,
} from "@/lib/store";
import { getFullName } from "@/types";
import type { OperationalSignal } from "@/types";

const SEVERITY_COLORS: Record<string, { border: string; badge: string }> = {
  critical: { border: "border-l-red-500", badge: "error" },
  high: { border: "border-l-orange-500", badge: "warning" },
  medium: { border: "border-l-amber-400", badge: "info" },
  low: { border: "border-l-blue-400", badge: "default" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  incident: AlertOctagon,
  near_miss: AlertTriangle,
  regulatory_change: Scale,
  source_update: FileText,
  equipment_change: Wrench,
  process_change: Radio,
  assessment_anomaly: BarChart3,
};

const TYPE_LABELS: Record<string, string> = {
  incident: "Incident",
  near_miss: "Near Miss",
  regulatory_change: "Regulatory Change",
  source_update: "Source Update",
  equipment_change: "Equipment Change",
  process_change: "Process Change",
  assessment_anomaly: "Assessment Anomaly",
};

const ACTION_LABELS: Record<string, string> = {
  individual_retraining: "Individual Retraining",
  corrective_training: "Corrective Training",
  micro_lesson: "Micro-Lesson",
  content_review: "Content Review",
  delta_renewal: "Delta Renewal",
  full_regeneration: "Full Regeneration",
  none: "No Action Needed",
};

interface SignalCardProps {
  signal: OperationalSignal;
  onGenerateTraining?: (signal: OperationalSignal) => void;
}

export default function SignalCard({ signal, onGenerateTraining }: SignalCardProps) {
  const allSkills = getActiveSkillsV2();
  const currentUser = getCurrentUser();
  const [expanded, setExpanded] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const severity = SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.low;
  const TypeIcon = TYPE_ICONS[signal.type] || AlertTriangle;

  const affectedSkillNames = signal.affectedSkillIds
    .map((id) => allSkills.find((s) => s.id === id)?.name || id)
    .join(", ");

  const involvedNames = (signal.involvedUserIds || [])
    .map((uid) => {
      const u = getUser(uid);
      return u ? getFullName(u) : uid;
    })
    .join(", ");

  const descTruncated =
    signal.description.length > 200 && !expanded
      ? signal.description.slice(0, 200) + "..."
      : signal.description;

  const handleAcknowledge = () => {
    acknowledgeSignal(signal.id, currentUser.id);
    setToast("Signal acknowledged");
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateTraining = () => {
    if (onGenerateTraining) {
      onGenerateTraining(signal);
    } else {
      setToast("Training generation coming soon. Signal acknowledged.");
      if (signal.status === "open") acknowledgeSignal(signal.id, currentUser.id);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleResolve = (notes: string) => {
    resolveSignal(signal.id, currentUser.id, notes);
    setShowResolve(false);
    setToast("Signal resolved");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <div
        className={`border border-gray-200 border-l-4 ${severity.border} rounded-lg p-5 bg-white`}
      >
        {/* Top row: badges + date */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant={severity.badge as "error" | "warning" | "info" | "default"}>
            {signal.severity.toUpperCase()}
          </Badge>
          <Badge variant="default">
            <TypeIcon className="w-3 h-3 mr-1 inline" />
            {TYPE_LABELS[signal.type]}
          </Badge>
          <Badge
            variant={
              signal.status === "open"
                ? "warning"
                : signal.status === "acknowledged"
                ? "info"
                : signal.status === "resolved"
                ? "success"
                : "default"
            }
          >
            {signal.status === "open"
              ? "Open"
              : signal.status === "acknowledged"
              ? "Acknowledged"
              : signal.status === "training_generated"
              ? "Training Generated"
              : "Resolved"}
          </Badge>
          <span className="ml-auto text-xs text-gray-400">
            {new Date(signal.occurredAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1">{signal.title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3">
          {descTruncated}
          {signal.description.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-3 h-3 ml-0.5" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-3 h-3 ml-0.5" />
                </>
              )}
            </button>
          )}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          {affectedSkillNames && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-gray-400" />
              Affected Skills:{" "}
              <span className="font-medium text-gray-700">{affectedSkillNames}</span>
            </span>
          )}
          {signal.affectedSiteId && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              {signal.affectedSiteId === "site_plant_a" ? "Plant A" : signal.affectedSiteId}
            </span>
          )}
          {involvedNames && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              Involved: <span className="font-medium text-gray-700">{involvedNames}</span>
            </span>
          )}
        </div>

        {/* Recommendation */}
        {signal.recommendedAction !== "none" && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-3">
            <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Recommended: {ACTION_LABELS[signal.recommendedAction]}
              </p>
              {signal.recommendedActionReason && (
                <p className="text-xs text-blue-600 mt-0.5">
                  {signal.recommendedActionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resolution notes (if resolved) */}
        {signal.status === "resolved" && signal.resolutionNotes && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-emerald-700">Resolution</p>
              <p className="text-xs text-emerald-600">{signal.resolutionNotes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {signal.status === "open" && (
            <button
              onClick={handleAcknowledge}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-3.5 h-3.5" />
              Acknowledge
            </button>
          )}
          {signal.status !== "resolved" && (
            <>
              <button
                onClick={handleGenerateTraining}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-800"
              >
                <Radio className="w-3.5 h-3.5" />
                Generate Training
              </button>
              <button
                onClick={() => setShowResolve(true)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve
              </button>
            </>
          )}
        </div>
      </div>

      {showResolve && (
        <ResolveModal
          signalTitle={signal.title}
          onResolve={handleResolve}
          onClose={() => setShowResolve(false)}
        />
      )}

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </>
  );
}
