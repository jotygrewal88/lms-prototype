// Phase I Epic 3: Reminder & Escalation automation logic
/**
 * ACCEPTANCE CHECKLIST (Epic 3):
 * ✓ Upcoming rule: triggers when (dueAt - today ≤ offsetDays AND status != COMPLETED)
 * ✓ Overdue rule: triggers when (today - dueAt ≥ offsetDays AND status != COMPLETED)
 * ✓ Escalation logic: when overdueDays ≥ escalationAfterDays, find manager and create EscalationLog
 * ✓ In-memory notifications generated with clear messages
 */

import { ReminderRule, TrainingCompletion, Notification, EscalationLog, User, Training, getFullName } from "@/types";
import { today, calculateOverdueDays } from "@/lib/utils";
import { 
  getUsers, 
  getTrainings, 
  getTrainingById,
  createNotification, 
  createEscalationLog 
} from "@/lib/store";

interface ReminderResult {
  notifications: Notification[];
  escalations: EscalationLog[];
}

/**
 * Evaluate all active reminder rules and generate notifications/escalations
 */
export function runReminderEvaluation(
  rules: ReminderRule[],
  completions: TrainingCompletion[]
): ReminderResult {
  const result: ReminderResult = {
    notifications: [],
    escalations: [],
  };

  const activeRules = rules.filter(r => r.active);
  const users = getUsers();
  const trainings = getTrainings();

  for (const rule of activeRules) {
    for (const completion of completions) {
      // Skip completed trainings
      if (completion.status === "COMPLETED") {
        continue;
      }

      const shouldTrigger = evaluateRule(rule, completion);
      
      if (shouldTrigger) {
        const user = users.find(u => u.id === completion.userId);
        const training = trainings.find(t => t.id === completion.trainingId);
        
        if (!user || !training) continue;

        // Create notification
        const notification: Notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: rule.escalationAfterDays !== undefined ? "escalation" : "reminder",
          recipientId: user.id,
          message: generateMessage(rule, training, user, completion),
          createdAt: today(),
        };

        result.notifications.push(notification);
        createNotification(notification);

        // Create escalation if needed
        if (rule.escalationAfterDays !== undefined && completion.overdueDays !== undefined) {
          if (completion.overdueDays >= rule.escalationAfterDays) {
            const manager = findManagerForUser(user, users);
            if (manager) {
              const escalation: EscalationLog = {
                id: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                trainingCompletionId: completion.id,
                triggeredAt: today(),
                escalatedToUserId: manager.id,
                resolved: false,
              };

              result.escalations.push(escalation);
              createEscalationLog(escalation);

              // Also send notification to manager
              const managerNotification: Notification = {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: "escalation",
                recipientId: manager.id,
                message: `ESCALATION: ${user.name} is ${completion.overdueDays} days overdue for "${training.title}". Please follow up.`,
                createdAt: today(),
              };

              result.notifications.push(managerNotification);
              createNotification(managerNotification);
            }
          }
        }
      }
    }
  }

  return result;
}

/**
 * Evaluate if a rule should trigger for a given completion
 */
function evaluateRule(rule: ReminderRule, completion: TrainingCompletion): boolean {
  const todayDate = new Date(today());
  const dueDate = new Date(completion.dueAt);
  const daysDiff = Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (rule.trigger === "upcoming") {
    // Upcoming: when (dueAt - today) <= Math.abs(offsetDays) AND status != COMPLETED
    // offsetDays is negative for "before due", so we check if we're within the window
    const daysUntilDue = -daysDiff; // Positive if in future
    return daysUntilDue <= Math.abs(rule.offsetDays) && daysUntilDue >= 0;
  } else if (rule.trigger === "overdue") {
    // Overdue: when (today - dueAt) >= offsetDays AND status != COMPLETED
    return daysDiff >= rule.offsetDays;
  }

  return false;
}

/**
 * Generate a human-readable reminder message
 */
function generateMessage(
  rule: ReminderRule,
  training: Training,
  user: User,
  completion: TrainingCompletion
): string {
  const todayDate = new Date(today());
  const dueDate = new Date(completion.dueAt);
  const daysDiff = Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (rule.trigger === "upcoming") {
    const daysUntilDue = -daysDiff;
    return `Reminder: "${training.title}" training is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} for ${getFullName(user)}.`;
  } else if (rule.trigger === "overdue") {
    const daysOverdue = completion.overdueDays || daysDiff;
    return `Alert: "${training.title}" training is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue for ${getFullName(user)}.`;
  }

  return `Reminder: "${training.title}" training requires attention for ${getFullName(user)}.`;
}

/**
 * Find the manager for a given user (based on site)
 */
function findManagerForUser(user: User, allUsers: User[]): User | undefined {
  // Find a manager in the same site
  return allUsers.find(u => 
    u.role === "MANAGER" && 
    u.siteId === user.siteId
  );
}

/**
 * Generate a preview message for a rule (for testing in UI)
 */
export function generatePreviewMessage(rule: ReminderRule): string {
  if (rule.trigger === "upcoming") {
    const days = Math.abs(rule.offsetDays);
    return `This rule will send reminders ${days} day${days !== 1 ? 's' : ''} before training due dates.`;
  } else if (rule.trigger === "overdue") {
    if (rule.escalationAfterDays !== undefined) {
      return `This rule will escalate to managers when trainings are ${rule.offsetDays} day${rule.offsetDays !== 1 ? 's' : ''} overdue (${rule.escalationAfterDays} days overdue threshold).`;
    } else {
      return `This rule will send reminders when trainings are ${rule.offsetDays} day${rule.offsetDays !== 1 ? 's' : ''} overdue.`;
    }
  }

  return "Rule preview not available.";
}

