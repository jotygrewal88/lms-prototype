// Phase I Epic 1 & 2: Core type definitions for UpKeep LMS

export type Role = "ADMIN" | "MANAGER" | "LEARNER";

export interface OrgSettings {
  timezone: string;
  dateFormat: "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY";
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  settings: OrgSettings;
}

export interface Site {
  id: string;
  name: string;
  organizationId: string;
}

export interface Department {
  id: string;
  name: string;
  siteId: string;
}

export type Scope = {
  siteId: string; // "ALL" or site ID
  deptId: string; // "ALL" or dept ID
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  siteId?: string;
  departmentId?: string;
  managerId?: string;
  active: boolean;
}

// Helper function to get full name
export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

// Phase I Epic 2: Training & Compliance types

export interface TrainingAssignment {
  roles?: Role[];
  sites?: string[];
  departments?: string[];
  users?: string[];
}

export interface Training {
  id: string;
  title: string;
  description?: string;
  standardRef?: string;
  assignment: TrainingAssignment;
  retrainIntervalDays?: number;
  ownerManagerId?: string;
  policyUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompletionStatus = "ASSIGNED" | "COMPLETED" | "OVERDUE" | "EXEMPT";

export interface TrainingCompletion {
  id: string;
  trainingId: string;
  userId: string;
  status: CompletionStatus;
  dueAt: string;
  completedAt?: string;
  expiresAt?: string;
  overdueDays?: number;
  notes?: string;
  proofUrl?: string;
  exemptionReason?: string;
  exemptionAttestedBy?: string;
  exemptionAttestedAt?: string;
  assignedManagerId?: string;
}

// Phase I Epic 3: Reminders & Escalation types

export type ReminderTrigger = "upcoming" | "overdue" | "retraining";

export interface ReminderRule {
  id: string;
  name: string;
  trigger: ReminderTrigger;
  offsetDays: number;
  escalationAfterDays?: number;
  active: boolean;
}

export interface EscalationLog {
  id: string;
  trainingCompletionId: string;
  triggeredAt: string;
  escalatedToUserId: string;
  resolved: boolean;
}

export type NotificationType = "reminder" | "escalation";
export type NotificationSource = "Compliance" | "Coach";
export type Audience = "MANAGERS" | "LEARNERS" | "SPECIFIC";

export interface Notification {
  id: string;
  type?: NotificationType; // Legacy field, optional
  recipientId?: string; // Legacy field, optional
  message?: string; // Legacy field, optional
  createdAt?: string; // Legacy field, optional
  sentAt: string;
  senderId: string; // Who sent it
  audience: Audience; // Target audience type
  subject: string;
  body: string;
  source: NotificationSource;
  recipients: Array<{ userId: string; name: string; email: string }>;
  scopeSnapshot?: { siteId: string; deptId: string; siteName?: string; deptName?: string };
  contextSnapshot?: {
    departmentName?: string;
    siteName?: string;
    countOverdue: number;
    dueSoonCount: number;
    topTrainingTitle?: string;
    nearestDueDate?: string;
    onTimePct?: number;
  };
  status: "SENT";
}

// Phase I Polish Pack: Additional types

export interface ChangeLog {
  id: string;
  entity: "TrainingCompletion";
  entityId: string;
  byUserId: string;
  at: string;
  summary: string;
  metadata?: {
    action: "status_change" | "due_date_change" | "completion_logged" | "exempt" | "proof_added" | "bulk_op";
    reason?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface AuditSnapshot {
  id: string;
  createdAt: string;
  createdByUserId: string;
  filtersSummary: string;
  filters: {
    site?: string;
    department?: string;
    training?: string;
    status?: string;
    search?: string;
  };
  rows: TrainingCompletion[];
  rowCount: number;
}

export interface NotificationTemplate {
  id: string;
  type: "upcoming" | "overdue" | "escalation";
  subject: string;
  body: string;
}

