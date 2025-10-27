// Polish Pack: Change logging utility
import { createChangeLog, getCurrentUser } from "@/lib/store";
import { today } from "@/lib/utils";

/**
 * Helper function to log a change to a TrainingCompletion
 * @param entityId The ID of the training completion
 * @param summary Human-readable summary of what changed
 * @param metadata Optional metadata about the change
 */
export function logChange(
  entityId: string,
  summary: string,
  metadata?: {
    action?: "status_change" | "due_date_change" | "completion_logged" | "exempt" | "proof_added" | "bulk_op" | "user_create" | "user_update" | "user_deactivate" | "user_reactivate";
    reason?: string;
    oldValue?: string;
    newValue?: string;
  }
): void {
  const currentUser = getCurrentUser();
  
  createChangeLog({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    entity: "TrainingCompletion",
    entityId,
    byUserId: currentUser.id,
    at: new Date().toISOString(),
    summary,
    metadata: metadata as any, // Cast to avoid optional action type mismatch
  });
}

