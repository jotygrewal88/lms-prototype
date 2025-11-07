// Polish Pack: Change logging utility
import { createChangeLog, getCurrentUser } from "@/lib/store";
import { today } from "@/lib/utils";
import { ChangeLog } from "@/types";

/**
 * Helper function to log a change to various entities
 * @param entityId The ID of the entity
 * @param summary Human-readable summary of what changed
 * @param metadata Optional metadata about the change
 * @param entity Optional entity type (defaults to "TrainingCompletion" for backward compatibility)
 */
export function logChange(
  entityId: string,
  summary: string,
  metadata?: {
    action?: "status_change" | "due_date_change" | "completion_logged" | "exempt" | "proof_added" | "bulk_op" | "user_create" | "user_update" | "user_deactivate" | "user_reactivate" | "quiz_submitted" | "quiz_passed" | "quiz_failed" | "ai_quiz_generate";
    reason?: string;
    oldValue?: string;
    newValue?: string;
    scorePct?: number;
    passed?: boolean;
    attemptId?: string;
    [key: string]: any; // Allow additional fields
  },
  entity: ChangeLog["entity"] = "TrainingCompletion"
): void {
  const currentUser = getCurrentUser();
  
  createChangeLog({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    entity,
    entityId,
    byUserId: currentUser.id,
    at: new Date().toISOString(),
    summary,
    metadata: metadata as any, // Cast to avoid optional action type mismatch
  });
}

