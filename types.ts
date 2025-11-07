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
  styleGuide?: OrgStyleGuide;
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
  policy?: string; // Phase II 1H.4: Support shadow trainings (e.g., 'LMS-COURSE')
  courseId?: string; // Phase II 1H.4: Link to course if training is course-based
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
  metadata?: Record<string, any>;
}

// Phase I Polish Pack: Additional types

// Phase II 1H.3: Updated ChangeLog to support multiple entity types
// Phase II 1H.4: Added CourseAssignment entity
export type ChangeLog = {
  id: string;
  entity: "TrainingCompletion" | "Certificate" | "CertificateTemplate" | "CourseAssignment" | "QuizAttempt";
  entityId: string;
  byUserId: string;
  at: string;
  summary: string;
  metadata?: Record<string, any>;
};

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

// Phase II 1H.3: Certificate Template type
export interface CertificateTemplate {
  id: string;
  name: string;
  isDefault?: boolean;
  backgroundUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  showOrgLogo?: boolean;
  showSignatures?: boolean;
  fields: {
    showCourseTitle?: boolean;
    showUserName?: boolean;
    showIssuedAt?: boolean;
    showSerial?: boolean;
    showCustomText?: boolean;
    customText?: string;
  };
  signatures?: Array<{ title: string; name: string }>;
  createdAt: string;
  updatedAt: string;
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

// Phase II — 1M.1: Skills Tagging
export interface Skill extends Timestamped {
  id: string;
  name: string;
  category?: string; // optional: "Safety", "Equipment", "Compliance", "Emergency"
}

// Phase II — 1N.3: Library types
export type LibraryItemType = "file" | "link";
export type LibraryItemFileType = "pdf" | "ppt" | "pptx" | "doc" | "docx" | "image" | "video" | "other";
export type LibraryItemSource = "upload" | "loom" | "teams" | "youtube" | "vimeo" | "sharepoint" | "drive" | "other";

export interface LibraryItem extends Timestamped {
  id: string;
  type: LibraryItemType;
  title: string;
  description?: string;
  tags: string[];           // free-form tags
  categories: string[];     // hierarchical labels optional (e.g., ["Safety","PPE"])
  fileType?: LibraryItemFileType;
  url?: string;             // for links OR blob/object URL for files in prototype
  source?: LibraryItemSource;
  durationSec?: number;     // optional if known (video)
  pages?: number;           // optional if known (pdf)
  siteId?: string;          // optional scope tag
  departmentId?: string;    // optional scope tag
  createdByUserId: string;
  archivedAt?: string;
  version: number;
  parentId?: string;        // if this is a new version of another LibraryItem
  checksum?: string;        // used for dedupe (string hash of file name+size)
  // File upload metadata (for files)
  fileName?: string;
  fileSize?: number;       // bytes
  mimeType?: string;
}

// Course Policy configuration
export interface CoursePolicy {
  progression: "linear" | "free";
  requireAllLessons: boolean;
  requirePassingQuiz: boolean;
  enableRetakes: boolean;
  lockNextUntilPrevious: boolean;
  showExplanations: boolean;
  requiresManualCompletion?: boolean; // Phase II 1H.1b: If true, show "Mark Complete" button; if false, allow auto-complete
  minVideoWatchPct?: number;
  minTimeOnLessonSec?: number;
  maxQuizAttempts?: number;
  retakeCooldownMin?: number;
  // Phase II 1H.2d: Quiz pass to completion
  requireQuizPassToCompleteLesson?: boolean; // default: false
  requireAllLessonsToCompleteCourse?: boolean; // default: true
  passingScorePct?: number; // optional course-level override for quizzes
  issueCertificateOnComplete?: boolean; // default: true
  minScoreForCertificatePct?: number; // optional threshold
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
  skills?: string[]; // Phase II — 1M.1: array of Skill IDs
  policy?: CoursePolicy;
  ownerUserId?: string;
  lessonIds: string[];
  quizId?: string;
  ai?: { source: "AI"; origin: "prompt" | "file" }; // Epic 1G: AI generation metadata
  metadata?: CourseMetadata; // Epic 1G.7: AI-enhanced metadata
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
  // Epic 1G.8: Style lint metadata
  metadata?: {
    ignoredLints?: IgnoredLint[];
  };
  // Phase II — 1N.3: Library integration
  libraryItemId?: string; // Links to LibraryItem if this resource came from Library
}

// UI alias: Resource data is displayed as "Sections" in the lesson editor
export type Section = Resource;

// Quiz entity (Epic 1G.6: Updated structure)
export type QuestionType = "mcq" | "true_false" | "scenario" | "shorttext" | "multiselect" | "numeric" | "ordering"; // Phase II 1H.2b: Added multiselect, numeric, ordering

export interface QuestionOption {
  id: string;         // opt_<id>
  text: string;       // option text
  correct: boolean;
}

export interface QuestionMeta {
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: { type: 'section' | 'lesson' | 'course', id: string } | 'AI' | 'Manual'; // provenance or AI/Manual indicator
  rationale?: string; // explanation for answer
  language?: string;  // e.g., 'en', 'es'
  tags?: string[];
  confidenceScore?: number; // Phase II 1I.2: AI confidence score (0-1)
  bloomsLevel?: 'knowledge' | 'comprehension' | 'application' | 'analysis'; // Phase II 1I.2: Bloom's taxonomy level
}

export interface Question {
  id: string;                 // q_<id>
  type: QuestionType;
  prompt: string;             // HTML or plain text
  options?: QuestionOption[]; // required for 'mcq', 'scenario', 'multiselect', 'ordering'
  answer?: boolean;           // required for 'true_false'
  correctAnswerText?: string; // Phase II 1H.2a: For shorttext questions
  required?: boolean;         // Phase II 1H.2b: default true
  points?: number;            // Phase II 1H.2b: default 1
  explanation?: string;       // Phase II 1H.2b: shown in result detail
  // Phase II 1H.2b: For multiselect
  grading?: {
    mode: 'all-or-nothing' | 'partial';
  };
  // Phase II 1H.2b: For numeric
  correctNumber?: number;
  tolerance?: number;         // e.g., ±0.5
  // Phase II 1H.2b: For ordering
  correctOrder?: string[];    // array of option IDs in correct sequence
  meta?: QuestionMeta;
  createdAt: string;
  updatedAt: string;
  // Legacy field for backward compatibility during migration
  quizId?: string;            // deprecated: questions now inline in Quiz
}

export interface QuizConfig {
  passingScore: number;       // 0–100
  maxAttempts?: number;       // optional for later
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showRationales?: boolean;   // for author preview
}

// Phase II 1I.1: Quiz Policy (new structure)
export type QuizPolicy = {
  passingScorePct: number;       // e.g., 80
  maxAttempts?: number;          // undefined = unlimited
  showFeedback: 'immediate' | 'end' | 'none';
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  lockOnPass?: boolean;          // hides quiz once passed
};

export interface Quiz extends Timestamped {
  id: string;                 // quiz_<id>
  courseId: string;
  lessonId?: string;          // optional lesson-level quiz
  title: string;
  description?: string;       // Phase II 1H.2b: Optional description
  questions: Question[];     // inline questions (replaces questionIds)
  config: QuizConfig;         // Legacy: kept for backward compatibility
  policy?: QuizPolicy;        // Phase II 1I.1: New policy structure
  showResultDetail?: boolean; // Phase II 1H.2b: default true
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility during migration
  passingScorePct?: number;  // deprecated: use config.passingScore or policy.passingScorePct
  maxAttempts?: number;       // deprecated: use config.maxAttempts or policy.maxAttempts
  questionIds?: string[];     // deprecated: use questions array
}

// Phase II 1H.4: Course Assignment (supports user/role/site/dept targeting with arrays)
export type CourseAssignmentTarget =
  | { type: "user"; userIds: string[] }
  | { type: "role"; roles: Array<"ADMIN" | "MANAGER" | "LEARNER">; siteIds?: string[]; departmentIds?: string[] }
  | { type: "site"; siteIds: string[] }
  | { type: "department"; departmentIds: string[] };

export interface CourseAssignment extends Timestamped {
  id: string;
  courseId: string;
  target: CourseAssignmentTarget;
  dueAt?: string;
  assignerUserId: string;
  notes?: string;
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
  lastLessonId?: string; // Phase II 1H.1b: Resume pointer - last lesson viewed/active
  // Phase II 1H.2d: Enhanced progress tracking
  percentComplete?: number; // Computed 0-100 percentage
  lessonsCompletedCount?: number; // Computed count
  lessonsTotal?: number; // Total lessons (alias for lessonTotal for consistency)
  lastCompletedLessonId?: string; // Most recently completed lesson
  completionReason?: 'all_lessons_complete' | 'admin_override' | 'other'; // Why course was marked complete
}

// Progress tracking for individual lessons
export interface ProgressLesson extends Timestamped {
  id: string;
  lessonId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  watchPct?: number;
  timeSpentSec?: number;
  scrollDepth?: number; // Phase II 1H.5: Scroll depth (0-1) for text/PDF resources
  startedAt?: string; // Phase II 1H.1b: First view timestamp
  completedAt?: string;
  // Phase II 1H.2d: Quiz attempt tracking
  lastQuizAttemptId?: string; // Links to most recent attempt
  lastPassedQuizAttemptId?: string; // Links to most recent passed attempt
}

// Certificate for course completion
export interface Certificate extends Timestamped {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  expiresAt?: string;
  serial: string;
  // Phase II 1H.2d: Optional display metadata
  courseTitle?: string;
  userName?: string;
  orgName?: string;
  // Phase II 1H.3: Template and PDF support
  templateId?: string;
  pdfUrl?: string;
}

// Phase II 1H.2a: Quiz Attempt tracking
export interface GradedQuestion {
  questionId: string;
  pointsAwarded: number;
  pointsPossible: number;
  correct: boolean;
}

// Phase II 1I.1: Updated QuizAttempt interface
export interface QuizAttempt extends Timestamped {
  id: string;
  quizId: string;
  courseId: string;
  lessonId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Array<{ questionId: string; value: string | string[] }>;
  scorePct?: number;
  passed?: boolean;
  // Legacy fields for backward compatibility (deprecated)
  correctCount?: number;
  totalCount?: number;
  attemptNumber?: number; // 1-based (deprecated, calculate from attempts array)
  breakdown?: GradedQuestion[]; // Phase II 1H.2b: per-question grading details (deprecated)
}


// Phase II Epic 1G.7: Course Metadata & Style Guide types

export interface CourseStandards {
  osha?: string[];  // e.g., ["1910.178", "1910.147"]
  msha?: string[];  // optional
  epa?: string[];   // optional
  other?: { label: string; codes: string[] }[];
}

export interface CourseMetadata {
  objectives?: string[];     // bullet goals
  tags?: string[];           // normalized, kebab or lowercased
  estimatedMinutes?: number; // total duration estimate
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;         // 'en', 'es', etc.
  readingLevel?: 'basic' | 'standard' | 'technical';
  standards?: CourseStandards;
  lastAIReviewAt?: string;   // ISO timestamp
}

export interface OrgStyleGuide {
  tone?: 'plain' | 'professional' | 'friendly';
  bannedTerms?: string[];    // e.g., ["PPE kit", prefer "PPE"]
  preferredTerms?: { term: string; preferred: string }[]; // replacements
  readingLevelTarget?: 'basic' | 'standard' | 'technical';
  glossary?: { term: string; definition: string }[];
}

export interface StyleAuditIssue {
  kind: 'bannedTerm' | 'preferredTerm' | 'readingLevel' | 'tone';
  message: string;
  location?: { lessonId?: string; sectionId?: string };
  suggestion?: string; // for quick-fix
}

// Epic 1G.8: Inline style linting types
export interface IgnoredLint {
  kind: StyleAuditIssue['kind'];
  from: number;      // ProseMirror position
  to: number;        // ProseMirror position
  textHash: string;  // hash of text at that range for remapping
}

// Phase II Epic 1G: AI Course Generation types

export type AIInput = {
  prompt: string;
  audienceLevel?: "Beginner" | "Intermediate" | "Advanced";
  tone?: "Practical" | "Concise" | "Compliance";
  targetDurationMins?: number;
};

export type AICourseDraft = {
  title: string;
  description: string;
  tags: string[];
  estimatedMinutes?: number;
  lessons: Array<{
    title: string;
    sections: Array<{
      kind: "TEXT";
      content: string;
    }>;
  }>;
  quiz?: {
    questions: Array<{
      type: "MULTIPLE_CHOICE";
      question: string;
      options: string[];
      correctIndex: number;
      rationale?: string;
    }>;
  };
  aiMeta: {
    source: "AI";
    origin: "prompt" | "file";
    modelHint?: string;
    confidence?: number;
  };
  previewInsights?: AIPreviewInsights;
};

// Epic 1G.3: Preview-only types for AI workspace
export type PreviewSection = {
  kind: "TEXT";
  content: string;
  ai?: {
    generated: boolean;
    lastAction?: "generate" | "regenerate" | "simplify" | "expand";
  };
  _history?: string[]; // Local-only for undo
};

export type AIPreviewInsights = {
  extractedTopics: string[];
  detectedHazards: string[];
  confidence?: number; // 0-1
  source: {
    origin: "prompt" | "file";
    filename?: string;
    prompt?: string;
  };
};

// Epic 1G.4: Audit & Versioning Types

export type AiAction =
  | 'ai_generate_course'
  | 'ai_generate_from_file'
  | 'ai_regenerate'
  | 'ai_rewrite'
  | 'ai_expand'
  | 'ai_simplify'
  | 'ai_add_quiz'
  | 'ai_autofill_metadata'
  | 'style_fix'
  | 'style_fix_inline'
  | 'style_adjust_tone'
  | 'insert_glossary_callout'
  | 'style_fix_bulk'
  | 'style_guide_updated_inline';

export type VersionedEntityType = 'course' | 'lesson' | 'section';

// Version Snapshot - Point-in-time capture of an entity
export interface VersionSnapshot {
  id: string;              // vsn_<ts>_<rand>
  entityType: VersionedEntityType;
  entityId: string;        // id of course|lesson|section
  parentCourseId?: string; // helpful for lesson/section
  createdAt: string;       // ISO timestamp
  createdBy: string;       // userId
  cause: 'manual' | 'ai';
  aiAction?: AiAction;     // when cause === 'ai'
  summary: string;         // short "what changed"
  payload: any;            // deep clone of the entity
}

// Audit Event - Log entry for actions
export interface AuditEvent {
  id: string;              // aud_<ts>_<rand>
  at: string;              // ISO timestamp
  byUserId: string;
  entityType: VersionedEntityType;
  entityId: string;
  parentCourseId?: string;
  action: AiAction | 'manual_edit' | 'undo' | 'redo' | 'assign' | 'unassign';
  meta?: Record<string, any>; // prompt, fileName, tokens, etc.
}

