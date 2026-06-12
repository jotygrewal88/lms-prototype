// Scoring logic for matching generated onboarding path items to real
// records in the Course library and the Trainings module.
//
// The wizard's review step (Step 4) consumes this to surface
// "Suggested: <record>" chips for each AI-generated slot.
//
// Scoring is intentionally simple: skill-ID overlap between the item's
// `skillsGranted` array and the candidate's `skillsGranted` array, with
// a small bonus for exact-match (item grants exactly the candidate's skills),
// and ties broken in favor of Courses (more trackable than Trainings).

import type { Course, Training, OnboardingPhaseCourse } from "@/types";

export type MatchKind = "course" | "training";

export interface MatchCandidate {
  kind: MatchKind;
  id: string;
  title: string;
  confidence: number; // 0..1
  skillsGranted: string[];
  estimatedMinutes?: number;
  // Original record for downstream access (icon, category, etc.)
  course?: Course;
  training?: Training;
}

export interface MatchResult {
  /** Top match, if any candidate scored at or above CONFIDENCE_THRESHOLD. */
  top: MatchCandidate | null;
  /** All viable candidates ordered by confidence desc (top first). */
  viable: MatchCandidate[];
  /**
   * Best alternative of the OPPOSITE kind from `top` — useful for the
   * "a course exists" / "a training exists" alternative chip.
   */
  alternateKind: MatchCandidate | null;
}

/** Below this, we treat the match as "no match" rather than a low-confidence suggestion. */
export const CONFIDENCE_THRESHOLD = 0.4;

const scoreSkillOverlap = (itemSkills: string[], candidateSkills: string[]): number => {
  if (itemSkills.length === 0 || candidateSkills.length === 0) return 0;
  const itemSet = new Set(itemSkills);
  const overlap = candidateSkills.filter((s) => itemSet.has(s)).length;
  if (overlap === 0) return 0;

  // Coverage of the item's required skills (primary signal)
  const itemCoverage = overlap / itemSkills.length;
  // Specificity of the candidate (penalize candidates that grant a lot of
  // unrelated skills, so a laser-focused course beats a sprawling one)
  const specificity = overlap / candidateSkills.length;

  // 70/30 weighting — coverage matters most, specificity is a tiebreaker
  let score = itemCoverage * 0.7 + specificity * 0.3;

  // Exact-match bonus: candidate grants exactly the same skill set
  if (
    itemSkills.length === candidateSkills.length &&
    itemCoverage === 1 &&
    specificity === 1
  ) {
    score = Math.min(1, score + 0.05);
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Suggest matches for a single onboarding phase item.
 *
 * @param item           The AI-generated item.
 * @param publishedCourses Candidate courses (already filtered to status==="published").
 * @param activeTrainings Candidate trainings (already filtered to status==="active").
 * @param excluded       IDs already accepted for OTHER items in this same path —
 *                       prevents the same record from being suggested twice.
 */
export function suggestMatches(
  item: OnboardingPhaseCourse,
  publishedCourses: Course[],
  activeTrainings: Training[],
  excluded: { courseIds: Set<string>; trainingIds: Set<string> },
): MatchResult {
  // To-dos don't get suggestions.
  if (item.kind === "todo") {
    return { top: null, viable: [], alternateKind: null };
  }

  const itemSkills = item.skillsGranted || [];

  const courseCandidates: MatchCandidate[] = publishedCourses
    .filter((c) => !excluded.courseIds.has(c.id))
    .map((c) => ({
      kind: "course" as const,
      id: c.id,
      title: c.title,
      confidence: scoreSkillOverlap(
        itemSkills,
        (c.skillsGranted || []).map((s) => s.skillId),
      ),
      skillsGranted: (c.skillsGranted || []).map((s) => s.skillId),
      estimatedMinutes: c.estimatedMinutes ?? c.metadata?.estimatedMinutes,
      course: c,
    }))
    .filter((c) => c.confidence >= CONFIDENCE_THRESHOLD);

  const trainingCandidates: MatchCandidate[] = activeTrainings
    .filter((t) => !excluded.trainingIds.has(t.id))
    .map((t) => ({
      kind: "training" as const,
      id: t.id,
      title: t.title,
      confidence: scoreSkillOverlap(
        itemSkills,
        (t.skillsGranted || []).map((s) => s.skillId),
      ),
      skillsGranted: (t.skillsGranted || []).map((s) => s.skillId),
      training: t,
    }))
    .filter((c) => c.confidence >= CONFIDENCE_THRESHOLD);

  const viable = [...courseCandidates, ...trainingCandidates].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    // Tie-break: prefer Courses (trackable completion)
    if (a.kind !== b.kind) return a.kind === "course" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const top = viable[0] ?? null;
  const alternateKind = top
    ? viable.find((c) => c.kind !== top.kind) ?? null
    : null;

  return { top, viable, alternateKind };
}

/**
 * Convenience search across both Courses and Trainings — used by the swap
 * picker. Returns up to `limit` matches scored against `itemSkills` (when
 * provided) and filtered by a free-text query against title/description.
 */
export function searchCandidates(opts: {
  query: string;
  itemSkills: string[];
  publishedCourses: Course[];
  activeTrainings: Training[];
  excluded: { courseIds: Set<string>; trainingIds: Set<string> };
  limit?: number;
}): MatchCandidate[] {
  const { query, itemSkills, publishedCourses, activeTrainings, excluded, limit = 50 } = opts;
  const q = query.trim().toLowerCase();

  const matchesQuery = (text: string) => (q ? text.toLowerCase().includes(q) : true);

  const courseHits: MatchCandidate[] = publishedCourses
    .filter((c) => !excluded.courseIds.has(c.id))
    .filter((c) => matchesQuery(`${c.title} ${c.description || ""} ${c.category || ""}`))
    .map((c) => ({
      kind: "course" as const,
      id: c.id,
      title: c.title,
      confidence: scoreSkillOverlap(
        itemSkills,
        (c.skillsGranted || []).map((s) => s.skillId),
      ),
      skillsGranted: (c.skillsGranted || []).map((s) => s.skillId),
      estimatedMinutes: c.estimatedMinutes ?? c.metadata?.estimatedMinutes,
      course: c,
    }));

  const trainingHits: MatchCandidate[] = activeTrainings
    .filter((t) => !excluded.trainingIds.has(t.id))
    .filter((t) => matchesQuery(`${t.title} ${t.description || ""} ${t.category || ""}`))
    .map((t) => ({
      kind: "training" as const,
      id: t.id,
      title: t.title,
      confidence: scoreSkillOverlap(
        itemSkills,
        (t.skillsGranted || []).map((s) => s.skillId),
      ),
      skillsGranted: (t.skillsGranted || []).map((s) => s.skillId),
      training: t,
    }));

  return [...courseHits, ...trainingHits]
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.kind !== b.kind) return a.kind === "course" ? -1 : 1;
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

/** Convert a confidence number into a coarse label used in UI chips. */
export function confidenceLabel(c: number): { label: string; color: string } {
  if (c >= 0.85) return { label: "Strong match", color: "emerald" };
  if (c >= 0.65) return { label: "Good match", color: "blue" };
  if (c >= CONFIDENCE_THRESHOLD) return { label: "Possible match", color: "amber" };
  return { label: "Weak match", color: "gray" };
}
