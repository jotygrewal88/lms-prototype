// Skills V2 Migration Utilities — Surgical Rebuild
// DO NOT run automatically. Triggered manually from admin settings.
"use client";

import {
  getSkills,
  getCourses,
  getTrainings,
  getCompletions,
  updateCourse,
  updateTraining,
  createUserSkillRecord,
  getSkillsV2,
  createSkillV2,
  getUserSkillRecords,
} from "./store";
import type { SkillV2 } from "@/types";

/**
 * MIGRATION STEP 1: Import old skills into SkillsV2 format
 * Maps old Skill objects to SkillV2 with intelligent defaults
 */
export function migrateOldSkillsToV2(): {
  success: boolean;
  migrated: number;
  errors: string[];
} {
  const oldSkills = getSkills();
  const existingV2 = getSkillsV2();
  const errors: string[] = [];
  let migrated = 0;

  oldSkills.forEach((oldSkill) => {
    // Skip if already migrated (same ID exists in V2)
    if (existingV2.some((s) => s.id === oldSkill.id)) {
      return;
    }

    try {
      // Intelligent type detection based on name
      const nameLower = oldSkill.name.toLowerCase();
      const isCertification =
        nameLower.includes("certified") ||
        nameLower.includes("certification") ||
        nameLower.includes("operator");

      // Intelligent expiry assignment
      let expiryDays: number | undefined;
      if (isCertification) {
        if (nameLower.includes("forklift") || nameLower.includes("crane")) {
          expiryDays = 1095; // 3 years
        } else if (nameLower.includes("first aid") || nameLower.includes("cpr")) {
          expiryDays = 730; // 2 years
        } else {
          expiryDays = 365; // 1 year default
        }
      }

      createSkillV2({
        id: oldSkill.id, // Keep same ID for continuity
        name: oldSkill.name,
        category: oldSkill.category || "General",
        type: isCertification ? "certification" : "skill",
        expiryDays,
        requiresEvidence: isCertification,
        requiresAssessment: isCertification,
        active: true,
      });

      migrated++;
    } catch (error) {
      errors.push(`Failed to migrate skill ${oldSkill.name}: ${error}`);
    }
  });

  console.log(`Step 1 — Skills: ${migrated} migrated, ${errors.length} errors`);
  return { success: errors.length === 0, migrated, errors };
}

/**
 * MIGRATION STEP 2: Migrate Course.skills[] to Course.skillsGranted[]
 * Converts simple skill ID arrays to rich skill grant objects
 */
export function migrateCourseSkillsToV2(): {
  success: boolean;
  migrated: number;
  errors: string[];
} {
  const courses = getCourses();
  const errors: string[] = [];
  let migrated = 0;

  courses.forEach((course) => {
    if (!course.skills || course.skills.length === 0) return;
    if (course.skillsGranted && course.skillsGranted.length > 0) return; // Already migrated

    try {
      const skillsGranted = course.skills.map((skillId) => ({
        skillId,
        evidenceRequired: true,
      }));

      updateCourse(course.id, { skillsGranted } as any);
      migrated++;
    } catch (error) {
      errors.push(`Failed to migrate course ${course.title}: ${error}`);
    }
  });

  console.log(`Step 2 — Courses: ${migrated} migrated, ${errors.length} errors`);
  return { success: errors.length === 0, migrated, errors };
}

/**
 * MIGRATION STEP 3: Create UserSkillRecords from existing completions
 * Retroactively grants skills based on completed trainings/courses
 */
export function migrateCompletionsToUserSkillRecords(): {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
} {
  const completions = getCompletions();
  const trainings = getTrainings();
  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  completions.forEach((completion) => {
    if (completion.status !== "COMPLETED" || !completion.completedAt) {
      skipped++;
      return;
    }

    try {
      const training = trainings.find((t) => t.id === completion.trainingId);
      if (!training) {
        skipped++;
        return;
      }

      // Check if training has skillsGranted (new format)
      if (training.skillsGranted && training.skillsGranted.length > 0) {
        training.skillsGranted.forEach((skillGrant) => {
          try {
            // Check for duplicate
            const existing = getUserSkillRecords().find(
              (r) =>
                r.userId === completion.userId &&
                r.skillId === skillGrant.skillId &&
                r.evidenceId === training.id
            );
            if (existing) {
              skipped++;
              return;
            }

            createUserSkillRecord({
              userId: completion.userId,
              skillId: skillGrant.skillId,
              status: "active",
              achievedDate: completion.completedAt!,
              evidenceType: "training",
              evidenceId: training.id,
            });
            created++;
          } catch {
            skipped++;
          }
        });
      } else {
        skipped++;
      }
    } catch (error) {
      errors.push(`Failed to process completion ${completion.id}: ${error}`);
    }
  });

  console.log(
    `Step 3 — User Records: ${created} created, ${skipped} skipped, ${errors.length} errors`
  );
  return { success: errors.length === 0, created, skipped, errors };
}

/**
 * FULL MIGRATION: Run all migration steps in sequence
 */
export function runFullSkillsMigration(): {
  success: boolean;
  steps: {
    skills: ReturnType<typeof migrateOldSkillsToV2>;
    courses: ReturnType<typeof migrateCourseSkillsToV2>;
    userRecords: ReturnType<typeof migrateCompletionsToUserSkillRecords>;
  };
} {
  console.log("Starting Skills V2 Migration...");

  const step1 = migrateOldSkillsToV2();
  const step2 = migrateCourseSkillsToV2();
  const step3 = migrateCompletionsToUserSkillRecords();

  const success = step1.success && step2.success && step3.success;

  console.log(`Migration ${success ? "completed successfully" : "completed with errors"}.`);

  return {
    success,
    steps: {
      skills: step1,
      courses: step2,
      userRecords: step3,
    },
  };
}
