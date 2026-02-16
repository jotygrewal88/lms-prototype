import type {
  CurrencyStatus,
  SignalType,
  SignalSeverity,
  OperationalSignal,
  OnboardingPath,
  LibraryItem,
} from "@/types";

const SIGNAL_IMPACT: Record<string, Record<string, number>> = {
  incident:           { critical: 25, high: 15, medium: 10, low: 5 },
  near_miss:          { critical: 10, high: 5,  medium: 5,  low: 3 },
  regulatory_change:  { critical: 30, high: 30, medium: 20, low: 10 },
  equipment_change:   { critical: 20, high: 15, medium: 10, low: 5 },
  process_change:     { critical: 20, high: 15, medium: 10, low: 5 },
  source_update:      { critical: 15, high: 10, medium: 5,  low: 3 },
  assessment_anomaly: { critical: 15, high: 10, medium: 10, low: 5 },
};

export function calculateCurrencyScore(
  artifact: OnboardingPath,
  openSignals: OperationalSignal[],
  allSources: LibraryItem[]
): { score: number; signalImpacts: Array<{ signalId: string; signalType: SignalType; impact: number }> } {
  let score = 100;
  const signalImpacts: Array<{ signalId: string; signalType: SignalType; impact: number }> = [];

  // 1. Source version drift
  for (const srcId of artifact.sourceIds) {
    const src = allSources.find((s) => s.id === srcId);
    if (!src) continue;
    // We assume version at generation was the latest at createdAt time.
    // For seed data, the path stores sourceIds but not the version snapshot.
    // We approximate: if source version > 1, each increment above 1 counts as drift.
    // In practice, ContentCurrency records store the snapshot; here we use a simple heuristic.
    if (src.version > 1) {
      const drift = src.version - 1;
      if (drift >= 2) {
        score -= 20;
      } else {
        score -= 5;
      }
    }
  }

  // 2. Signal impact
  const artifactSkills = new Set(artifact.skillsCovered);
  for (const sig of openSignals) {
    if (sig.status === "resolved") continue;
    const overlaps = sig.affectedSkillIds.some((sid) => artifactSkills.has(sid));
    if (!overlaps) continue;
    const impactMap = SIGNAL_IMPACT[sig.type];
    const impact = impactMap?.[sig.severity] ?? 5;
    score -= impact;
    signalImpacts.push({ signalId: sig.id, signalType: sig.type, impact });
  }

  // 3. Time decay: -1 per month since creation/publication
  const refDate = artifact.publishedAt || artifact.createdAt;
  if (refDate) {
    const months = Math.floor(
      (Date.now() - new Date(refDate).getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    score -= months;
  }

  return { score: Math.max(0, score), signalImpacts };
}

export function scoreToStatus(score: number): CurrencyStatus {
  if (score >= 90) return "current";
  if (score >= 70) return "aging";
  if (score >= 40) return "stale";
  return "outdated";
}
