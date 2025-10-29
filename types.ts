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
  courseId?: string; // Phase II: Link to course if training is course-based
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

// Phase II Epic 1 Fix Pass: Complete Course Library types with proper timestamps and relationships

// Base type for all timestamped entities
export type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

// Course Policy configuration
export interface CoursePolicy {
  progression: "linear" | "free";
  requireAllLessons: boolean;
  requirePassingQuiz: boolean;
  enableRetakes: boolean;
  lockNextUntilPrevious: boolean;
  showExplanations: boolean;
  minVideoWatchPct?: number;
  minTimeOnLessonSec?: number;
  maxQuizAttempts?: number;
  retakeCooldownMin?: number;
}

// Course entity
export interface Course extends Timestamped {
  id: string;
  title: string;
  description: string;
  category?: string;
  estimatedMinutes?: number;
  status: "draft" | "published";
  tags?: string[];
  standards?: string[];
  policy?: CoursePolicy;
  ownerUserId?: string;
  lessonIds: string[];
  quizId?: string;
}

// Lesson entity
export interface Lesson extends Timestamped {
  id: string;
  courseId: string;
  title: string;
  order: number;
  resourceIds: string[];
}

// Resource entity (attached to lessons)
export type ResourceType = "pdf" | "link" | "text" | "image" | "video";

export interface Resource extends Timestamped {
  id: string;
  courseId: string;       // denormalized for easier queries
  lessonId: string;
  type: ResourceType;
  title: string;
  url?: string;
  content?: string;
  durationSec?: number;
  // File upload metadata
  fileName?: string;
  fileSize?: number;      // bytes
  mimeType?: string;
  order: number;          // stable ordering within lesson (0, 1, 2, ...)
}

// UI alias: Resource data is displayed as "Sections" in the lesson editor
export type Section = Resource;

// Quiz entity
export interface Quiz extends Timestamped {
  id: string;
  courseId: string;
  passingScorePct: number;
  maxAttempts: number;
  questionIds: string[];
}

// Question entity
export type QuestionType = "mcq_single" | "mcq_multi" | "true_false";

export interface QuestionOption {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface Question extends Timestamped {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  explanation?: string;
}

// Course Assignment (supports user/role/site/dept targeting)
export type CourseAssignmentTarget =
  | { type: "user"; userId: string }
  | { type: "role"; role: "LEARNER" | "MANAGER" }
  | { type: "site"; siteId: string }
  | { type: "dept"; deptId: string };

export interface CourseAssignment extends Timestamped {
  id: string;
  courseId: string;
  target: CourseAssignmentTarget;
  dueAt?: string;
}

// Progress tracking for courses
export interface ProgressCourse extends Timestamped {
  id: string;
  courseId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  lessonDoneCount: number;
  lessonTotal: number;
  scorePct?: number;
  attempts?: number;
  completedAt?: string;
}

// Progress tracking for individual lessons
export interface ProgressLesson extends Timestamped {
  id: string;
  lessonId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  watchPct?: number;
  timeSpentSec?: number;
  completedAt?: string;
}

// Certificate for course completion
export interface Certificate extends Timestamped {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  expiresAt?: string;
  serial: string;
}

