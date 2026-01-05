// Phase I AI Uplift: AI Notification Suggestions Engine
import { Scope, CompletionStatus, getFullName, Audience } from "@/types";
import { 
  getScopedData, 
  calculateDistribution,
  onTimePctLast30d,
  topOverdueTraining,
} from "./stats";
import { formatDate } from "./utils";
import { getSiteById, getDepartmentById, getUser, getUsers } from "./store";

export type ToneVariant = "friendly" | "direct" | "escalation" | "praise";
export type { Audience };

export interface SuggestContext {
  departmentName?: string;
  siteName?: string;
  managerName?: string;
  topTrainingTitle?: string;
  countOverdue: number;
  dueSoonCount: number;
  nearestDueDate?: string;
  onTimePct?: number;
  totalAssignments: number;
  completedCount: number;
}

export interface NotificationSuggestion {
  tone: ToneVariant;
  subject: string;
  body: string;
  cadence: string[];
}

/**
 * Build suggestion context from current scope and filters
 */
export function buildSuggestContext(
  scope: Scope,
  filters?: {
    site?: string;
    department?: string;
    training?: string;
    status?: CompletionStatus | "";
    managerId?: string;
  }
): SuggestContext {
  const scoped = getScopedData(scope);
  const { completions, trainings, users, sites, departments } = scoped;

  // Apply additional filters if provided
  let filteredCompletions = completions;
  if (filters?.status) {
    filteredCompletions = filteredCompletions.filter((c) => c.status === filters.status);
  }
  if (filters?.training) {
    filteredCompletions = filteredCompletions.filter((c) => c.trainingId === filters.training);
  }

  // Calculate stats
  const distribution = calculateDistribution(filteredCompletions);
  const onTimeStats = onTimePctLast30d(filteredCompletions);
  const topOverdue = topOverdueTraining(filteredCompletions, trainings);

  // Find nearest due date
  const assignedAndDueSoon = filteredCompletions
    .filter((c) => c.status === "ASSIGNED" || c.status === "OVERDUE")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const nearestDueDate = assignedAndDueSoon.length > 0 
    ? formatDate(assignedAndDueSoon[0].dueAt) 
    : undefined;

  // Resolve names
  let departmentName: string | undefined;
  let siteName: string | undefined;
  let managerName: string | undefined;

  if (scope.deptId && scope.deptId !== "ALL") {
    const dept = getDepartmentById(scope.deptId);
    departmentName = dept?.name;
  } else if (filters?.department) {
    const dept = getDepartmentById(filters.department);
    departmentName = dept?.name;
  }

  if (scope.siteId && scope.siteId !== "ALL") {
    const site = getSiteById(scope.siteId);
    siteName = site?.name;
  } else if (filters?.site) {
    const site = getSiteById(filters.site);
    siteName = site?.name;
  }

  if (filters?.managerId) {
    const manager = getUser(filters.managerId);
    if (manager) {
      managerName = `${manager.firstName} ${manager.lastName}`;
    }
  }

  return {
    departmentName,
    siteName,
    managerName,
    topTrainingTitle: topOverdue?.title,
    countOverdue: distribution.overdue,
    dueSoonCount: distribution.dueSoon,
    nearestDueDate,
    onTimePct: onTimeStats.pct,
    totalAssignments: filteredCompletions.length,
    completedCount: distribution.completed,
  };
}

/**
 * Generate notification suggestions for all tone variants
 */
export function getSuggestions(context: SuggestContext): NotificationSuggestion[] {
  const suggestions: NotificationSuggestion[] = [];

  // Determine primary context label
  const scopeLabel = context.departmentName 
    ? `in ${context.departmentName}` 
    : context.siteName 
    ? `at ${context.siteName}` 
    : "in your scope";

  // ESCALATION tone (default if countOverdue ≥ 5)
  if (context.countOverdue >= 5) {
    const topTrainingNote = context.topTrainingTitle 
      ? ` "${context.topTrainingTitle}" is the most affected training.` 
      : "";

    suggestions.push({
      tone: "escalation",
      subject: `Escalation: ${context.countOverdue} overdue trainings ${scopeLabel}`,
      body: `This is an urgent notification regarding overdue training compliance.\n\nThere are currently ${context.countOverdue} overdue training assignments ${scopeLabel}.${topTrainingNote} Immediate action is required to bring these items into compliance.\n\nPlease review the overdue items and work with your team to complete these trainings as soon as possible. Continued non-compliance may result in regulatory issues or safety risks.\n\nIf there are extenuating circumstances, please document exemptions or due date adjustments in the system.`,
      cadence: ["Send now", "Resend in 3 days if no progress", "Escalate to senior management in 7 days"],
    });
  } else if (context.countOverdue > 0) {
    suggestions.push({
      tone: "escalation",
      subject: `Action Required: ${context.countOverdue} overdue training${context.countOverdue > 1 ? 's' : ''} ${scopeLabel}`,
      body: `This is a reminder that there ${context.countOverdue === 1 ? 'is' : 'are'} ${context.countOverdue} overdue training assignment${context.countOverdue > 1 ? 's' : ''} ${scopeLabel}.\n\nPlease prioritize completing these trainings to maintain compliance. If you need assistance or have questions about any of these trainings, please reach out to your manager or the training coordinator.\n\nThank you for your prompt attention to this matter.`,
      cadence: ["Send now", "Follow up in 5 days", "Escalate if no response in 10 days"],
    });
  } else {
    suggestions.push({
      tone: "escalation",
      subject: `Compliance Update: Training status ${scopeLabel}`,
      body: `This is a proactive compliance notification.\n\nThere are ${context.dueSoonCount} training assignments due within the next 7 days ${scopeLabel}. While none are currently overdue, timely completion will help maintain our excellent compliance record.\n\nPlease review upcoming deadlines and prioritize accordingly.`,
      cadence: ["Send 3 days before due date", "Reminder 1 day before", "Follow up on due date"],
    });
  }

  // DIRECT tone (concrete call to action)
  if (context.dueSoonCount >= 4 || (context.onTimePct !== undefined && context.onTimePct < 60)) {
    const urgencyNote = context.nearestDueDate 
      ? ` The nearest deadline is ${context.nearestDueDate}.` 
      : "";

    suggestions.push({
      tone: "direct",
      subject: `Action Needed: ${context.dueSoonCount} trainings due soon ${scopeLabel}`,
      body: `You have ${context.dueSoonCount} training assignments due within the next 7 days ${scopeLabel}.${urgencyNote}\n\nPlease take the following actions:\n\n1. Review your assigned trainings in the LMS dashboard\n2. Complete any trainings that can be finished today\n3. Schedule time for longer courses before the due date\n4. Contact your manager if you need a due date extension\n\nCompleting trainings on time ensures compliance and helps you stay current on critical safety and operational procedures.`,
      cadence: ["Send 7 days before due", "Reminder 3 days before", "Final reminder 1 day before"],
    });
  } else {
    const completionRate = context.totalAssignments > 0 
      ? Math.round((context.completedCount / context.totalAssignments) * 100) 
      : 0;

    suggestions.push({
      tone: "direct",
      subject: `Training Status Update ${scopeLabel}`,
      body: `Current training completion status ${scopeLabel}:\n\n- Completed: ${context.completedCount} of ${context.totalAssignments} (${completionRate}%)\n- Due soon (next 7 days): ${context.dueSoonCount}\n- Overdue: ${context.countOverdue}\n\nAction items:\n- Complete any trainings due within the next week\n- Review your training dashboard for upcoming deadlines\n- Reach out if you need support or have questions\n\nThank you for maintaining compliance.`,
      cadence: ["Send weekly", "Increase to twice weekly if overdue items appear"],
    });
  }

  // FRIENDLY tone (light nudge)
  const friendlyGreeting = context.managerName 
    ? `Hi from ${context.managerName},` 
    : "Hello,";

  if (context.countOverdue > 0 || context.dueSoonCount > 0) {
    suggestions.push({
      tone: "friendly",
      subject: `Quick reminder: Training deadlines ${scopeLabel}`,
      body: `${friendlyGreeting}\n\nJust a friendly heads-up about upcoming training deadlines ${scopeLabel}!\n\n${context.countOverdue > 0 ? `We have ${context.countOverdue} training${context.countOverdue > 1 ? 's' : ''} that went past the due date. ` : ''}${context.dueSoonCount > 0 ? `Additionally, ${context.dueSoonCount} training${context.dueSoonCount > 1 ? 's are' : ' is'} coming up in the next week. ` : ''}\n\nI know everyone's busy, but staying on top of these trainings helps us maintain our safety standards and regulatory compliance. Plus, you might learn something useful!\n\nIf you're running into any issues or need help, just let me know.\n\nThanks for your cooperation!`,
      cadence: ["Send 5 days before due", "Gentle reminder 2 days before"],
    });
  } else {
    suggestions.push({
      tone: "friendly",
      subject: `All clear on training compliance ${scopeLabel}!`,
      body: `${friendlyGreeting}\n\nGreat news! Training compliance ${scopeLabel} is looking solid. No overdue items and deadlines are manageable.\n\nKeep up the excellent work, and don't hesitate to reach out if you need anything.\n\nThanks for staying on top of your training!`,
      cadence: ["Send monthly as positive reinforcement"],
    });
  }

  // PRAISE tone (celebrate success)
  const completionRate = context.totalAssignments > 0 
    ? Math.round((context.completedCount / context.totalAssignments) * 100) 
    : 0;

  if (context.onTimePct !== undefined && context.onTimePct >= 90 && completionRate >= 80) {
    suggestions.push({
      tone: "praise",
      subject: `Outstanding Training Compliance ${scopeLabel}!`,
      body: `Congratulations!\n\nI wanted to take a moment to recognize the exceptional training compliance ${scopeLabel}. With a ${context.onTimePct}% on-time completion rate and ${completionRate}% overall completion, you're setting a great example.\n\nYour commitment to continuous learning and safety compliance doesn't go unnoticed. This level of diligence helps ensure:\n\n- Regulatory compliance and audit readiness\n- A safer work environment for everyone\n- Up-to-date knowledge of best practices\n\nKeep up the outstanding work! Your dedication makes a real difference.\n\nThank you for your professionalism and commitment to excellence.`,
      cadence: ["Send monthly to high performers", "Share in team meetings"],
    });
  } else if (completionRate >= 70) {
    suggestions.push({
      tone: "praise",
      subject: `Great Progress on Training ${scopeLabel}`,
      body: `Nice work!\n\nI wanted to acknowledge the solid progress on training completion ${scopeLabel}. You've completed ${context.completedCount} out of ${context.totalAssignments} assignments (${completionRate}%).\n\n${context.dueSoonCount > 0 ? `With ${context.dueSoonCount} training${context.dueSoonCount > 1 ? 's' : ''} coming up soon, you're in a good position to maintain this momentum.` : 'Your proactive approach to training helps maintain our compliance standards.'}\n\nKeep it going, and thank you for your continued commitment to safety and professional development!`,
      cadence: ["Send bi-weekly to teams showing improvement"],
    });
  } else {
    suggestions.push({
      tone: "praise",
      subject: `Every Step Counts: Training Progress ${scopeLabel}`,
      body: `Hello,\n\nI wanted to recognize the effort being put into training completion ${scopeLabel}. You've completed ${context.completedCount} trainings so far, and that's worth acknowledging.\n\n${context.countOverdue > 0 || context.dueSoonCount > 0 ? `I know there are still some items to wrap up, but every training you complete makes a difference. Let's keep moving forward together.` : 'Your participation in training helps strengthen our entire team.'}\n\nIf there's anything we can do to support your training completion, please don't hesitate to ask.\n\nThank you for your continued effort!`,
      cadence: ["Send monthly as encouragement"],
    });
  }

  return suggestions;
}

/**
 * Resolve recipients based on mode and scope
 */
export function resolveRecipients(
  mode: "managers" | "learners" | "specific",
  scope: Scope,
  specificUserIds?: string[]
): Array<{ userId: string; name: string; email: string }> {
  if (mode === "specific" && specificUserIds && specificUserIds.length > 0) {
    // Return specific users
    return specificUserIds
      .map(id => getUser(id))
      .filter(user => user !== undefined)
      .slice(0, 50)
      .map(user => ({
        userId: user!.id,
        name: getFullName(user!),
        email: user!.email,
      }));
  }

  // Get scoped users
  const scoped = getScopedData(scope);
  let filteredUsers = scoped.users;

  if (mode === "managers") {
    filteredUsers = filteredUsers.filter(u => u.role === "MANAGER");
  } else if (mode === "learners") {
    filteredUsers = filteredUsers.filter(u => u.role === "LEARNER");
  }

  // Limit to 50 recipients
  return filteredUsers.slice(0, 50).map(user => ({
    userId: user.id,
    name: getFullName(user),
    email: user.email,
  }));
}

/**
 * Manager-focused context with team metrics
 */
export interface ManagerSuggestContext {
  departmentName?: string;
  siteName?: string;
  countOverdue: number;
  dueSoonCount: number;
  completionRate: number;
  onTimePct: number;
  topTrainingTitle?: string;
  nearestDueDate?: string;
  totalAssignments: number;
  completedCount: number;
}

/**
 * Learner-focused context with personal/aggregated metrics
 */
export interface LearnerSuggestContext {
  assignedCount: number;
  completedCount: number;
  overdueCount: number;
  dueSoonCount: number;
  nearestDueDate?: string;
  topTrainingTitle?: string;
}

/**
 * Build manager-focused context from scope
 */
export function buildManagerContext(scope: Scope, filters?: any): ManagerSuggestContext {
  const scoped = getScopedData(scope);
  const { completions, trainings } = scoped;

  // Apply filters if provided
  let filteredCompletions = completions;
  if (filters) {
    if (filters.status && filters.status !== "") {
      filteredCompletions = filteredCompletions.filter(c => c.status === filters.status);
    }
    if (filters.training && filters.training !== "ALL") {
      filteredCompletions = filteredCompletions.filter(c => c.trainingId === filters.training);
    }
  }

  const distribution = calculateDistribution(filteredCompletions);
  const onTimeStats = onTimePctLast30d(filteredCompletions);
  const topOverdue = topOverdueTraining(filteredCompletions, trainings);

  // Find nearest due date (overdue or assigned items)
  const pendingCompletions = filteredCompletions.filter(c => c.status === "ASSIGNED" || c.status === "OVERDUE");
  const nearestDue = pendingCompletions.length > 0 
    ? pendingCompletions.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0]
    : undefined;

  // Resolve names
  let departmentName: string | undefined;
  let siteName: string | undefined;

  if (scope.deptId && scope.deptId !== "ALL") {
    const dept = getDepartmentById(scope.deptId);
    departmentName = dept?.name;
  } else if (filters?.department) {
    const dept = getDepartmentById(filters.department);
    departmentName = dept?.name;
  }

  if (scope.siteId && scope.siteId !== "ALL") {
    const site = getSiteById(scope.siteId);
    siteName = site?.name;
  } else if (filters?.site) {
    const site = getSiteById(filters.site);
    siteName = site?.name;
  }

  const completionRate = filteredCompletions.length > 0 
    ? Math.round((distribution.completed / filteredCompletions.length) * 100)
    : 0;

  return {
    departmentName,
    siteName,
    countOverdue: distribution.overdue,
    dueSoonCount: distribution.dueSoon,
    completionRate,
    onTimePct: onTimeStats.pct,
    topTrainingTitle: topOverdue?.title,
    nearestDueDate: nearestDue ? formatDate(nearestDue.dueAt) : undefined,
    totalAssignments: filteredCompletions.length,
    completedCount: distribution.completed,
  };
}

/**
 * Build learner-focused context (aggregated for all learners in scope)
 */
export function buildLearnerContext(scope: Scope, userIds: string[]): LearnerSuggestContext {
  const scoped = getScopedData(scope);
  const { completions, trainings } = scoped;

  // Filter to specific users if provided
  let filteredCompletions = userIds.length > 0
    ? completions.filter(c => userIds.includes(c.userId))
    : completions.filter(c => {
        const user = getUser(c.userId);
        return user?.role === "LEARNER";
      });

  const distribution = calculateDistribution(filteredCompletions);
  const topOverdue = topOverdueTraining(filteredCompletions, trainings);

  // Find nearest due date (assigned or overdue items)
  const pendingItems = filteredCompletions.filter(c => c.status === "ASSIGNED" || c.status === "OVERDUE");
  const nearestDue = pendingItems.length > 0 
    ? pendingItems.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0]
    : undefined;

  return {
    assignedCount: distribution.assigned + distribution.dueSoon + distribution.overdue,
    completedCount: distribution.completed,
    overdueCount: distribution.overdue,
    dueSoonCount: distribution.dueSoon,
    nearestDueDate: nearestDue ? formatDate(nearestDue.dueAt) : undefined,
    topTrainingTitle: topOverdue?.title,
  };
}

/**
 * Generate manager-focused suggestions
 */
export function getManagerSuggestions(ctx: ManagerSuggestContext, tone: ToneVariant): NotificationSuggestion {
  const scopeLabel = ctx.departmentName 
    ? `in ${ctx.departmentName}` 
    : ctx.siteName 
    ? `at ${ctx.siteName}` 
    : "in your team";

  const subject: Record<ToneVariant, string> = {
    escalation: `URGENT: ${ctx.countOverdue} Overdue Trainings ${scopeLabel}`,
    direct: `Action Required: Training Compliance Update ${scopeLabel}`,
    friendly: `Team Training Update ${scopeLabel}`,
    praise: `Great Work! Team Compliance Update ${scopeLabel}`,
  };

  const body: Record<ToneVariant, string> = {
    escalation: `URGENT COMPLIANCE ALERT

Your team ${scopeLabel} currently has:
- ${ctx.countOverdue} OVERDUE training assignments
- ${ctx.dueSoonCount} due within 7 days
- Team completion rate: ${ctx.completionRate}%
- On-time completion: ${ctx.onTimePct}%

${ctx.topTrainingTitle ? `Most overdue: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Nearest deadline: ${ctx.nearestDueDate}` : ""}

IMMEDIATE ACTION REQUIRED:
1. Review your team's overdue assignments
2. Contact direct reports who are falling behind
3. Escalate persistent non-compliance to HR

This is a formal compliance notice. Failure to address may result in further escalation.`,

    direct: `Team Compliance Status ${scopeLabel}

Current metrics:
- Overdue: ${ctx.countOverdue}
- Due soon: ${ctx.dueSoonCount}
- Completion rate: ${ctx.completionRate}%
- On-time performance: ${ctx.onTimePct}%

${ctx.topTrainingTitle ? `Priority training: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Next deadline: ${ctx.nearestDueDate}` : ""}

Action items:
1. Review your team's pending assignments
2. Send reminders to those with overdue trainings
3. Schedule time for completion before next deadline

Please update compliance status by end of week.`,

    friendly: `Hi Team Leads,

Just a friendly heads-up about training status ${scopeLabel}:

${ctx.countOverdue > 0 ? `- ${ctx.countOverdue} trainings are overdue (let's get those wrapped up!)` : ""}
${ctx.dueSoonCount > 0 ? `- ${ctx.dueSoonCount} coming due soon` : ""}
- Overall completion: ${ctx.completionRate}%
${ctx.onTimePct < 50 ? `- Let's work on getting trainings done before deadlines` : ""}

${ctx.topTrainingTitle ? `Top priority: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Coming up: ${ctx.nearestDueDate}` : ""}

A quick check-in with your team can help keep everyone on track. Thanks for supporting training compliance!`,

    praise: `Excellent Work ${scopeLabel}!

Your team's training performance:
- Completion rate: ${ctx.completionRate}%
- On-time completion: ${ctx.onTimePct}%
${ctx.completedCount > 0 ? `- ${ctx.completedCount} trainings completed` : ""}

${ctx.countOverdue > 0 || ctx.dueSoonCount > 0 
  ? `Just a few items to wrap up:
${ctx.countOverdue > 0 ? `- ${ctx.countOverdue} overdue (almost there!)` : ""}
${ctx.dueSoonCount > 0 ? `- ${ctx.dueSoonCount} due soon` : ""}`
  : "Keep up the great work maintaining 100% compliance!"}

${ctx.nearestDueDate ? `Next deadline: ${ctx.nearestDueDate}` : ""}

Thank you for prioritizing training and keeping your team compliant!`,
  };

  return {
    tone,
    subject: subject[tone],
    body: body[tone],
    cadence: [
      "Send weekly until all overdue items resolved",
      "Escalate to senior management after 2 weeks of non-compliance",
      "Schedule follow-up 3 days before next major deadline",
    ],
  };
}

/**
 * Generate learner-focused suggestions
 */
export function getLearnerSuggestions(ctx: LearnerSuggestContext, tone: ToneVariant): NotificationSuggestion {
  const subject: Record<ToneVariant, string> = {
    escalation: `URGENT: ${ctx.overdueCount} Overdue Training Assignments`,
    direct: `Action Required: Complete Your Training Assignments`,
    friendly: `Reminder: You Have Training Assignments to Complete`,
    praise: `Great Progress on Your Training!`,
  };

  const body: Record<ToneVariant, string> = {
    escalation: `URGENT: OVERDUE TRAINING ASSIGNMENTS

You currently have:
- ${ctx.overdueCount} OVERDUE assignments
- ${ctx.dueSoonCount} due within 7 days

${ctx.topTrainingTitle ? `Most urgent: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Nearest deadline: ${ctx.nearestDueDate}` : ""}

IMMEDIATE ACTION REQUIRED:
Please complete your overdue trainings immediately to maintain compliance. Continued non-compliance may result in escalation to your manager and HR.

Log in now to complete your assignments.`,

    direct: `Training Assignments Status

You have:
- ${ctx.assignedCount - ctx.completedCount} pending assignments
${ctx.overdueCount > 0 ? `- ${ctx.overdueCount} overdue` : ""}
${ctx.dueSoonCount > 0 ? `- ${ctx.dueSoonCount} due soon` : ""}
- ${ctx.completedCount} completed

${ctx.topTrainingTitle ? `Priority: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Next deadline: ${ctx.nearestDueDate}` : ""}

Please log in and complete your pending trainings. If you need an extension, contact your manager.`,

    friendly: `Hi there!

Just a friendly reminder about your training assignments:

${ctx.overdueCount > 0 ? `- ${ctx.overdueCount} overdue (let's get these done!)` : ""}
${ctx.dueSoonCount > 0 ? `- ${ctx.dueSoonCount} coming up soon` : ""}
${ctx.completedCount > 0 ? `- ${ctx.completedCount} already completed (nice work!)` : ""}

${ctx.topTrainingTitle ? `Up next: ${ctx.topTrainingTitle}` : ""}
${ctx.nearestDueDate ? `Due by: ${ctx.nearestDueDate}` : ""}

Set aside a little time this week to knock these out. You've got this!`,

    praise: `Great Job on Your Training Progress!

You've completed ${ctx.completedCount} training${ctx.completedCount !== 1 ? "s" : ""}! 

${ctx.assignedCount - ctx.completedCount > 0 
  ? `Just a few more to go:
${ctx.overdueCount > 0 ? `- ${ctx.overdueCount} overdue` : ""}
${ctx.dueSoonCount > 0 ? `- ${ctx.dueSoonCount} due soon` : ""}

${ctx.nearestDueDate ? `Next deadline: ${ctx.nearestDueDate}` : ""}`
  : "You're all caught up! Keep up the excellent work."}

Thanks for staying on top of your training!`,
  };

  return {
    tone,
    subject: subject[tone],
    body: body[tone],
    cadence: [
      "Send 7 days before due date",
      "Send 1 day before due date",
      "Send immediately when overdue, then weekly",
    ],
  };
}

/**
 * Unified suggestion generator that routes to appropriate audience handler
 */
export function generateSuggestion(
  audience: Audience,
  scope: Scope,
  userIds: string[],
  tone: ToneVariant,
  filters?: any
): NotificationSuggestion {
  // Determine if audience is managers or learners
  if (audience === "MANAGERS") {
    const ctx = buildManagerContext(scope, filters);
    return getManagerSuggestions(ctx, tone);
  } else if (audience === "LEARNERS") {
    const ctx = buildLearnerContext(scope, userIds);
    return getLearnerSuggestions(ctx, tone);
  } else {
    // SPECIFIC: determine based on user roles
    const allManagers = userIds.every(id => {
      const user = getUser(id);
      return user?.role === "MANAGER";
    });
    
    if (allManagers) {
      const ctx = buildManagerContext(scope, filters);
      return getManagerSuggestions(ctx, tone);
    } else {
      const ctx = buildLearnerContext(scope, userIds);
      return getLearnerSuggestions(ctx, tone);
    }
  }
}

/**
 * Build context for manager escalation from Smart Coach insight
 */
export function buildManagerEscalationContext(insight: {
  deptName?: string;
  siteName?: string;
  managerName: string;
  overdueCount: number;
  dueSoonRate: number;
  teamSize: number;
  topProblemTraining?: { title: string; overdueCount: number };
  onTimePctSeries: number[];
}): ManagerSuggestContext {
  const dueSoonCount = Math.round(insight.dueSoonRate * insight.teamSize);
  const onTimePct = insight.onTimePctSeries[insight.onTimePctSeries.length - 1] || 0;
  
  return {
    departmentName: insight.deptName,
    siteName: insight.siteName,
    countOverdue: insight.overdueCount,
    dueSoonCount,
    completionRate: 0, // Not critical for escalation
    onTimePct,
    topTrainingTitle: insight.topProblemTraining?.title,
    nearestDueDate: undefined,
    totalAssignments: insight.teamSize,
    completedCount: 0,
  };
}

/**
 * Generate default escalation notification for a manager
 */
export function defaultEscalationForManager(ctx: ManagerSuggestContext): {
  subject: string;
  body: string;
  cadence: string[];
} {
  const subject = `Escalation: Overdue training in ${ctx.departmentName || 'your department'}`;
  
  const body = `Dear Manager,

Your team currently has ${ctx.countOverdue} overdue training assignments that require immediate attention.

Team Metrics:
- Overdue assignments: ${ctx.countOverdue}
- Due soon: ${ctx.dueSoonCount}
- Recent on-time rate: ${ctx.onTimePct}%
${ctx.topTrainingTitle ? `- Most overdue training: ${ctx.topTrainingTitle}` : ''}

This situation requires immediate action to bring your team back into compliance. Please:

1. Review all overdue assignments in the compliance dashboard
2. Contact team members who are behind schedule
3. Ensure all overdue items are completed this week
4. Report any blockers to HR immediately

Failure to address this situation may result in escalation to senior leadership.

Thank you for your immediate attention to this matter.`;

  return {
    subject,
    body,
    cadence: [
      "Send immediately",
      "Follow up in 2 days if no improvement",
      "Escalate to senior management after 1 week",
    ],
  };
}

// ============================================================================
// TEMPLATE VARIABLE SYSTEM FOR PERSONALIZED NOTIFICATIONS
// ============================================================================

/**
 * Available template variables for personalized notifications
 */
export const TEMPLATE_VARIABLES = [
  { key: "firstName", label: "First Name", example: "Marcus" },
  { key: "fullName", label: "Full Name", example: "Marcus Johnson" },
  { key: "overdueCount", label: "Overdue Count", example: "3" },
  { key: "dueSoonCount", label: "Due Soon Count", example: "2" },
  { key: "completedCount", label: "Completed Count", example: "5" },
  { key: "assignedCount", label: "Assigned Count", example: "10" },
  { key: "nearestDueDate", label: "Next Due Date", example: "Jan 15, 2026" },
  { key: "topOverdueTraining", label: "Top Overdue Training", example: "Forklift Safety" },
] as const;

export type TemplateVariableKey = typeof TEMPLATE_VARIABLES[number]["key"];

/**
 * Context for a single recipient with their personal training stats
 */
export interface RecipientContext {
  userId: string;
  firstName: string;
  fullName: string;
  email: string;
  role: string;
  overdueCount: number;
  dueSoonCount: number;
  completedCount: number;
  assignedCount: number;
  nearestDueDate: string;
  topOverdueTraining: string;
}

/**
 * Build context for a single recipient by calculating their personal stats
 */
export function buildRecipientContext(userId: string): RecipientContext | null {
  const user = getUser(userId);
  if (!user) return null;

  // Get all completions for this user
  const { getCompletionsByUserId, getTrainings } = require("./store");
  const completions = getCompletionsByUserId(userId);
  const trainings = getTrainings();

  // Calculate personal stats
  let overdueCount = 0;
  let dueSoonCount = 0;
  let completedCount = 0;
  let assignedCount = 0;
  let nearestDueDate: string | undefined;
  let topOverdueTraining: string | undefined;

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pendingItems: Array<{ dueAt: string; trainingId: string }> = [];

  for (const c of completions) {
    if (c.status === "COMPLETED") {
      completedCount++;
    } else if (c.status === "EXEMPT") {
      // Don't count exempt
    } else if (c.status === "OVERDUE") {
      overdueCount++;
      assignedCount++;
      pendingItems.push({ dueAt: c.dueAt, trainingId: c.trainingId });
      // Track top overdue training
      if (!topOverdueTraining) {
        const training = trainings.find((t: { id: string }) => t.id === c.trainingId);
        if (training) topOverdueTraining = training.title;
      }
    } else if (c.status === "ASSIGNED") {
      assignedCount++;
      const dueDate = new Date(c.dueAt);
      if (dueDate <= sevenDaysFromNow) {
        dueSoonCount++;
      }
      pendingItems.push({ dueAt: c.dueAt, trainingId: c.trainingId });
    }
  }

  // Find nearest due date
  if (pendingItems.length > 0) {
    pendingItems.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    nearestDueDate = formatDate(pendingItems[0].dueAt);
  }

  return {
    userId: user.id,
    firstName: user.firstName,
    fullName: getFullName(user),
    email: user.email,
    role: user.role,
    overdueCount,
    dueSoonCount,
    completedCount,
    assignedCount,
    nearestDueDate: nearestDueDate || "No pending trainings",
    topOverdueTraining: topOverdueTraining || "None",
  };
}

/**
 * Resolve all {{variable}} placeholders in a template string
 */
export function resolveTemplate(template: string, ctx: RecipientContext): string {
  let result = template;
  
  // Replace each variable
  result = result.replace(/\{\{firstName\}\}/g, ctx.firstName);
  result = result.replace(/\{\{fullName\}\}/g, ctx.fullName);
  result = result.replace(/\{\{overdueCount\}\}/g, String(ctx.overdueCount));
  result = result.replace(/\{\{dueSoonCount\}\}/g, String(ctx.dueSoonCount));
  result = result.replace(/\{\{completedCount\}\}/g, String(ctx.completedCount));
  result = result.replace(/\{\{assignedCount\}\}/g, String(ctx.assignedCount));
  result = result.replace(/\{\{nearestDueDate\}\}/g, ctx.nearestDueDate);
  result = result.replace(/\{\{topOverdueTraining\}\}/g, ctx.topOverdueTraining);
  
  return result;
}

/**
 * Generate a personalized template suggestion that uses template variables
 */
export function generatePersonalizedTemplate(tone: ToneVariant): { subject: string; body: string } {
  const templates: Record<ToneVariant, { subject: string; body: string }> = {
    friendly: {
      subject: "Quick Training Reminder, {{firstName}}!",
      body: `Hi {{firstName}},

Just a friendly heads-up about your training assignments!

Here's where you stand:
- Overdue: {{overdueCount}}
- Due soon: {{dueSoonCount}}
- Completed: {{completedCount}}

{{overdueCount}} overdue trainings need your attention. {{topOverdueTraining}} is the most urgent one.

Your next deadline is {{nearestDueDate}}. Set aside some time this week to knock these out - you've got this!

If you're running into any issues, just let me know.

Thanks!`,
    },
    direct: {
      subject: "Action Required: {{overdueCount}} Overdue Trainings - {{firstName}}",
      body: `{{fullName}},

Your current training status requires attention:

- OVERDUE: {{overdueCount}} assignments
- Due within 7 days: {{dueSoonCount}}
- Completed: {{completedCount}} of {{assignedCount}}

Priority Training: {{topOverdueTraining}}
Next Deadline: {{nearestDueDate}}

Please complete your overdue trainings immediately. Log in to the LMS and:

1. Review your pending assignments
2. Complete {{topOverdueTraining}} first
3. Schedule time for remaining trainings before {{nearestDueDate}}

Contact your manager if you need an extension.`,
    },
    escalation: {
      subject: "URGENT: {{overdueCount}} Overdue Trainings Require Immediate Action",
      body: `ATTENTION: {{fullName}}

This is an urgent compliance notice. You have {{overdueCount}} OVERDUE training assignments.

Current Status:
- OVERDUE: {{overdueCount}} (IMMEDIATE ACTION REQUIRED)
- Due soon: {{dueSoonCount}}
- Completed: {{completedCount}}

Most Critical: {{topOverdueTraining}}
Deadline Passed: Please complete immediately

Continued non-compliance may result in:
- Escalation to your manager
- Documented compliance violation
- Restricted system access

Log in NOW and complete your overdue trainings. This is a formal compliance notice.`,
    },
    praise: {
      subject: "Great Work on Your Training, {{firstName}}!",
      body: `Congratulations, {{firstName}}!

I wanted to recognize your excellent progress on training completion.

Your Stats:
- Completed: {{completedCount}} trainings
- Remaining: {{assignedCount}} - {{completedCount}} to go
${`{{dueSoonCount}}` !== "0" ? `- Coming up: {{dueSoonCount}} due soon` : ""}

${`{{overdueCount}}` === "0" ? "You have no overdue trainings - fantastic work staying on top of things!" : "Just {{overdueCount}} more to wrap up and you'll be fully compliant!"}

${`{{nearestDueDate}}` !== "No pending trainings" ? `Next deadline: {{nearestDueDate}}` : ""}

Keep up the great work! Your commitment to professional development makes a real difference.

Thank you!`,
    },
  };

  return templates[tone];
}

