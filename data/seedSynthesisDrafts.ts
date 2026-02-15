import type { SynthesisHistory } from "@/types";

const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

// SynthesisDrafts are no longer used — AI drafts are now stored as Courses.
// Only SynthesisHistory records remain for the audit log in Learning Model → History.

export const seedSynthesisHistory: SynthesisHistory[] = [
  {
    id: "syn_001",
    draftId: "crs_ai_loto_001",
    synthesisType: "full-course",
    status: "success",
    sourceCount: 2,
    lessonCount: 3,
    generatedByUserId: "usr_admin_001",
    generatedTitle: "Lockout/Tagout (LOTO) Safety Training",
    generationTimeMs: 3200,
    outcome: "pending",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: "syn_002",
    draftId: "crs_ai_cs_001",
    synthesisType: "full-course",
    status: "success",
    sourceCount: 1,
    lessonCount: 3,
    generatedByUserId: "usr_admin_001",
    generatedTitle: "Confined Space Entry Training",
    generationTimeMs: 2800,
    outcome: "approved",
    publishedCourseId: "crs_ai_cs_001",
    createdAt: tenDaysAgo,
    updatedAt: fiveDaysAgo,
  },
  {
    id: "syn_003",
    draftId: "crs_ai_ppe_001",
    synthesisType: "micro-lesson",
    status: "success",
    sourceCount: 1,
    lessonCount: 1,
    generatedByUserId: "usr_admin_001",
    generatedTitle: "PPE Basics — Quick Overview",
    generationTimeMs: 1500,
    outcome: "rejected",
    createdAt: fiveDaysAgo,
    updatedAt: fiveDaysAgo,
  },
];
