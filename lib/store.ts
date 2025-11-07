// Phase I Epic 1, 2 & 3: In-memory global state store
// Phase II Epic 1: Extended with Course Library
"use client";

import { Organization, User, Site, Department, Training, TrainingCompletion, ReminderRule, EscalationLog, Notification, ChangeLog, AuditSnapshot, NotificationTemplate, Scope, Course, Lesson, Resource, Section, Quiz, Question, CourseAssignment, ProgressCourse, ProgressLesson, Certificate, CertificateTemplate, VersionSnapshot, AuditEvent, AiAction, VersionedEntityType, CourseMetadata, OrgStyleGuide, StyleAuditIssue, IgnoredLint, QuizAttempt, GradedQuestion, CoursePolicy, QuizPolicy, Skill, getFullName, LibraryItem } from "@/types";
import { 
  organization as seedOrg, 
  users as seedUsers, 
  sites as seedSites, 
  departments as seedDepartments,
  trainings as seedTrainings,
  completions as seedCompletions,
  reminderRules as seedReminderRules,
  notificationTemplates as seedNotificationTemplates,
  certificateTemplates as seedCertificateTemplates
} from "@/data/seed";
import {
  courses as seedCourses,
  lessons as seedLessons,
  resources as seedResources,
  quizzes as seedQuizzes,
  questions as seedQuestions,
  assignments as seedAssignments,
  progressCourses as seedProgressCourses,
  progressLessons as seedProgressLessons,
  certificates as seedCertificates
} from "@/data/seedCoursesV2";
import { seedSkills } from "@/data/seedSkills";
import { libraryItems as seedLibraryItems } from "@/data/seedLibrary";

// Re-export Scope type for convenience
export type { Scope };

// In-memory state
let currentUser: User = seedUsers[0]; // Default to Admin
let organization: Organization = { ...seedOrg };
const users: User[] = [...seedUsers];
const sites: Site[] = [...seedSites];
const departments: Department[] = [...seedDepartments];
let trainings: Training[] = [...seedTrainings];
let completions: TrainingCompletion[] = [...seedCompletions];
let reminderRules: ReminderRule[] = [...seedReminderRules];
let escalationLogs: EscalationLog[] = [];
let notifications: Notification[] = [];
let changeLogs: ChangeLog[] = [];
let auditSnapshots: AuditSnapshot[] = [];
let notificationTemplates: NotificationTemplate[] = [...seedNotificationTemplates];

// Phase II Epic 1 Fix Pass: Course Library state
let courses: Course[] = [...seedCourses];
let lessons: Lesson[] = [...seedLessons];
let resources: Resource[] = [...seedResources];
let quizzes: Quiz[] = [...seedQuizzes];
let questions: Question[] = [...seedQuestions];
let assignments: CourseAssignment[] = [...seedAssignments];

// Phase II — 1M.1: Skills Tagging state
let skills: Skill[] = [...seedSkills];

// Phase II — 1N.3: Library state
let libraryItems: LibraryItem[] = [...seedLibraryItems];

// Phase II 1H.2a: Quiz Attempts state
let quizAttempts: QuizAttempt[] = [];

// Epic 1G.4: Versioning & Audit State
let versionSnapshots: VersionSnapshot[] = [];
let auditEvents: AuditEvent[] = [];

// Undo/Redo Stacks (per entity)
const undoStack: Record<string, string[]> = {}; // key: `${entityType}:${entityId}`
const redoStack: Record<string, string[]> = {};
let progressCourses: ProgressCourse[] = [...seedProgressCourses];
let progressLessons: ProgressLesson[] = [...seedProgressLessons];
let certificates: Certificate[] = [...seedCertificates];
let certificateTemplates: CertificateTemplate[] = [...seedCertificateTemplates];

// Scope state with localStorage persistence
const SCOPE_STORAGE_KEY = "uklms_scope";
let currentScope: Scope = { siteId: "ALL", deptId: "ALL" };

// Hydrate scope from localStorage on init (client-side only)
if (typeof window !== "undefined") {
  const stored = localStorage.getItem(SCOPE_STORAGE_KEY);
  if (stored) {
    try {
      currentScope = JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse stored scope", e);
    }
  }
}

// Listeners for state changes
type Listener = () => void;
const listeners: Listener[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

// Current user management
export function getCurrentUser(): User {
  return currentUser;
}

export function switchRole(userId: string): void {
  const user = users.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    notifyListeners();
  }
}

// Organization & data accessors
export function getOrganization(): Organization {
  return organization;
}

export function getSites(): Site[] {
  return sites;
}

export function getDepartments(): Department[] {
  return departments;
}

export function getUsers(includeInactive = false): User[] {
  return includeInactive ? users : users.filter(u => u.active);
}

export function getUser(userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function createUser(userData: Omit<User, 'id'>): void {
  // Check email uniqueness
  const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    throw new Error(`Email ${userData.email} is already in use`);
  }
  
  // Generate ID
  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newUser: User = { id, ...userData };
  
  users.push(newUser);
  
  // Log change
  const { logChange } = require('./changeLog');
  const siteName = userData.siteId ? getSiteById(userData.siteId)?.name || 'N/A' : 'N/A';
  const deptName = userData.departmentId ? getDepartmentById(userData.departmentId)?.name || 'N/A' : 'N/A';
  logChange(
    id, 
    `User created: ${newUser.role} @ ${siteName}/${deptName}`,
    { action: 'user_create' }
  );
  
  notifyListeners();
}

export function updateUser(userId: string, patch: Partial<Omit<User, 'id'>>): void {
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('User not found');
  
  // Check email uniqueness if email is being changed
  if (patch.email && patch.email !== users[index].email) {
    const existingUser = users.find(u => u.email.toLowerCase() === patch.email!.toLowerCase() && u.id !== userId);
    if (existingUser) {
      throw new Error(`Email ${patch.email} is already in use`);
    }
  }
  
  users[index] = { ...users[index], ...patch };
  
  // Log change with field summary
  const { logChange } = require('./changeLog');
  const changedFields = Object.keys(patch).join(', ');
  logChange(
    userId,
    `User updated: ${changedFields}`,
    { action: 'user_update' }
  );
  
  notifyListeners();
}

export function deactivateUser(userId: string): void {
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  user.active = false;
  
  // Log change
  const { logChange } = require('./changeLog');
  logChange(
    userId,
    `User deactivated: ${user.firstName} ${user.lastName}`,
    { action: 'user_deactivate' }
  );
  
  notifyListeners();
}

export function reactivateUser(userId: string): void {
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  user.active = true;
  
  // Log change
  const { logChange } = require('./changeLog');
  logChange(
    userId,
    `User reactivated: ${user.firstName} ${user.lastName}`,
    { action: 'user_reactivate' }
  );
  
  notifyListeners();
}

export function getSiteById(siteId: string): Site | undefined {
  return sites.find(s => s.id === siteId);
}

export function getDepartmentById(deptId: string): Department | undefined {
  return departments.find(d => d.id === deptId);
}

// Brand settings
export function updateBrandSettings(primaryColor: string, logo: string): void {
  organization = {
    ...organization,
    primaryColor,
    logo,
  };
  notifyListeners();
}

// Training management (Epic 2)
export function getTrainings(): Training[] {
  return trainings;
}

export function getTrainingById(id: string): Training | undefined {
  return trainings.find(t => t.id === id);
}

export function createTraining(training: Training): void {
  trainings.push(training);
  notifyListeners();
}

export function updateTraining(id: string, updates: Partial<Training>): void {
  const index = trainings.findIndex(t => t.id === id);
  if (index !== -1) {
    trainings[index] = { ...trainings[index], ...updates };
    notifyListeners();
  }
}

export function deleteTraining(id: string): void {
  trainings = trainings.filter(t => t.id !== id);
  // Also remove associated completions
  completions = completions.filter(c => c.trainingId !== id);
  notifyListeners();
}

// Completion management (Epic 2)
export function getCompletions(): TrainingCompletion[] {
  return completions;
}

export function getCompletionById(id: string): TrainingCompletion | undefined {
  return completions.find(c => c.id === id);
}

export function getCompletionsByTrainingId(trainingId: string): TrainingCompletion[] {
  return completions.filter(c => c.trainingId === trainingId);
}

export function getCompletionsByUserId(userId: string): TrainingCompletion[] {
  return completions.filter(c => c.userId === userId);
}

export function createCompletion(completion: TrainingCompletion): void {
  completions.push(completion);
  notifyListeners();
}

export function updateCompletion(id: string, updates: Partial<TrainingCompletion>): void {
  const index = completions.findIndex(c => c.id === id);
  if (index !== -1) {
    completions[index] = { ...completions[index], ...updates };
    notifyListeners();
  }
}

export function deleteCompletion(id: string): void {
  completions = completions.filter(c => c.id !== id);
  notifyListeners();
}

// Reminder Rule management (Epic 3)
export function getReminderRules(): ReminderRule[] {
  return reminderRules;
}

export function getReminderRuleById(id: string): ReminderRule | undefined {
  return reminderRules.find(r => r.id === id);
}

export function createReminderRule(rule: ReminderRule): void {
  reminderRules.push(rule);
  notifyListeners();
}

export function updateReminderRule(id: string, updates: Partial<ReminderRule>): void {
  const index = reminderRules.findIndex(r => r.id === id);
  if (index !== -1) {
    reminderRules[index] = { ...reminderRules[index], ...updates };
    notifyListeners();
  }
}

export function deleteReminderRule(id: string): void {
  reminderRules = reminderRules.filter(r => r.id !== id);
  notifyListeners();
}

// Escalation Log management (Epic 3)
export function getEscalationLogs(): EscalationLog[] {
  return escalationLogs;
}

export function getEscalationLogById(id: string): EscalationLog | undefined {
  return escalationLogs.find(e => e.id === id);
}

export function createEscalationLog(log: EscalationLog): void {
  escalationLogs.push(log);
  notifyListeners();
}

export function updateEscalationLog(id: string, updates: Partial<EscalationLog>): void {
  const index = escalationLogs.findIndex(e => e.id === id);
  if (index !== -1) {
    escalationLogs[index] = { ...escalationLogs[index], ...updates };
    notifyListeners();
  }
}

export function deleteEscalationLog(id: string): void {
  escalationLogs = escalationLogs.filter(e => e.id !== id);
  notifyListeners();
}

// Notification management (Epic 3)
export function getNotifications(): Notification[] {
  return notifications;
}

export function getNotificationById(id: string): Notification | undefined {
  return notifications.find(n => n.id === id);
}

export function getNotificationsByUserId(userId: string): Notification[] {
  return notifications.filter(n => n.recipientId === userId);
}

export function createNotification(notification: Notification): void {
  notifications.push(notification);
  
  // Log change if this is a new-style notification with recipients
  if (notification.recipients && notification.recipients.length > 0) {
    const { logChange } = require('./changeLog');
    logChange(
      notification.id,
      `Notification sent (mock) to ${notification.recipients.length} recipient${notification.recipients.length > 1 ? 's' : ''}`,
      { action: 'bulk_op' }
    );
  }
  
  notifyListeners();
}

export function deleteNotification(id: string): void {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
}

export function clearAllNotifications(): void {
  notifications = [];
  notifyListeners();
}

// Get notifications filtered by scope for manager view
export function getNotificationsByScope(scope: Scope): Notification[] {
  if (scope.siteId === "ALL" && scope.deptId === "ALL") {
    return notifications;
  }

  return notifications.filter(notification => {
    // Legacy notifications without scope snapshot - show all
    if (!notification.scopeSnapshot) return true;

    const snapshot = notification.scopeSnapshot;
    
    // Check site match
    if (scope.siteId !== "ALL" && snapshot.siteId !== scope.siteId) {
      return false;
    }

    // Check department match
    if (scope.deptId !== "ALL" && snapshot.deptId !== scope.deptId) {
      return false;
    }

    return true;
  });
}

// Get notifications sent by a specific user
export function getSentNotifications(userId: string): Notification[] {
  return notifications.filter(n => n.senderId === userId);
}

// Get notifications received by a specific user
export function getReceivedNotifications(userId: string): Notification[] {
  return notifications.filter(n => 
    n.recipients && n.recipients.some(r => r.userId === userId)
  );
}

// ChangeLog management (Polish Pack)
export function getChangeLogs(): ChangeLog[] {
  return changeLogs;
}

export function getChangeLogsByEntityId(entityId: string): ChangeLog[] {
  return changeLogs.filter(log => log.entityId === entityId);
}

export function createChangeLog(log: ChangeLog): ChangeLog {
  changeLogs.push(log);
  notifyListeners();
  return log;
}

// AuditSnapshot management (Polish Pack)
export function getAuditSnapshots(): AuditSnapshot[] {
  return auditSnapshots;
}

export function getAuditSnapshotById(id: string): AuditSnapshot | undefined {
  return auditSnapshots.find(s => s.id === id);
}

export function createAuditSnapshot(
  filters: AuditSnapshot["filters"],
  filtersSummary: string,
  rows: TrainingCompletion[],
  userId: string
): AuditSnapshot {
  const snapshot: AuditSnapshot = {
    id: `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    createdByUserId: userId,
    filtersSummary,
    filters,
    rows: JSON.parse(JSON.stringify(rows)), // Deep clone
    rowCount: rows.length,
  };
  auditSnapshots.push(snapshot);
  notifyListeners();
  return snapshot;
}

export function deleteAuditSnapshot(id: string): void {
  auditSnapshots = auditSnapshots.filter(s => s.id !== id);
  notifyListeners();
}

// NotificationTemplate management (Polish Pack)
export function getNotificationTemplates(): NotificationTemplate[] {
  return notificationTemplates;
}

export function getNotificationTemplateById(id: string): NotificationTemplate | undefined {
  return notificationTemplates.find(t => t.id === id);
}

export function updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>): void {
  const index = notificationTemplates.findIndex(t => t.id === id);
  if (index !== -1) {
    notificationTemplates[index] = { ...notificationTemplates[index], ...updates };
    notifyListeners();
  }
}

// Scope management with localStorage persistence
export function getScope(): Scope {
  return { ...currentScope };
}

export function setScope(scope: Scope): void {
  currentScope = { ...scope };
  if (typeof window !== "undefined") {
    localStorage.setItem(SCOPE_STORAGE_KEY, JSON.stringify(scope));
  }
  notifyListeners();
}

export function resetScope(): void {
  setScope({ siteId: "ALL", deptId: "ALL" });
}

// Organization settings (Polish Pack)
export function updateOrganizationSettings(updates: Partial<Organization>): void {
  organization = { ...organization, ...updates };
  notifyListeners();
}

// Organization style guide
export function setOrgStyleGuide(updates: Partial<OrgStyleGuide>): void {
  organization.styleGuide = { ...organization.styleGuide, ...updates };
  notifyListeners();
}

// Demo mode (Polish Pack)
export function resetToSeed(): void {
  organization = { ...seedOrg };
  trainings = [...seedTrainings];
  completions = [...seedCompletions];
  reminderRules = [...seedReminderRules];
  escalationLogs = [];
  notifications = [];
  changeLogs = [];
  auditSnapshots = [];
  notificationTemplates = [...seedNotificationTemplates];
  
  // Phase II Fix Pass: Reset course data
  courses = [...seedCourses];
  lessons = [...seedLessons];
  resources = [...seedResources];
  quizzes = [...seedQuizzes];
  questions = [...seedQuestions];
  assignments = [...seedAssignments];
  progressCourses = [...seedProgressCourses];
  progressLessons = [...seedProgressLessons];
  certificates = [...seedCertificates];
  // Phase II — 1M.1: Reset skills
  skills = [...seedSkills];
  
  // Epic 1G.4: Initialize sample version snapshots and audit events
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  
  // Get first course and lesson for demo data
  const firstCourse = seedCourses[0];
  const firstLesson = seedLessons.find(l => l.courseId === firstCourse?.id);
  const firstResource = firstLesson ? seedResources.find(r => r.lessonId === firstLesson.id) : undefined;
  
  // Sample Version Snapshots
  versionSnapshots = [];
  if (firstCourse) {
    versionSnapshots.push({
      id: 'vsn_seed_1',
      entityType: 'course' as const,
      entityId: firstCourse.id,
      createdAt: twoHoursAgo,
      createdBy: 'usr_admin_1',
      cause: 'ai' as const,
      aiAction: 'ai_generate_course',
      summary: `AI generated course: "${firstCourse.title}"`,
      payload: { ...firstCourse },
    });
    
    versionSnapshots.push({
      id: 'vsn_seed_2',
      entityType: 'course' as const,
      entityId: firstCourse.id,
      createdAt: oneDayAgo,
      createdBy: 'usr_admin_1',
      cause: 'manual' as const,
      summary: `Updated course metadata and tags`,
      payload: { ...firstCourse, title: firstCourse.title + ' (Previous Version)' },
    });
  }
  
  if (firstLesson) {
    versionSnapshots.push({
      id: 'vsn_seed_3',
      entityType: 'lesson' as const,
      entityId: firstLesson.id,
      parentCourseId: firstCourse?.id,
      createdAt: twoDaysAgo,
      createdBy: 'usr_admin_1',
      cause: 'ai' as const,
      aiAction: 'ai_rewrite',
      summary: `AI rewrote lesson: "${firstLesson.title}"`,
      payload: { ...firstLesson },
    });
  }
  
  // Sample Audit Events
  auditEvents = [];
  if (firstCourse) {
    auditEvents.push({
      id: 'aud_seed_1',
      at: twoHoursAgo,
      byUserId: 'usr_admin_1',
      entityType: 'course' as const,
      entityId: firstCourse.id,
      action: 'ai_generate_course',
      meta: {
        origin: 'prompt',
        prompt: 'Create OSHA workplace safety training',
        lessonCount: seedLessons.filter(l => l.courseId === firstCourse.id).length,
        hasQuiz: !!firstCourse.quizId,
      },
    });
    
    auditEvents.push({
      id: 'aud_seed_2',
      at: oneDayAgo,
      byUserId: 'usr_admin_1',
      entityType: 'course' as const,
      entityId: firstCourse.id,
      action: 'manual_edit',
      meta: {
        fields: ['tags', 'estimatedMinutes'],
      },
    });
  }
  
  if (firstLesson) {
    auditEvents.push({
      id: 'aud_seed_3',
      at: twoDaysAgo,
      byUserId: 'usr_admin_1',
      entityType: 'lesson' as const,
      entityId: firstLesson.id,
      parentCourseId: firstCourse?.id,
      action: 'ai_rewrite',
      meta: {
        lessonTitle: firstLesson.title,
      },
    });
  }
  
  if (firstResource) {
    auditEvents.push({
      id: 'aud_seed_4',
      at: twoHoursAgo,
      byUserId: 'usr_admin_1',
      entityType: 'section' as const,
      entityId: firstResource.id,
      parentCourseId: firstCourse?.id,
      action: 'ai_expand',
      meta: {
        sectionTitle: firstResource.title,
      },
    });
  }
  
  currentScope = { siteId: "ALL", deptId: "ALL" };
  if (typeof window !== "undefined") {
    localStorage.setItem(SCOPE_STORAGE_KEY, JSON.stringify(currentScope));
  }
  
  // Create initial ChangeLog entries for all completions
  completions.forEach(completion => {
    createChangeLog({
      id: `log_seed_${completion.id}`,
      entity: "TrainingCompletion",
      entityId: completion.id,
      byUserId: "system",
      at: new Date().toISOString(),
      summary: "Seeded dataset",
      metadata: {
        action: "status_change",
      },
    });
  });
  
  notifyListeners();
}

export function loadScenario(scenario: "A" | "B"): void {
  // Will be implemented with scenario data
  import(`@/data/scenarios`).then(({ scenarioA, scenarioB }) => {
    const data = scenario === "A" ? scenarioA : scenarioB;
    trainings = [...data.trainings];
    completions = [...data.completions];
    changeLogs = [];
    auditSnapshots = [];
    escalationLogs = [];
    notifications = [];
    
    // Create ChangeLog entries for all completions in the scenario
    const scenarioName = scenario === "A" ? "Scenario A" : "Scenario B";
    completions.forEach(completion => {
      createChangeLog({
        id: `log_scenario_${scenario}_${completion.id}`,
        entity: "TrainingCompletion",
        entityId: completion.id,
        byUserId: "system",
        at: new Date().toISOString(),
        summary: `${scenarioName} generated`,
        metadata: {
          action: "status_change",
        },
      });
    });
    
    notifyListeners();
  });
}

// Phase II Epic 1 Fix Pass: Course Management

// Timestamp helper
function timestamp(): string {
  return new Date().toISOString();
}

// Course CRUD operations
export function getCourses(): Course[] {
  return courses;
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

export function createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Course {
  const now = timestamp();
  const course: Course = {
    ...data,
    id: `crs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    lessonIds: data.lessonIds || [],
    createdAt: now,
    updatedAt: now,
  };
  courses.push(course);
  notifyListeners();
  return course;
}

export function updateCourse(id: string, updates: Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>): void {
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { 
      ...courses[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export function deleteCourse(id: string): void {
  // Cascade delete: remove course and all associated data
  const course = courses.find(c => c.id === id);
  if (!course) return;

  // Remove lessons and their resources
  const courseLessonIds = course.lessonIds;
  courseLessonIds.forEach(lessonId => {
    resources = resources.filter(r => r.lessonId !== lessonId);
  });
  lessons = lessons.filter(l => !courseLessonIds.includes(l.id));

  // Remove quiz and questions
  const quiz = quizzes.find(q => q.courseId === id);
  if (quiz) {
    questions = questions.filter(q => q.quizId !== quiz.id);
    quizzes = quizzes.filter(q => q.id !== quiz.id);
  }

  // Remove assignments and progress
  assignments = assignments.filter(a => a.courseId !== id);
  progressCourses = progressCourses.filter(p => p.courseId !== id);
  progressLessons = progressLessons.filter(pl => courseLessonIds.includes(pl.lessonId));
  certificates = certificates.filter(c => c.courseId !== id);

  // Remove course
  courses = courses.filter(c => c.id !== id);
  notifyListeners();
}

// Lesson CRUD operations
export function getLessons(): Lesson[] {
  return lessons;
}

export function getLessonsByCourseId(courseId: string): Lesson[] {
  return lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id);
}

export function createLesson(data: Omit<Lesson, "id" | "createdAt" | "updatedAt">): Lesson {
  const now = timestamp();
  const lesson: Lesson = {
    ...data,
    id: `lsn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    resourceIds: data.resourceIds || [],
    createdAt: now,
    updatedAt: now,
  };
  lessons.push(lesson);

  // Add lesson to course's lessonIds
  const course = courses.find(c => c.id === data.courseId);
  if (course && !course.lessonIds.includes(lesson.id)) {
    course.lessonIds.push(lesson.id);
  }

  notifyListeners();
  return lesson;
}

export function updateLesson(id: string, updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>): void {
  const index = lessons.findIndex(l => l.id === id);
  if (index !== -1) {
    lessons[index] = { 
      ...lessons[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export function deleteLesson(id: string): void {
  const lesson = lessons.find(l => l.id === id);
  if (!lesson) return;

  // Remove resources
  resources = resources.filter(r => r.lessonId !== id);

  // Remove progress
  progressLessons = progressLessons.filter(p => p.lessonId !== id);

  // Remove from course's lessonIds
  const course = courses.find(c => c.id === lesson.courseId);
  if (course) {
    course.lessonIds = course.lessonIds.filter(lid => lid !== id);
  }

  // Remove lesson
  lessons = lessons.filter(l => l.id !== id);
  notifyListeners();
}

export function reorderLessons(courseId: string, orderedLessonIds: string[]): void {
  orderedLessonIds.forEach((lessonId, index) => {
    const lesson = lessons.find(l => l.id === lessonId && l.courseId === courseId);
    if (lesson) {
      lesson.order = index + 1;
      lesson.updatedAt = timestamp();
    }
  });
  
  // Update course's lessonIds to match the new order
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.lessonIds = orderedLessonIds;
    course.updatedAt = timestamp();
  }
  
  notifyListeners();
}

// Resource CRUD operations
export function getResources(): Resource[] {
  return resources;
}

export function getResourcesByLessonId(lessonId: string): Resource[] {
  return resources.filter(r => r.lessonId === lessonId);
}

export function getResourceById(id: string): Resource | undefined {
  return resources.find(r => r.id === id);
}

// UI helper: Get sections (resources) for a lesson
export function getSectionsByLessonId(lessonId: string): Section[] {
  return getResourcesByLessonId(lessonId);
}

export function createResource(data: Omit<Resource, "id" | "createdAt" | "updatedAt" | "order">): Resource {
  const now = timestamp();
  
  // Get lesson to derive courseId and calculate order
  const lesson = lessons.find(l => l.id === data.lessonId);
  if (!lesson) {
    throw new Error(`Lesson ${data.lessonId} not found`);
  }
  
  // Calculate next order value
  const lessonResources = resources.filter(r => r.lessonId === data.lessonId);
  const maxOrder = lessonResources.length > 0 
    ? Math.max(...lessonResources.map(r => r.order ?? 0))
    : -1;
  
  const resource: Resource = {
    ...data,
    courseId: lesson.courseId,
    order: maxOrder + 1,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  resources.push(resource);

  // Add resource to lesson's resourceIds
  if (!lesson.resourceIds.includes(resource.id)) {
    lesson.resourceIds.push(resource.id);
    lesson.updatedAt = timestamp();
  }
  
  // Update course timestamp
  const course = courses.find(c => c.id === lesson.courseId);
  if (course) {
    course.updatedAt = timestamp();
  }

  notifyListeners();
  return resource;
}

export function updateResource(id: string, updates: Partial<Omit<Resource, "id" | "createdAt" | "updatedAt">>): void {
  const index = resources.findIndex(r => r.id === id);
  if (index !== -1) {
    resources[index] = { 
      ...resources[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export async function deleteResource(id: string): Promise<void> {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  // Delete file from disk if it's an uploaded file
  if (resource.url && resource.url.startsWith('/uploads/')) {
    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: resource.url }),
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue with resource deletion even if file delete fails
    }
  }

  // Remove from lesson's resourceIds
  const lesson = lessons.find(l => l.id === resource.lessonId);
  if (lesson) {
    lesson.resourceIds = lesson.resourceIds.filter(rid => rid !== id);
    lesson.updatedAt = timestamp();
  }

  // Remove resource
  resources = resources.filter(r => r.id !== id);
  notifyListeners();
}

export function reorderResources(lessonId: string, orderedResourceIds: string[]): void {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  // Update lesson's resourceIds to match new order
  lesson.resourceIds = orderedResourceIds;
  lesson.updatedAt = timestamp();
  
  // Normalize order values to 0..n-1
  orderedResourceIds.forEach((resourceId, index) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      resource.order = index;
      resource.updatedAt = timestamp();
    }
  });

  // Update parent course's updatedAt
  const course = courses.find(c => c.lessonIds.includes(lessonId));
  if (course) {
    course.updatedAt = timestamp();
  }

  notifyListeners();
}

// Batch create resources (for multi-upload)
export function addResourcesBatch(
  lessonId: string,
  items: Array<Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'courseId' | 'lessonId'>>
): Resource[] {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) {
    throw new Error(`Lesson ${lessonId} not found`);
  }
  
  const lessonResources = resources.filter(r => r.lessonId === lessonId);
  let nextOrder = lessonResources.length > 0
    ? Math.max(...lessonResources.map(r => r.order ?? 0)) + 1
    : 0;
  
  const now = timestamp();
  const createdResources: Resource[] = [];
  
  items.forEach(item => {
    const resource: Resource = {
      ...item,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      courseId: lesson.courseId,
      lessonId,
      order: nextOrder++,
      createdAt: now,
      updatedAt: now,
    };
    resources.push(resource);
    lesson.resourceIds.push(resource.id);
    createdResources.push(resource);
  });
  
  lesson.updatedAt = timestamp();
  
  const course = courses.find(c => c.id === lesson.courseId);
  if (course) {
    course.updatedAt = timestamp();
  }
  
  notifyListeners();
  return createdResources;
}

// Inline editing helper
export function updateResourceInline(
  resourceId: string,
  patch: Partial<Pick<Resource, 'title' | 'content'>>
): void {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return;
  
  Object.assign(resource, patch);
  resource.updatedAt = timestamp();
  
  const lesson = lessons.find(l => l.id === resource.lessonId);
  if (lesson) {
    lesson.updatedAt = timestamp();
    
    const course = courses.find(c => c.id === lesson.courseId);
    if (course) {
      course.updatedAt = timestamp();
    }
  }
  
  notifyListeners();
}

// Get resource counts by type
export function getLessonResourceCounts(lessonId: string): {
  image: number;
  video: number;
  pdf: number;
  link: number;
  text: number;
  total: number;
} {
  const lessonResources = resources.filter(r => r.lessonId === lessonId);
  
  return {
    image: lessonResources.filter(r => r.type === 'image').length,
    video: lessonResources.filter(r => r.type === 'video').length,
    pdf: lessonResources.filter(r => r.type === 'pdf').length,
    link: lessonResources.filter(r => r.type === 'link').length,
    text: lessonResources.filter(r => r.type === 'text').length,
    total: lessonResources.length,
  };
}

// Style editing functions for RichTextEditor
export function applyInlineStyleFix(sectionId: string, replacement: string, issue: StyleAuditIssue): void {
  const section = resources.find(r => r.id === sectionId);
  if (section && section.content) {
    // The RichTextEditor handles the actual content update through its own mechanisms
    // This function is primarily for triggering store notifications
    section.updatedAt = timestamp();
    notifyListeners();
  }
}

export function addIgnoredLint(sectionId: string, ignoredLint: IgnoredLint): void {
  const section = resources.find(r => r.id === sectionId);
  if (section) {
    if (!section.metadata) {
      section.metadata = {};
    }
    if (!section.metadata.ignoredLints) {
      section.metadata.ignoredLints = [];
    }
    section.metadata.ignoredLints.push(ignoredLint);
    section.updatedAt = timestamp();
    notifyListeners();
  }
}

export function insertGlossaryCallout(sectionId: string, term: string, definition: string, position?: number): void {
  const section = resources.find(r => r.id === sectionId);
  if (section && section.content) {
    const calloutHtml = `<div class="glossary-callout" data-term="${term}"><strong>${term}:</strong> ${definition}</div>`;
    if (position !== undefined) {
      section.content = section.content.slice(0, position) + calloutHtml + section.content.slice(position);
    } else {
      section.content += calloutHtml;
    }
    section.updatedAt = timestamp();
    notifyListeners();
  }
}

export function applyQuickAdjust(sectionId: string, action: string, adjustedHtml: string): void {
  const section = resources.find(r => r.id === sectionId);
  if (section) {
    section.content = adjustedHtml;
    section.updatedAt = timestamp();
    notifyListeners();
  }
}

// Estimate lesson duration
export function estimateLessonDuration(lessonId: string): {
  totalSeconds: number;
  byType: Record<string, number>;
} {
  const lessonResources = resources.filter(r => r.lessonId === lessonId);
  const byType: Record<string, number> = {};
  let totalSeconds = 0;
  
  lessonResources.forEach(resource => {
    const duration = resource.durationSec || 0;
    totalSeconds += duration;
    byType[resource.type] = (byType[resource.type] || 0) + duration;
  });
  
  return { totalSeconds, byType };
}

// Get lesson status based on resources
export function getLessonStatus(lessonId: string): 'empty' | 'in_progress' | 'ready' {
  const lessonResources = resources.filter(r => r.lessonId === lessonId);
  if (lessonResources.length === 0) return 'empty';
  return 'in_progress'; // Future: could check for explicit ready flag
}

// Ensure course has at least one lesson (auto-create if needed)
export function ensureFirstLesson(courseId: string): Lesson {
  const courseLessons = lessons.filter(l => l.courseId === courseId);
  if (courseLessons.length === 0) {
    return createLesson({
      courseId,
      title: 'Lesson 1',
      order: 0,
      resourceIds: [],
    });
  }
  return courseLessons.sort((a, b) => a.order - b.order)[0];
}

// Quiz CRUD operations
export function getQuizzes(): Quiz[] {
  return quizzes;
}

export function getQuizByCourseId(courseId: string): Quiz | undefined {
  return quizzes.find(q => q.courseId === courseId);
}

export function getQuizzesByCourseId(courseId: string): Quiz[] {
  return quizzes.filter(q => q.courseId === courseId);
}

export function getQuizzesByLessonId(lessonId: string): Quiz[] {
  return quizzes.filter(q => q.lessonId === lessonId);
}

export function getQuizByLesson(courseId: string, lessonId: string): Quiz | undefined {
  // First try to find a quiz directly associated with the lesson
  const lessonQuiz = quizzes.find(q => q.lessonId === lessonId);
  if (lessonQuiz) return lessonQuiz;
  
  // If no lesson-specific quiz, check for course-level quiz
  const courseQuiz = quizzes.find(q => q.courseId === courseId && !q.lessonId);
  return courseQuiz;
}

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find(q => q.id === id);
}

export function createQuiz(data: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Quiz {
  const now = timestamp();
  const quiz: Quiz = {
    ...data,
    id: `qz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    questionIds: data.questionIds || [],
    createdAt: now,
    updatedAt: now,
  };
  quizzes.push(quiz);

  // Link quiz to course
  const course = courses.find(c => c.id === data.courseId);
  if (course) {
    course.quizId = quiz.id;
    course.updatedAt = timestamp();
  }

  notifyListeners();
  return quiz;
}

/**
 * Create an empty quiz for a course or lesson
 */
export function createEmptyQuizFor(courseId: string, lessonId?: string): Quiz {
  const now = timestamp();
  const quizId = `qz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const quiz: Quiz = {
    id: quizId,
    courseId,
    lessonId,
    title: lessonId ? "Lesson Quiz" : "Course Quiz",
    description: "",
    questions: [],
    config: {
      passingScore: 70,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    questionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  
  quizzes.push(quiz);
  
  // Link quiz to course if it's a course-level quiz
  if (!lessonId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      course.quizId = quiz.id;
      course.updatedAt = timestamp();
    }
  }
  
  notifyListeners();
  return quiz;
}

export function updateQuiz(id: string, updates: Partial<Omit<Quiz, "id" | "createdAt" | "updatedAt">>): void {
  const index = quizzes.findIndex(q => q.id === id);
  if (index !== -1) {
    quizzes[index] = { 
      ...quizzes[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

/**
 * Upsert a quiz (create if doesn't exist, update if exists)
 */
export function upsertQuiz(quiz: Quiz, cause?: string): void {
  const index = quizzes.findIndex(q => q.id === quiz.id);
  if (index !== -1) {
    quizzes[index] = {
      ...quiz,
      updatedAt: timestamp()
    };
  } else {
    quizzes.push({
      ...quiz,
      createdAt: quiz.createdAt || timestamp(),
      updatedAt: timestamp()
    });
    
    // Link quiz to course if it's a course-level quiz
    if (!quiz.lessonId) {
      const course = courses.find(c => c.id === quiz.courseId);
      if (course) {
        course.quizId = quiz.id;
        course.updatedAt = timestamp();
      }
    }
  }
  notifyListeners();
}

export function deleteQuiz(id: string): void {
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) return;

  // Remove questions
  questions = questions.filter(q => q.quizId !== id);

  // Remove quiz from course
  const course = courses.find(c => c.quizId === id);
  if (course) {
    course.quizId = undefined;
    course.updatedAt = timestamp();
  }

  // Remove quiz
  quizzes = quizzes.filter(q => q.id !== id);
  notifyListeners();
}

// Question CRUD operations
export function getQuestions(): Question[] {
  return questions;
}

export function getQuestionsByQuizId(quizId: string): Question[] {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz || !quiz.questionIds) return [];
  const questionIds = quiz.questionIds;
  return questions.filter(q => questionIds.includes(q.id));
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id);
}

export function createQuestion(data: Omit<Question, "id" | "createdAt" | "updatedAt">): Question {
  const now = timestamp();
  const question: Question = {
    ...data,
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  questions.push(question);

  // Add question to quiz's questionIds
  const quiz = quizzes.find(q => q.id === data.quizId);
  if (quiz && quiz.questionIds && !quiz.questionIds.includes(question.id)) {
    quiz.questionIds.push(question.id);
    quiz.updatedAt = timestamp();
  }

  notifyListeners();
  return question;
}

/**
 * Add a question to a quiz (wrapper for createQuestion)
 */
export function addQuestion(quizId: string, question: Question): void {
  // If question already has an id, update it; otherwise create it
  if (question.id) {
    const existing = questions.find(q => q.id === question.id);
    if (existing) {
      updateQuestion(question.id, question);
    } else {
      // Question exists but not in store, add it
      questions.push(question);
      
      // Add to quiz's questionIds if not already there
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz && quiz.questionIds && !quiz.questionIds.includes(question.id)) {
        quiz.questionIds.push(question.id);
        quiz.updatedAt = timestamp();
        
        // Also update quiz.questions array if it exists
        if (quiz.questions) {
          const qIndex = quiz.questions.findIndex(q => q.id === question.id);
          if (qIndex !== -1) {
            quiz.questions[qIndex] = question;
          } else {
            quiz.questions.push(question);
          }
        }
      }
      notifyListeners();
    }
  } else {
    // Create new question
    createQuestion({
      ...question,
      quizId
    });
  }
}

/**
 * Reorder questions in a quiz
 */
export function reorderQuestions(quizId: string, oldIndex: number, newIndex: number): void {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return;
  
  // Reorder questionIds array
  if (quiz.questionIds && quiz.questionIds.length > oldIndex && quiz.questionIds.length > newIndex) {
    const [moved] = quiz.questionIds.splice(oldIndex, 1);
    quiz.questionIds.splice(newIndex, 0, moved);
  }
  
  // Reorder questions array if it exists
  if (quiz.questions && quiz.questions.length > oldIndex && quiz.questions.length > newIndex) {
    const [moved] = quiz.questions.splice(oldIndex, 1);
    quiz.questions.splice(newIndex, 0, moved);
  }
  
  quiz.updatedAt = timestamp();
  notifyListeners();
}

export function updateQuestion(id: string, updates: Partial<Omit<Question, "id" | "createdAt" | "updatedAt">>): void;
export function updateQuestion(quizId: string, questionId: string, question: Question): void;
export function updateQuestion(idOrQuizId: string, updatesOrQuestionId: Partial<Omit<Question, "id" | "createdAt" | "updatedAt">> | string, question?: Question): void {
  // Handle 3-parameter version: updateQuestion(quizId, questionId, question)
  if (question !== undefined && typeof updatesOrQuestionId === 'string') {
    const questionId = updatesOrQuestionId;
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      questions[index] = {
        ...question,
        updatedAt: timestamp()
      };
      
      // Also update quiz.questions array if it exists
      const quiz = quizzes.find(q => q.id === idOrQuizId);
      if (quiz && quiz.questions) {
        const qIndex = quiz.questions.findIndex(q => q.id === questionId);
        if (qIndex !== -1) {
          quiz.questions[qIndex] = question;
          quiz.updatedAt = timestamp();
        }
      }
      
      notifyListeners();
    }
    return;
  }
  
  // Handle 2-parameter version: updateQuestion(id, updates)
  const id = idOrQuizId;
  const updates = updatesOrQuestionId as Partial<Omit<Question, "id" | "createdAt" | "updatedAt">>;
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { 
      ...questions[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export function deleteQuestion(id: string): void {
  const question = questions.find(q => q.id === id);
  if (!question) return;

  // Remove from quiz's questionIds
  const quiz = quizzes.find(q => q.id === question.quizId);
  if (quiz && quiz.questionIds) {
    quiz.questionIds = quiz.questionIds.filter(qid => qid !== id);
    quiz.updatedAt = timestamp();
  }

  // Remove question
  questions = questions.filter(q => q.id !== id);
  notifyListeners();
}

// Course Assignment operations
export function getAssignments(): CourseAssignment[] {
  return assignments;
}

export function getAssignmentsByCourseId(courseId: string): CourseAssignment[] {
  return assignments.filter(a => a.courseId === courseId);
}

export function createAssignment(data: Omit<CourseAssignment, "id" | "createdAt" | "updatedAt">): CourseAssignment {
  const now = timestamp();
  const assignment: CourseAssignment = {
    ...data,
    id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  assignments.push(assignment);
  notifyListeners();
  return assignment;
}

export function deleteAssignment(id: string): void {
  assignments = assignments.filter(a => a.id !== id);
  notifyListeners();
}

/**
 * Delete a course assignment (alias for deleteAssignment for clarity)
 */
export function deleteCourseAssignment(id: string): void {
  deleteAssignment(id);
}

/**
 * Create a course assignment (alias for createAssignment for clarity)
 */
export function createCourseAssignment(data: Omit<CourseAssignment, "id" | "createdAt" | "updatedAt">): CourseAssignment {
  return createAssignment(data);
}

/**
 * Update an existing course assignment
 */
export function updateCourseAssignment(id: string, data: Partial<Omit<CourseAssignment, "id" | "createdAt" | "updatedAt">>): void {
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    assignments[index] = {
      ...assignments[index],
      ...data,
      updatedAt: timestamp(),
    };
    notifyListeners();
  }
}

/**
 * Format assignment target summary for display
 */
export function formatAssignmentTargetSummary(target: CourseAssignment['target']): string {
  switch (target.type) {
    case "user":
      const userCount = target.userIds?.length || 0;
      return `${userCount} User${userCount !== 1 ? 's' : ''}`;
    case "role":
      const roles = target.roles?.join(', ') || '';
      let summary = roles;
      if (target.siteIds && target.siteIds.length > 0) {
        summary += ` (${target.siteIds.length} Site${target.siteIds.length !== 1 ? 's' : ''})`;
      }
      if (target.departmentIds && target.departmentIds.length > 0) {
        summary += ` (${target.departmentIds.length} Dept${target.departmentIds.length !== 1 ? 's' : ''})`;
      }
      return summary;
    case "site":
      const siteCount = target.siteIds?.length || 0;
      return `${siteCount} Site${siteCount !== 1 ? 's' : ''}`;
    case "department":
      const deptCount = target.departmentIds?.length || 0;
      return `${deptCount} Department${deptCount !== 1 ? 's' : ''}`;
    default:
      return 'Unknown';
  }
}

/**
 * Get assignment for a specific user and course
 * Returns the assignment if the user matches the assignment target
 */
export function getAssignmentForUserAndCourse(userId: string, courseId: string): CourseAssignment | undefined {
  const user = users.find(u => u.id === userId);
  if (!user) return undefined;

  return assignments.find(assignment => {
    if (assignment.courseId !== courseId) return false;

    const { target } = assignment;
    switch (target.type) {
      case "user":
        return target.userIds?.includes(userId) ?? false;
      case "role":
        const roleMatch = target.roles?.includes(user.role) ?? false;
        if (!roleMatch) return false;
        // Check site filter if specified
        if (target.siteIds && target.siteIds.length > 0) {
          if (!user.siteId || !target.siteIds.includes(user.siteId)) return false;
        }
        // Check department filter if specified
        if (target.departmentIds && target.departmentIds.length > 0) {
          if (!user.departmentId || !target.departmentIds.includes(user.departmentId)) return false;
        }
        return true;
      case "site":
        return user.siteId && (target.siteIds?.includes(user.siteId) ?? false);
      case "department":
        return user.departmentId && (target.departmentIds?.includes(user.departmentId) ?? false);
      default:
        return false;
    }
  });
}

/**
 * Get courses due soon for a user (within the specified number of days)
 * Returns an array of { course, assignment } objects
 */
export function getDueSoonForUser(userId: string, days: number): Array<{ course: Course; assignment: CourseAssignment }> {
  const now = new Date();
  const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const result: Array<{ course: Course; assignment: CourseAssignment }> = [];
  
  assignments.forEach(assignment => {
    if (!assignment.dueAt) return;
    
    const assignmentDate = new Date(assignment.dueAt);
    
    // Check if assignment is for this user and due within the specified days
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const { target } = assignment;
    let isAssigned = false;
    
    switch (target.type) {
      case "user":
        isAssigned = target.userIds?.includes(userId) ?? false;
        break;
      case "role":
        isAssigned = target.roles?.includes(user.role) ?? false;
        if (isAssigned) {
          // Check site filter if specified
          if (target.siteIds && target.siteIds.length > 0) {
            if (!user.siteId || !target.siteIds.includes(user.siteId)) isAssigned = false;
          }
          // Check department filter if specified
          if (target.departmentIds && target.departmentIds.length > 0) {
            if (!user.departmentId || !target.departmentIds.includes(user.departmentId)) isAssigned = false;
          }
        }
        break;
      case "site":
        isAssigned = !!(user.siteId && (target.siteIds?.includes(user.siteId) ?? false));
        break;
      case "department":
        isAssigned = !!(user.departmentId && (target.departmentIds?.includes(user.departmentId) ?? false));
        break;
    }
    
    if (!isAssigned) return;
    
    // Check if due date is in the future but within the specified days
    if (assignmentDate > now && assignmentDate <= dueDate) {
      const course = courses.find(c => c.id === assignment.courseId);
      if (course && course.status === 'published') {
        result.push({ course, assignment });
      }
    }
  });
  
  return result;
}

/**
 * Get overdue courses for a user
 * Returns an array of { course, assignment, daysOverdue } objects
 */
export function getOverdueForUser(userId: string): Array<{ course: Course; assignment: CourseAssignment; daysOverdue: number }> {
  const now = new Date();
  
  const result: Array<{ course: Course; assignment: CourseAssignment; daysOverdue: number }> = [];
  
  assignments.forEach(assignment => {
    if (!assignment.dueAt) return;
    
    const assignmentDate = new Date(assignment.dueAt);
    
    // Check if assignment is overdue
    if (assignmentDate < now) {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      const { target } = assignment;
      let isAssigned = false;
      
      switch (target.type) {
        case "user":
          isAssigned = target.userIds?.includes(userId) ?? false;
          break;
        case "role":
          isAssigned = target.roles?.includes(user.role) ?? false;
          if (isAssigned) {
            // Check site filter if specified
            if (target.siteIds && target.siteIds.length > 0) {
              if (!user.siteId || !target.siteIds.includes(user.siteId)) isAssigned = false;
            }
            // Check department filter if specified
            if (target.departmentIds && target.departmentIds.length > 0) {
              if (!user.departmentId || !target.departmentIds.includes(user.departmentId)) isAssigned = false;
            }
          }
          break;
        case "site":
          isAssigned = !!(user.siteId && (target.siteIds?.includes(user.siteId) ?? false));
          break;
        case "department":
          isAssigned = !!(user.departmentId && (target.departmentIds?.includes(user.departmentId) ?? false));
          break;
      }
      
      if (!isAssigned) return;
      
      const course = courses.find(c => c.id === assignment.courseId);
      if (course && course.status === 'published') {
        const daysOverdue = Math.floor((now.getTime() - assignmentDate.getTime()) / (24 * 60 * 60 * 1000));
        result.push({ course, assignment, daysOverdue });
      }
    }
  });
  
  return result;
}

// Get assigned courses for a user (resolves user/role/site/dept targeting)
export function getAssignedCoursesForUser(userId: string): Course[] {
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  const assignedCourseIds = new Set<string>();

  assignments.forEach(assignment => {
    const { target } = assignment;
    let isAssigned = false;

    switch (target.type) {
      case "user":
        isAssigned = target.userIds?.includes(userId) ?? false;
        break;
      case "role":
        isAssigned = target.roles?.includes(user.role) ?? false;
        if (isAssigned) {
          // Check site filter if specified
          if (target.siteIds && target.siteIds.length > 0) {
            if (!user.siteId || !target.siteIds.includes(user.siteId)) {
              isAssigned = false;
            }
          }
          // Check department filter if specified
          if (target.departmentIds && target.departmentIds.length > 0) {
            if (!user.departmentId || !target.departmentIds.includes(user.departmentId)) {
              isAssigned = false;
            }
          }
        }
        break;
      case "site":
        isAssigned = !!(user.siteId && (target.siteIds?.includes(user.siteId) ?? false));
        break;
      case "department":
        isAssigned = !!(user.departmentId && (target.departmentIds?.includes(user.departmentId) ?? false));
        break;
    }

    if (isAssigned) {
      assignedCourseIds.add(assignment.courseId);
    }
  });

  // Also check TrainingCompletions for courses assigned via training records
  completions.forEach(completion => {
    if (completion.userId === userId && completion.courseId) {
      const course = courses.find(c => c.id === completion.courseId && c.status === "published");
      if (course) {
        assignedCourseIds.add(course.id);
      }
    }
  });

  // Filter to only published courses
  return courses.filter(c => assignedCourseIds.has(c.id) && c.status === "published");
}

// Progress Course operations
export function getProgressCourses(): ProgressCourse[] {
  return progressCourses;
}

export function getProgressCoursesByUserId(userId: string): ProgressCourse[] {
  return progressCourses.filter(p => p.userId === userId);
}

export function getProgressCourseByCourseAndUser(courseId: string, userId: string): ProgressCourse | undefined {
  return progressCourses.find(p => p.courseId === courseId && p.userId === userId);
}

// Get or create progress course (lazy initialization)
export function getOrCreateProgressCourse(userId: string, courseId: string): ProgressCourse {
  let progress = getProgressCourseByCourseAndUser(courseId, userId);
  
  if (!progress) {
    const course = courses.find(c => c.id === courseId);
    const now = timestamp();
    progress = {
      id: `pc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      courseId,
      status: "not_started",
      lessonDoneCount: 0,
      lessonTotal: course?.lessonIds.length || 0,
      createdAt: now,
      updatedAt: now,
    };
    progressCourses.push(progress);
    notifyListeners();
  }
  
  return progress;
}

export function updateProgressCourse(id: string, updates: Partial<Omit<ProgressCourse, "id" | "createdAt" | "updatedAt">>): void {
  const index = progressCourses.findIndex(p => p.id === id);
  if (index !== -1) {
    progressCourses[index] = { 
      ...progressCourses[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export function deleteProgressCourse(id: string): void {
  progressCourses = progressCourses.filter(p => p.id !== id);
  notifyListeners();
}

// Recompute course progress from lesson progress
export function recomputeProgressCourse(userId: string, courseId: string): void {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  const progress = getOrCreateProgressCourse(userId, courseId);
  const lessonsProgress = progressLessons.filter(
    pl => course.lessonIds.includes(pl.lessonId) && pl.userId === userId
  );

  const completedCount = lessonsProgress.filter(pl => pl.status === "completed").length;
  const totalLessons = course.lessonIds.length;

  let status: "not_started" | "in_progress" | "completed" = "not_started";
  if (completedCount === totalLessons && totalLessons > 0) {
    status = "completed";
  } else if (completedCount > 0) {
    status = "in_progress";
  }

  updateProgressCourse(progress.id, {
    lessonDoneCount: completedCount,
    lessonTotal: totalLessons,
    status,
    completedAt: status === "completed" ? timestamp() : undefined,
  });
}

// Progress Lesson operations
export function getProgressLessons(): ProgressLesson[] {
  return progressLessons;
}

export function getProgressLessonsByUserId(userId: string): ProgressLesson[] {
  return progressLessons.filter(p => p.userId === userId);
}

export function getProgressLessonByLessonAndUser(lessonId: string, userId: string): ProgressLesson | undefined {
  return progressLessons.find(p => p.lessonId === lessonId && p.userId === userId);
}

// Create or update progress lesson (upsert pattern)
export function upsertProgressLesson(
  lessonId: string,
  userId: string,
  updates: Partial<Omit<ProgressLesson, "id" | "lessonId" | "userId" | "createdAt" | "updatedAt">>
): ProgressLesson {
  const existing = getProgressLessonByLessonAndUser(lessonId, userId);
  
  if (existing) {
    updateProgressLesson(existing.id, updates);
    return progressLessons.find(p => p.id === existing.id)!;
  } else {
    const now = timestamp();
    const progress: ProgressLesson = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      lessonId,
      userId,
      status: "not_started",
      ...updates,
      createdAt: now,
      updatedAt: now,
    };
    progressLessons.push(progress);
    notifyListeners();
    return progress;
  }
}

export function updateProgressLesson(id: string, updates: Partial<Omit<ProgressLesson, "id" | "createdAt" | "updatedAt">>): void {
  const index = progressLessons.findIndex(p => p.id === id);
  if (index !== -1) {
    progressLessons[index] = { 
      ...progressLessons[index], 
      ...updates,
      updatedAt: timestamp()
    };
    notifyListeners();
  }
}

export function deleteProgressLesson(id: string): void {
  progressLessons = progressLessons.filter(p => p.id !== id);
  notifyListeners();
}

// Phase II 1H.5: Resume pointer functions
/**
 * Get the resume pointer (lesson ID) for a specific course and user
 * Returns the most recent lesson that was started but not completed
 */
export function getResumePointerForCourse(userId: string, courseId: string): string | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  // Get all lesson progress for this user in this course
  const lessonProgress = progressLessons.filter(
    pl => pl.userId === userId && course.lessonIds.includes(pl.lessonId)
  );

  // Find the most recent lesson that was started but not completed
  const inProgressLessons = lessonProgress.filter(
    pl => (pl.status === "in_progress" || pl.startedAt) && !pl.completedAt
  );

  if (inProgressLessons.length === 0) {
    // Check if there's a first lesson that hasn't been started
    const firstLessonId = course.lessonIds[0];
    if (firstLessonId) {
      const firstLessonProgress = lessonProgress.find(pl => pl.lessonId === firstLessonId);
      if (!firstLessonProgress || firstLessonProgress.status === "not_started") {
        return firstLessonId; // Return first lesson if nothing started
      }
    }
    return null;
  }

  // Sort by updatedAt (most recent first) and return the first one
  inProgressLessons.sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  return inProgressLessons[0].lessonId;
}

// Helper functions for lesson player
/**
 * Check if a lesson is unlocked for a user
 */
export function isLessonUnlocked(course: Course, lessonId: string, userId: string): boolean {
  const courseLessons = getLessonsByCourseId(course.id);
  const lessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  
  if (lessonIndex === -1) return false;
  
  // First lesson is always unlocked
  if (lessonIndex === 0) return true;
  
  // If lockNextUntilPrevious is false, all lessons are unlocked
  if (course.policy?.lockNextUntilPrevious === false) {
    return true;
  }
  
  // Check if all previous lessons are completed
  for (let i = 0; i < lessonIndex; i++) {
    const prevLesson = courseLessons[i];
    const progress = getProgressLessonByLessonAndUser(prevLesson.id, userId);
    if (!progress || progress.status !== "completed") {
      return false;
    }
  }
  
  return true;
}

/**
 * Get progress lesson (convenience wrapper)
 */
export function getProgressLesson(userId: string, lessonId: string): ProgressLesson | undefined {
  return getProgressLessonByLessonAndUser(lessonId, userId);
}

/**
 * Get or create progress lesson
 */
export function getOrCreateProgressLesson(userId: string, lessonId: string): ProgressLesson {
  return upsertProgressLesson(lessonId, userId, {});
}

/**
 * Update lesson progress
 */
export function updateLessonProgress(lessonId: string, userId: string, updates: Partial<Omit<ProgressLesson, "id" | "lessonId" | "userId" | "createdAt" | "updatedAt">>): void {
  const existing = getProgressLessonByLessonAndUser(lessonId, userId);
  if (existing) {
    updateProgressLesson(existing.id, updates);
  } else {
    upsertProgressLesson(lessonId, userId, updates);
  }
}

/**
 * Phase II 1H.5: Bump lesson telemetry (time, video watch percentage, scroll depth)
 * Incrementally updates telemetry data for a lesson
 */
export function bumpLessonTelemetry(params: {
  courseId: string;
  lessonId: string;
  userId: string;
  timeDeltaSec?: number;
  watchPct?: number;
  videoPct?: number;
  scrollDepth?: number;
}): void {
  const { lessonId, userId, timeDeltaSec, watchPct, videoPct, scrollDepth } = params;
  
  // Get or create progress lesson
  const progress = getOrCreateProgressLesson(userId, lessonId);
  
  const updates: Partial<Omit<ProgressLesson, "id" | "lessonId" | "userId" | "createdAt" | "updatedAt">> = {};
  
  // Increment time spent
  if (timeDeltaSec !== undefined && timeDeltaSec > 0) {
    const currentTime = progress.timeSpentSec || 0;
    updates.timeSpentSec = currentTime + timeDeltaSec;
  }
  
  // Update video watch percentage (use videoPct if provided, otherwise watchPct)
  const watchPercentage = videoPct !== undefined ? videoPct * 100 : watchPct;
  if (watchPercentage !== undefined) {
    // Ensure it's in 0-100 range
    updates.watchPct = Math.max(0, Math.min(100, watchPercentage));
  }
  
  // Update scroll depth
  if (scrollDepth !== undefined) {
    // Ensure it's in 0-1 range
    updates.scrollDepth = Math.max(0, Math.min(1, scrollDepth));
  }
  
  // Only update if there are changes
  if (Object.keys(updates).length > 0) {
    updateLessonProgress(lessonId, userId, updates);
    
    // Check completion thresholds after updating telemetry
    const course = getCourseById(params.courseId);
    if (course) {
      const updatedProgress = getProgressLessonByLessonAndUser(lessonId, userId);
      if (updatedProgress && checkLessonCompletionThresholds(course, updatedProgress)) {
        // Auto-complete if thresholds are met and manual completion is not required
        if (!course.policy?.requiresManualCompletion && updatedProgress.status !== "completed") {
          completeLesson(params.courseId, lessonId, userId);
        }
      }
    }
  }
}

/**
 * Start lesson tracking (creates or updates progress)
 */
export function startLesson(courseId: string, lessonId: string, userId: string): ProgressLesson {
  const existing = getProgressLessonByLessonAndUser(lessonId, userId);
  
  if (existing) {
    // Update status to in_progress if not already started
    if (existing.status === "not_started" && !existing.startedAt) {
      updateProgressLesson(existing.id, {
        status: "in_progress",
        startedAt: timestamp(),
      });
    }
    return progressLessons.find(p => p.id === existing.id)!;
  } else {
    // Create new progress lesson
    return upsertProgressLesson(lessonId, userId, {
      status: "in_progress",
      startedAt: timestamp(),
    });
  }
}

/**
 * Get next lesson ID in course
 */
export function getNextLessonId(courseId: string, lessonId: string): string | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  
  const lessonIndex = course.lessonIds.indexOf(lessonId);
  if (lessonIndex === -1 || lessonIndex === course.lessonIds.length - 1) {
    return null;
  }
  
  return course.lessonIds[lessonIndex + 1];
}

/**
 * Get previous lesson ID in course
 */
export function getPrevLessonId(courseId: string, lessonId: string): string | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  
  const lessonIndex = course.lessonIds.indexOf(lessonId);
  if (lessonIndex <= 0) {
    return null;
  }
  
  return course.lessonIds[lessonIndex - 1];
}

/**
 * Get next unlocked lesson for a user
 */
export function getNextUnlockedLesson(courseId: string, userId: string, currentLessonId: string): string | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  
  const nextId = getNextLessonId(courseId, currentLessonId);
  if (!nextId) return null;
  
  if (isLessonUnlocked(course, nextId, userId)) {
    return nextId;
  }
  
  return null;
}

/**
 * Update resume pointer for a user in a course
 */
export function updateResumePointer(userId: string, courseId: string, lessonId: string): void {
  const progressCourse = getProgressCourseByCourseAndUser(courseId, userId);
  if (progressCourse) {
    updateProgressCourse(progressCourse.id, {
      lastLessonId: lessonId,
    });
  } else {
    // Create progress course if it doesn't exist
    getOrCreateProgressCourse(userId, courseId);
    const newProgressCourse = getProgressCourseByCourseAndUser(courseId, userId);
    if (newProgressCourse) {
      updateProgressCourse(newProgressCourse.id, {
        lastLessonId: lessonId,
      });
    }
  }
}

/**
 * Check if lesson completion thresholds are met
 */
export function checkLessonCompletionThresholds(course: Course, progress: ProgressLesson): boolean {
  const policy = course.policy;
  if (!policy) return true; // No policy means no thresholds
  
  // Check time spent threshold
  if (policy.minTimeOnLessonSec && (progress.timeSpentSec || 0) < policy.minTimeOnLessonSec) {
    return false;
  }
  
  // Check video watch percentage threshold
  if (policy.minVideoWatchPct && (progress.watchPct || 0) < policy.minVideoWatchPct) {
    return false;
  }
  
  // If requireQuizPassToCompleteLesson, check quiz pass requirement
  if (policy.requireQuizPassToCompleteLesson && progress.lastQuizAttemptId) {
    const attempt = quizAttempts.find(a => a.id === progress.lastQuizAttemptId);
    if (!attempt || !attempt.submittedAt) {
      // Quiz not submitted yet
      return false;
    }
    // Quiz pass status is checked in tryCompleteLesson
  }
  
  return true;
}

/**
 * Complete a lesson for a user
 */
export function completeLesson(courseId: string, lessonId: string, userId: string): void {
  const progress = getProgressLessonByLessonAndUser(lessonId, userId);
  const course = getCourseById(courseId);
  
  if (!course) {
    throw new Error(`Course ${courseId} not found`);
  }
  
  // Check if quiz pass is required
  if (course.policy?.requireQuizPassToCompleteLesson) {
    const quiz = quizzes.find(q => q.lessonId === lessonId);
    if (quiz) {
      const attempts = getAttemptsForQuiz(quiz.id, userId);
      const lastPassedAttempt = attempts.find(a => a.submittedAt && a.passed);
      if (!lastPassedAttempt) {
        throw new Error("Quiz must be passed to complete this lesson");
      }
    }
  }
  
  if (progress) {
    updateProgressLesson(progress.id, {
      status: "completed",
      completedAt: timestamp(),
    });
  } else {
    upsertProgressLesson(lessonId, userId, {
      status: "completed",
      completedAt: timestamp(),
    });
  }
  
  // Try to complete the course
  tryCompleteCourse({ courseId, userId });
  
  notifyListeners();
}

/**
 * Get the resume pointer (courseId and lessonId) for a user across all courses
 * Returns the most recent course/lesson combination the user was working on
 */
export function getResumePointer(userId: string): { courseId: string; lessonId: string } | null {
  // Get all assigned courses
  const assignedCourses = getAssignedCoursesForUser(userId);
  
  // Find the most recent in-progress lesson across all courses
  let mostRecent: { courseId: string; lessonId: string; updatedAt: string } | undefined = undefined;

  for (const course of assignedCourses) {
    const lessonId = getResumePointerForCourse(userId, course.id);
    if (lessonId) {
      const progress = getProgressLessonByLessonAndUser(lessonId, userId);
      if (progress && progress.updatedAt) {
        if (!mostRecent || new Date(progress.updatedAt) > new Date(mostRecent.updatedAt)) {
          mostRecent = {
            courseId: course.id,
            lessonId,
            updatedAt: progress.updatedAt,
          };
        }
      }
    }
  }

  if (!mostRecent) {
    return null;
  }

  return { courseId: mostRecent.courseId, lessonId: mostRecent.lessonId };
}

// Certificate operations
export function getCertificates(): Certificate[] {
  return certificates;
}

export function getCertificatesByUserId(userId: string): Certificate[] {
  return certificates.filter(c => c.userId === userId);
}

export function getCertificateById(id: string): Certificate | undefined {
  return certificates.find(c => c.id === id);
}

export function issueCertificate(
  userId: string,
  courseId: string,
  expiresAt?: string
): Certificate {
  const now = timestamp();
  const serial = `${courseId.toUpperCase()}-${Date.now()}-${userId.substring(0, 8).toUpperCase()}`;
  
  const certificate: Certificate = {
    id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    courseId,
    issuedAt: now,
    expiresAt,
    serial,
    createdAt: now,
    updatedAt: now,
  };
  
  certificates.push(certificate);
  notifyListeners();
  return certificate;
}

export function deleteCertificate(id: string): void {
  certificates = certificates.filter(c => c.id !== id);
  notifyListeners();
}

export function updateCertificatePdf(id: string, pdfUrl: string): void {
  const certificate = certificates.find(c => c.id === id);
  if (certificate) {
    certificate.pdfUrl = pdfUrl;
    certificate.updatedAt = timestamp();
    notifyListeners();
  }
}

// Certificate Template operations
export function getCertificateTemplates(): CertificateTemplate[] {
  return [...certificateTemplates];
}

export function getCertificateTemplateById(id: string): CertificateTemplate | undefined {
  return certificateTemplates.find(t => t.id === id);
}

export function getEffectiveCertificateTemplate(): CertificateTemplate | undefined {
  return certificateTemplates.find(t => t.isDefault) || certificateTemplates[0];
}

export function createCertificateTemplate(data: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">): CertificateTemplate {
  const now = timestamp();
  const template: CertificateTemplate = {
    ...data,
    id: `cert_tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  certificateTemplates.push(template);
  notifyListeners();
  return template;
}

export function updateCertificateTemplate(id: string, updates: Partial<Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">>): void {
  const template = certificateTemplates.find(t => t.id === id);
  if (template) {
    Object.assign(template, updates, { updatedAt: timestamp() });
    notifyListeners();
  }
}

export function setDefaultCertificateTemplate(templateId: string): void {
  // Remove default from all templates
  certificateTemplates.forEach(t => {
    if (t.isDefault) {
      t.isDefault = false;
    }
  });
  
  // Set the specified template as default
  const template = certificateTemplates.find(t => t.id === templateId);
  if (template) {
    template.isDefault = true;
    template.updatedAt = timestamp();
    notifyListeners();
  }
}

/**
 * Resolve all user IDs that are assigned to a course based on all assignments
 * Resolves user/role/site/dept targeting and returns unique user IDs
 */
export function resolveAssigneesForCourse(courseId: string): string[] {
  const userSet = new Set<string>();
  
  assignments.forEach(assignment => {
    if (assignment.courseId !== courseId) return;
    
    const { target } = assignment;
    
    switch (target.type) {
      case "user":
        target.userIds?.forEach(userId => userSet.add(userId));
        break;
      case "role":
        users.forEach(user => {
          if (target.roles?.includes(user.role)) {
            // Check site filter if specified
            if (target.siteIds && target.siteIds.length > 0) {
              if (!user.siteId || !target.siteIds.includes(user.siteId)) return;
            }
            // Check department filter if specified
            if (target.departmentIds && target.departmentIds.length > 0) {
              if (!user.departmentId || !target.departmentIds.includes(user.departmentId)) return;
            }
            userSet.add(user.id);
          }
        });
        break;
      case "site":
        users.forEach(user => {
          if (user.siteId && target.siteIds?.includes(user.siteId)) {
            userSet.add(user.id);
          }
        });
        break;
      case "department":
        users.forEach(user => {
          if (user.departmentId && target.departmentIds?.includes(user.departmentId)) {
            userSet.add(user.id);
          }
        });
        break;
    }
  });
  
  return Array.from(userSet);
}

// Placeholder functions for AI course metadata/styling (stubs for now)
export function collectCourseHtml(courseId: string): string {
  // TODO: Implement course HTML collection
  return "";
}

export function applyCourseMetadata(courseId: string, metadata: CourseMetadata): void {
  // TODO: Implement course metadata application
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.metadata = metadata;
    course.updatedAt = timestamp();
    notifyListeners();
  }
}

export function applyBulkStyleFixes(courseId: string, issues: StyleAuditIssue[]): { fixesApplied: number; sectionsChanged: number } {
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    return { fixesApplied: 0, sectionsChanged: 0 };
  }

  // Note: Bulk style fixes require additional context (e.g., specific text to replace)
  // that is not available in the StyleAuditIssue interface. 
  // For now, this function acknowledges the issues but doesn't apply automatic fixes.
  // Manual fixes should be applied using applyInlineStyleFix instead.
  
  return { fixesApplied: 0, sectionsChanged: 0 };
}

// ===================================================================
// Epic 1G: AI Course Generation Functions
// ===================================================================

/**
 * Creates a complete course structure from an AI-generated draft
 * Includes: Course, Lessons, Text Resources, Quiz with Questions
 */
export function createCourseFromAIDraft(
  draft: import("@/types").AICourseDraft, 
  ownerUserId: string
): string {
  const now = timestamp();
  const courseId = `crs_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // 1. Create course with AI metadata
  const course: Course = {
    id: courseId,
    title: draft.title,
    description: draft.description,
    status: "draft",
    category: draft.tags[0] || "Training",
    tags: draft.tags,
    standards: [],
    estimatedMinutes: draft.estimatedMinutes,
    ownerUserId,
    lessonIds: [],
    policy: {
      progression: "linear",
      requireAllLessons: true,
      requirePassingQuiz: true,
      enableRetakes: true,
      lockNextUntilPrevious: false,
      showExplanations: true,
      minVideoWatchPct: 80,
      maxQuizAttempts: 3,
    },
    ai: { source: "AI", origin: "prompt" },
    createdAt: now,
    updatedAt: now,
  };
  courses.push(course);
  
  // 2. Create lessons with text sections
  draft.lessons.forEach((lessonData, idx) => {
    const lessonId = `lsn_ai_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`;
    const lesson: Lesson = {
      id: lessonId,
      courseId,
      title: lessonData.title,
      order: idx,
      resourceIds: [],
      createdAt: now,
      updatedAt: now,
    };
    lessons.push(lesson);
    course.lessonIds.push(lessonId);
    
    // Create text sections for this lesson
    lessonData.sections.forEach((section, sIdx) => {
      const resourceId = `res_ai_${Date.now()}_${idx}_${sIdx}_${Math.random().toString(36).substring(2, 9)}`;
      const resource: Resource = {
        id: resourceId,
        courseId,
        lessonId,
        type: "text",
        title: `Section ${sIdx + 1}`,
        content: section.content,
        order: sIdx,
        createdAt: now,
        updatedAt: now,
      };
      resources.push(resource);
      lesson.resourceIds.push(resourceId);
    });
  });
  
  // 3. Create quiz with questions if provided
  if (draft.quiz && draft.quiz.questions.length > 0) {
    const quizId = `qz_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const quiz: Quiz = {
      id: quizId,
      courseId,
      title: "Course Quiz",
      questions: [],
      config: {
        passingScore: 70,
        maxAttempts: 3,
        shuffleQuestions: false,
        shuffleOptions: false,
        showRationales: true,
      },
      passingScorePct: 70,
      maxAttempts: 3,
      questionIds: [],
      createdAt: now,
      updatedAt: now,
    };
    quizzes.push(quiz);
    course.quizId = quizId;
    
    draft.quiz.questions.forEach((q, idx) => {
      const questionId = `q_ai_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`;
      const question: Question = {
        id: questionId,
        quizId,
        type: "mcq",
        prompt: q.question,
        options: q.options.map((label, i) => ({
          id: `opt_${i}`,
          text: label,
          correct: i === q.correctIndex,
        })),
        explanation: q.rationale,
        createdAt: now,
        updatedAt: now,
      };
      questions.push(question);
      quiz.questionIds?.push(questionId);
    });
  }
  
  // 4. Create changelog entry (using TrainingCompletion entity type for compatibility)
  // Note: In a full implementation, ChangeLog might be extended to support Course entities
  // For now, we'll skip the changelog for AI course creation to avoid type mismatches
  
  // 5. Epic 1G.4: Add audit and version snapshot
  const aiAction: AiAction = draft.aiMeta.origin === 'prompt' ? 'ai_generate_course' : 'ai_generate_from_file';
  const snapshot = addVersionSnapshot({
    entityType: 'course',
    entityId: courseId,
    createdBy: ownerUserId,
    cause: 'ai',
    aiAction,
    summary: `AI generated course: "${draft.title}"`,
    payload: getEntitySnapshot('course', courseId),
  });
  
  pushUndo('course', courseId, snapshot.id);
  clearRedo('course', courseId);
  
  addAuditEvent({
    byUserId: ownerUserId,
    entityType: 'course',
    entityId: courseId,
    action: aiAction,
    meta: {
      origin: draft.aiMeta.origin,
      prompt: draft.previewInsights?.source.prompt,
      filename: draft.previewInsights?.source.filename,
      lessonCount: draft.lessons.length,
      hasQuiz: !!draft.quiz,
    },
  });
  
  notifyListeners();
  return courseId;
}

/**
 * Checks if a course is an AI-generated draft
 */
export function isAIDraftCourse(courseId: string): boolean {
  const course = getCourseById(courseId);
  return course?.status === "draft" && course?.ai?.source === "AI";
}

// ===================================================================
// Epic 1G.4: Versioning & Audit Functions
// ===================================================================

/**
 * Add an audit event to the log
 */
export function addAuditEvent(ev: Omit<AuditEvent, 'id' | 'at'>): AuditEvent {
  const event: AuditEvent = {
    ...ev,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    at: new Date().toISOString(),
  };
  auditEvents.push(event);
  notifyListeners();
  return event;
}

/**
 * Add a version snapshot
 */
export function addVersionSnapshot(
  snap: Omit<VersionSnapshot, 'id' | 'createdAt'>
): VersionSnapshot {
  const snapshot: VersionSnapshot = {
    ...snap,
    id: `vsn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  versionSnapshots.push(snapshot);
  notifyListeners();
  return snapshot;
}

/**
 * Get a deep clone snapshot of an entity
 */
export function getEntitySnapshot(
  entityType: VersionedEntityType,
  id: string
): any {
  let entity;
  switch (entityType) {
    case 'course':
      entity = getCourseById(id);
      break;
    case 'lesson':
      entity = getLessonById(id);
      break;
    case 'section':
      entity = getResourceById(id);
      break;
  }
  
  if (!entity) return null;
  
  // Deep clone using structuredClone or JSON fallback
  try {
    return structuredClone(entity);
  } catch {
    return JSON.parse(JSON.stringify(entity));
  }
}

/**
 * Restore an entity to a previous version snapshot
 */
export function restoreVersion(snapshotId: string): {
  entityType: VersionedEntityType;
  entityId: string;
} | null {
  const snapshot = versionSnapshots.find(s => s.id === snapshotId);
  if (!snapshot) return null;

  // Capture pre-restore state for redo
  const currentState = getEntitySnapshot(snapshot.entityType, snapshot.entityId);
  if (currentState) {
    const redoSnapshot = addVersionSnapshot({
      entityType: snapshot.entityType,
      entityId: snapshot.entityId,
      parentCourseId: snapshot.parentCourseId,
      createdBy: getCurrentUser().id,
      cause: 'manual',
      summary: `Before restore to: ${snapshot.summary}`,
      payload: currentState,
    });
    pushRedo(snapshot.entityType, snapshot.entityId, redoSnapshot.id);
  }

  // Restore the entity
  switch (snapshot.entityType) {
    case 'course':
      const courseIndex = courses.findIndex(c => c.id === snapshot.entityId);
      if (courseIndex !== -1) {
        courses[courseIndex] = snapshot.payload;
      }
      break;
    case 'lesson':
      const lessonIndex = lessons.findIndex(l => l.id === snapshot.entityId);
      if (lessonIndex !== -1) {
        lessons[lessonIndex] = snapshot.payload;
      }
      break;
    case 'section':
      const resourceIndex = resources.findIndex(r => r.id === snapshot.entityId);
      if (resourceIndex !== -1) {
        resources[resourceIndex] = snapshot.payload;
      }
      break;
  }

  // Log audit event
  addAuditEvent({
    byUserId: getCurrentUser().id,
    entityType: snapshot.entityType,
    entityId: snapshot.entityId,
    parentCourseId: snapshot.parentCourseId,
    action: 'undo',
    meta: { snapshotId, summary: snapshot.summary },
  });

  notifyListeners();
  return { entityType: snapshot.entityType, entityId: snapshot.entityId };
}

/**
 * List history for an entity
 */
export function listHistory(
  entityType: VersionedEntityType,
  entityId: string,
  limit = 50
): { snapshots: VersionSnapshot[]; audits: AuditEvent[] } {
  const snapshots = versionSnapshots
    .filter(s => s.entityType === entityType && s.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  const audits = auditEvents
    .filter(e => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);

  return { snapshots, audits };
}

// Undo/Redo Stack Management

function stackKey(t: VersionedEntityType, id: string): string {
  return `${t}:${id}`;
}

export function pushUndo(t: VersionedEntityType, id: string, snapshotId: string) {
  const key = stackKey(t, id);
  if (!undoStack[key]) undoStack[key] = [];
  undoStack[key].push(snapshotId);
}

export function popUndo(t: VersionedEntityType, id: string): string | undefined {
  const key = stackKey(t, id);
  return undoStack[key]?.pop();
}

export function pushRedo(t: VersionedEntityType, id: string, snapshotId: string) {
  const key = stackKey(t, id);
  if (!redoStack[key]) redoStack[key] = [];
  redoStack[key].push(snapshotId);
}

export function popRedo(t: VersionedEntityType, id: string): string | undefined {
  const key = stackKey(t, id);
  return redoStack[key]?.pop();
}

export function clearRedo(t: VersionedEntityType, id: string) {
  const key = stackKey(t, id);
  if (redoStack[key]) redoStack[key] = [];
}

export function canUndo(t: VersionedEntityType, id: string): boolean {
  const key = stackKey(t, id);
  return (undoStack[key]?.length || 0) > 0;
}

export function canRedo(t: VersionedEntityType, id: string): boolean {
  const key = stackKey(t, id);
  return (redoStack[key]?.length || 0) > 0;
}

export function getLastUndoSummary(t: VersionedEntityType, id: string): string | null {
  const key = stackKey(t, id);
  const lastId = undoStack[key]?.[undoStack[key].length - 1];
  if (!lastId) return null;
  const snapshot = versionSnapshots.find(s => s.id === lastId);
  return snapshot?.summary || null;
}

export function getLastRedoSummary(t: VersionedEntityType, id: string): string | null {
  const key = stackKey(t, id);
  const lastId = redoStack[key]?.[redoStack[key].length - 1];
  if (!lastId) return null;
  const snapshot = versionSnapshots.find(s => s.id === lastId);
  return snapshot?.summary || null;
}

/**
 * Perform undo operation
 */
export function performUndo(entityType: VersionedEntityType, entityId: string): boolean {
  const snapshotId = popUndo(entityType, entityId);
  if (!snapshotId) return false;
  
  const result = restoreVersion(snapshotId);
  return result !== null;
}

/**
 * Perform redo operation
 */
export function performRedo(entityType: VersionedEntityType, entityId: string): boolean {
  const snapshotId = popRedo(entityType, entityId);
  if (!snapshotId) return false;
  
  const result = restoreVersion(snapshotId);
  if (result) {
    // Log as redo instead of undo
    const lastAudit = auditEvents[auditEvents.length - 1];
    if (lastAudit) {
      lastAudit.action = 'redo';
    }
  }
  return result !== null;
}

// Phase II 1I.1: Quiz Attempt Functions (moved here for Phase II 1I.3 integration)

/**
 * Get quiz policy with defaults
 */
export function getQuizPolicy(quiz: Quiz): QuizPolicy {
  if (quiz.policy) {
    return quiz.policy;
  }
  
  // Fallback to legacy config
  const config = quiz.config || {};
  // Handle maxAttempts: 0 means unlimited, undefined also means unlimited
  // Only set maxAttempts if it's explicitly a positive number
  const maxAttempts = config.maxAttempts !== undefined && config.maxAttempts > 0
    ? config.maxAttempts
    : (quiz.maxAttempts !== undefined && quiz.maxAttempts > 0 ? quiz.maxAttempts : undefined);
  
  return {
    passingScorePct: config.passingScore ?? quiz.passingScorePct ?? 80,
    maxAttempts,
    showFeedback: 'end', // Default value, not available in legacy QuizConfig
    shuffleQuestions: config.shuffleQuestions ?? false,
    shuffleOptions: config.shuffleOptions ?? false,
    lockOnPass: false, // Default value, not available in legacy QuizConfig
  };
}

/**
 * Start a quiz attempt (create or resume)
 */
export function startQuizAttempt(params: {
  quizId: string;
  courseId: string;
  lessonId: string;
  userId: string;
}): QuizAttempt {
  // Check for existing in-progress attempt
  const existingAttempt = quizAttempts.find(
    a => a.quizId === params.quizId &&
         a.userId === params.userId &&
         !a.submittedAt
  );
  
  if (existingAttempt) {
    return existingAttempt; // Resume existing attempt
  }
  
  // Create new attempt
  const attempt: QuizAttempt = {
    id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    quizId: params.quizId,
    courseId: params.courseId,
    lessonId: params.lessonId,
    userId: params.userId,
    startedAt: timestamp(),
    answers: [],
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };
  
  quizAttempts.push(attempt);
  notifyListeners();
  return attempt;
}

/**
 * Grade a quiz and return results
 */
export function gradeQuiz(
  quizId: string,
  answers: Array<{ questionId: string; value: string | string[] }>
): { scorePct: number; passed: boolean; details: Array<{ questionId: string; correct: boolean; pointsAwarded: number; pointsPossible: number }> } {
  const quiz = getQuizById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }
  
  const { gradeQuestion } = require('./quiz');
  let totalPointsAwarded = 0;
  let totalPointsPossible = 0;
  const details: Array<{ questionId: string; correct: boolean; pointsAwarded: number; pointsPossible: number }> = [];
  
  quiz.questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    const result = gradeQuestion(question, answer?.value);
    const pointsPossible = question.points ?? 1;
    
    totalPointsAwarded += result.pointsAwarded;
    totalPointsPossible += pointsPossible;
    
    details.push({
      questionId: question.id,
      correct: result.correct,
      pointsAwarded: result.pointsAwarded,
      pointsPossible,
    });
  });
  
  const scorePct = totalPointsPossible > 0 
    ? Math.round((totalPointsAwarded / totalPointsPossible) * 100)
    : 0;
  
  const policy = getQuizPolicy(quiz);
  const passed = scorePct >= policy.passingScorePct;
  
  return { scorePct, passed, details };
}

/**
 * Submit a quiz attempt and calculate score
 * Phase II 1I.3: Updated to check mastery and create remediation bundles
 */
export function submitQuizAttempt(
  attemptId: string,
  answers: Array<{ questionId: string; value: string | string[] }>
): QuizAttempt {
  const attempt = quizAttempts.find(a => a.id === attemptId);
  if (!attempt || attempt.submittedAt) {
    throw new Error('Attempt not found or already submitted');
  }

  const quiz = getQuizById(attempt.quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Grade the quiz
  const gradingResult = gradeQuiz(attempt.quizId, answers);

  // Update attempt with answers and results
  attempt.submittedAt = timestamp();
  attempt.answers = answers;
  attempt.scorePct = gradingResult.scorePct;
  attempt.passed = gradingResult.passed;
  attempt.updatedAt = timestamp();

  // Update progress lesson with quiz attempt tracking
  const progress = getProgressLessonByLessonAndUser(attempt.lessonId, attempt.userId);
  if (progress) {
    updateProgressLesson(progress.id, {
      lastQuizAttemptId: attempt.id,
    });
    if (gradingResult.passed) {
      updateProgressLesson(progress.id, {
        lastPassedQuizAttemptId: attempt.id,
      });
    }
  }

  // Check if quiz pass should complete lesson
  const course = courses.find(c => c.id === attempt.courseId);
  if (course?.policy?.requireQuizPassToCompleteLesson && gradingResult.passed) {
    markLessonCompleteByQuizPass({
      courseId: attempt.courseId,
      lessonId: attempt.lessonId,
      userId: attempt.userId,
      quizAttemptId: attempt.id,
    });

    // Try to complete course
    tryCompleteCourse({ courseId: attempt.courseId, userId: attempt.userId });
  }

  // Log change
  const { logChange } = require('./changeLog');
  logChange(
    attempt.id,
    `Quiz ${gradingResult.passed ? 'passed' : 'failed'} with ${gradingResult.scorePct}%`,
    {
      action: gradingResult.passed ? 'quiz_passed' : 'quiz_failed',
      scorePct: gradingResult.scorePct,
      passed: gradingResult.passed,
      attemptId: attempt.id,
    },
    'QuizAttempt'
  );

  notifyListeners();
  return attempt;
}

/**
 * Get attempts for a specific quiz by user
 */
export function getAttemptsForQuiz(quizId: string, userId: string): QuizAttempt[] {
  return quizAttempts.filter(
    a => a.quizId === quizId && a.userId === userId && a.submittedAt
  );
}

/**
 * Get active (in-progress) attempt for a quiz
 */
export function getActiveAttempt(userId: string, quizId: string): QuizAttempt | undefined {
  return quizAttempts.find(
    a => a.quizId === quizId && a.userId === userId && !a.submittedAt
  );
}

/**
 * Get last passed attempt for a quiz
 */
export function getLastPassedAttempt(quizId: string, userId: string): QuizAttempt | undefined {
  const attempts = getAttemptsForQuiz(quizId, userId);
  const passedAttempts = attempts.filter(a => a.passed);
  if (passedAttempts.length === 0) return undefined;
  
  return passedAttempts.sort((a, b) => 
    new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  )[0];
}

/**
 * Check if user can start a new attempt
 */
export function canStartAttempt(
  quizId: string,
  userId: string,
  policy: QuizPolicy
): { canStart: boolean; attemptsUsed: number; attemptsRemaining: number | null; reason?: string } {
  const attempts = getAttemptsForQuiz(quizId, userId);
  const attemptsUsed = attempts.length;
  
  // Check max attempts
  if (policy.maxAttempts !== undefined && attemptsUsed >= policy.maxAttempts) {
    return {
      canStart: false,
      attemptsUsed,
      attemptsRemaining: 0,
      reason: 'Maximum attempts reached',
    };
  }
  
  // Check lock on pass
  if (policy.lockOnPass) {
    const lastPassed = getLastPassedAttempt(quizId, userId);
    if (lastPassed) {
      return {
        canStart: false,
        attemptsUsed,
        attemptsRemaining: policy.maxAttempts ? policy.maxAttempts - attemptsUsed : null,
        reason: 'Quiz locked after passing',
      };
    }
  }
  
  return {
    canStart: true,
    attemptsUsed,
    attemptsRemaining: policy.maxAttempts ? policy.maxAttempts - attemptsUsed : null,
  };
}

/**
 * Get all quiz attempts (for admin)
 */
export function getAllQuizAttempts(): QuizAttempt[] {
  return [...quizAttempts];
}

/**
 * Alias for startQuizAttempt for backward compatibility
 */
export function createQuizAttempt(params: {
  quizId: string;
  courseId: string;
  lessonId: string;
  userId: string;
}): QuizAttempt {
  return startQuizAttempt(params);
}

/**
 * Save an answer for a quiz attempt
 */
export function saveQuizAnswer(attemptId: string, questionId: string, value: string | string[]): void {
  const attempt = quizAttempts.find(a => a.id === attemptId);
  if (!attempt) return;
  
  // Update or add answer
  const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
  if (existingAnswerIndex >= 0) {
    attempt.answers[existingAnswerIndex].value = value;
  } else {
    attempt.answers.push({ questionId, value });
  }
  
  attempt.updatedAt = timestamp();
  notifyListeners();
}

/**
 * Check if user can start a new quiz attempt
 */
export function canStartNewAttempt(userId: string, quizId: string): boolean {
  const quiz = getQuizById(quizId);
  if (!quiz) return false;
  
  const policy = getQuizPolicy(quiz);
  const result = canStartAttempt(quizId, userId, policy);
  return result.canStart;
}

/**
 * Mark a lesson as complete when user passes a quiz
 */
export function markLessonCompleteByQuizPass(params: {
  courseId: string;
  lessonId: string;
  userId: string;
  quizAttemptId: string;
}): void {
  completeLesson(params.courseId, params.lessonId, params.userId);
}

/**
 * Try to complete a course if all lessons are done
 */
export function tryCompleteCourse(params: { courseId: string; userId: string }): void {
  const { courseId, userId } = params;
  
  // Get all lessons for the course
  const courseLessons = lessons.filter(l => l.courseId === courseId);
  if (courseLessons.length === 0) return;
  
  // Check if all lessons are complete
  const allLessonsComplete = courseLessons.every(lesson => {
    const lessonProgress = progressLessons.find(
      p => p.lessonId === lesson.id && p.userId === userId
    );
    return lessonProgress?.status === 'completed';
  });
  
  if (allLessonsComplete) {
    // Mark course as complete
    const courseProgress = progressCourses.find(
      p => p.courseId === courseId && p.userId === userId
    );
    
    if (courseProgress && courseProgress.status !== 'completed') {
      courseProgress.status = 'completed';
      courseProgress.completedAt = timestamp();
      courseProgress.updatedAt = timestamp();
      notifyListeners();
    }
  }
}

// ============================================================================
// Phase II — 1M.1: Skills Tagging Functions
// ============================================================================

/**
 * Get all skills
 */
export function getSkills(): Skill[] {
  return [...skills];
}

/**
 * Get skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

/**
 * Create a new skill
 */
export function createSkill(name: string, category?: string): Skill {
  const now = timestamp();
  const skill: Skill = {
    id: `skl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim(),
    category: category?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  skills.push(skill);
  notifyListeners();
  return skill;
}

/**
 * Update a skill
 */
export function updateSkill(id: string, updates: Partial<Omit<Skill, "id" | "createdAt" | "updatedAt">>): void {
  const skill = skills.find(s => s.id === id);
  if (!skill) return;
  
  Object.assign(skill, updates);
  skill.updatedAt = timestamp();
  notifyListeners();
}

/**
 * Delete a skill (checks if used in courses)
 */
export function deleteSkill(id: string): void {
  // Check if skill is assigned to any course
  const isUsed = courses.some(c => c.skills?.includes(id));
  if (isUsed) {
    throw new Error("Cannot delete skill: it is assigned to one or more courses");
  }
  
  skills = skills.filter(s => s.id !== id);
  notifyListeners();
}

/**
 * Assign skills to a course
 */
export function assignSkillsToCourse(courseId: string, skillIds: string[]): void {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  
  course.skills = [...skillIds];
  course.updatedAt = timestamp();
  notifyListeners();
}

/**
 * Get skills for a course
 */
export function getSkillsByCourseId(courseId: string): Skill[] {
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.skills || course.skills.length === 0) return [];
  
  return course.skills
    .map(skillId => skills.find(s => s.id === skillId))
    .filter((skill): skill is Skill => skill !== undefined);
}

/**
 * Get earned skills by user (from completed courses)
 */
export function getEarnedSkillsByUser(userId: string): Array<{ skill: Skill; courses: Course[] }> {
  // Get all completed courses for user from ProgressCourse
  const completedProgress = progressCourses.filter(p => p.userId === userId && p.status === "completed");
  const completedCourseIds = new Set(completedProgress.map(p => p.courseId));
  
  // Also check certificates
  const certificatesForUser = certificates.filter(c => c.userId === userId);
  certificatesForUser.forEach(cert => completedCourseIds.add(cert.courseId));
  
  // Phase II — 1M.1: Also check TrainingCompletions with COMPLETED status and courseId
  const completedTrainings = completions.filter(
    c => c.userId === userId && 
    c.status === "COMPLETED" && 
    c.courseId !== undefined
  );
  completedTrainings.forEach(completion => {
    if (completion.courseId) {
      completedCourseIds.add(completion.courseId);
    }
  });
  
  // Get all skills from completed courses
  const skillToCoursesMap = new Map<string, Course[]>();
  
  completedCourseIds.forEach(courseId => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.skills) return;
    
    course.skills.forEach(skillId => {
      if (!skillToCoursesMap.has(skillId)) {
        skillToCoursesMap.set(skillId, []);
      }
      skillToCoursesMap.get(skillId)!.push(course);
    });
  });
  
  // Convert to array format
  return Array.from(skillToCoursesMap.entries())
    .map(([skillId, courses]) => {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return null;
      return { skill, courses };
    })
    .filter((item): item is { skill: Skill; courses: Course[] } => item !== null)
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name));
}

/**
 * Get courses that teach a skill
 */
export function getCoursesBySkill(skillId: string): Course[] {
  return courses.filter(c => c.skills?.includes(skillId));
}

// Phase II 1I.3: Adaptive Learning Loop functionality removed (reverted)

// ============================================================================
// Phase II — 1N.3: Library API
// ============================================================================

export interface LibraryFilters {
  type?: "file" | "link";
  fileType?: "pdf" | "ppt" | "pptx" | "doc" | "docx" | "image" | "video" | "other";
  source?: "upload" | "loom" | "teams" | "youtube" | "vimeo" | "sharepoint" | "drive" | "other";
  tags?: string[];
  categories?: string[];
  siteId?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  includeArchived?: boolean;
}

/**
 * Get Library items with optional filtering
 */
export function getLibraryItems(filters?: LibraryFilters): LibraryItem[] {
  let items = [...libraryItems];
  const currentUser = getCurrentUser();
  
  // Permission filtering: Managers only see items in their scope or unscoped items
  if (currentUser.role === "MANAGER") {
    items = items.filter(item => {
      // Unscoped items (no siteId/departmentId) are visible to all managers
      if (!item.siteId && !item.departmentId) return true;
      
      // Manager's site matches
      if (currentUser.siteId && item.siteId === currentUser.siteId) {
        // If item has departmentId, manager must match that department
        if (item.departmentId) {
          return currentUser.departmentId === item.departmentId;
        }
        // Item is site-scoped only, manager can see it
        return true;
      }
      
      return false;
    });
  }
  
  // Apply filters
  if (filters) {
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }
    
    if (filters.fileType) {
      items = items.filter(item => item.fileType === filters.fileType);
    }
    
    if (filters.source) {
      items = items.filter(item => item.source === filters.source);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }
    
    if (filters.categories && filters.categories.length > 0) {
      items = items.filter(item => 
        filters.categories!.some(cat => item.categories.includes(cat))
      );
    }
    
    if (filters.siteId) {
      items = items.filter(item => item.siteId === filters.siteId);
    }
    
    if (filters.departmentId) {
      items = items.filter(item => item.departmentId === filters.departmentId);
    }
    
    if (filters.dateFrom) {
      items = items.filter(item => item.createdAt >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      items = items.filter(item => item.createdAt <= filters.dateTo!);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (!filters.includeArchived) {
      items = items.filter(item => !item.archivedAt);
    }
  } else {
    // Default: exclude archived
    items = items.filter(item => !item.archivedAt);
  }
  
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Get Library item by ID
 */
export function getLibraryItemById(id: string): LibraryItem | undefined {
  return libraryItems.find(item => item.id === id);
}

/**
 * Create a new Library item
 */
export function createLibraryItem(
  data: Omit<LibraryItem, "id" | "createdAt" | "updatedAt" | "version">
): LibraryItem {
  const now = timestamp();
  const currentUser = getCurrentUser();
  
  const item: LibraryItem = {
    ...data,
    id: `lib_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdByUserId: currentUser.id,
    createdAt: now,
    updatedAt: now,
    version: 1,
    tags: data.tags || [],
    categories: data.categories || [],
  };
  
  libraryItems.push(item);
  notifyListeners();
  return item;
}

/**
 * Update Library item metadata
 */
export function updateLibraryItem(
  id: string,
  updates: Partial<Omit<LibraryItem, "id" | "createdAt" | "updatedAt" | "version" | "parentId">>
): void {
  const item = libraryItems.find(i => i.id === id);
  if (!item) return;
  
  const currentUser = getCurrentUser();
  
  // Permission check: Manager can only update items in their scope
  if (currentUser.role === "MANAGER") {
    if (item.siteId && item.siteId !== currentUser.siteId) {
      throw new Error("Cannot update item outside your scope");
    }
    if (item.departmentId && item.departmentId !== currentUser.departmentId) {
      throw new Error("Cannot update item outside your scope");
    }
  }
  
  Object.assign(item, updates, { updatedAt: timestamp() });
  notifyListeners();
}

/**
 * Archive Library item (soft delete)
 */
export function archiveLibraryItem(id: string): void {
  const item = libraryItems.find(i => i.id === id);
  if (!item) return;
  
  const currentUser = getCurrentUser();
  
  // Permission check: Manager can only archive items in their scope
  if (currentUser.role === "MANAGER") {
    if (item.siteId && item.siteId !== currentUser.siteId) {
      throw new Error("Cannot archive item outside your scope");
    }
    if (item.departmentId && item.departmentId !== currentUser.departmentId) {
      throw new Error("Cannot archive item outside your scope");
    }
  }
  
  item.archivedAt = timestamp();
  item.updatedAt = timestamp();
  notifyListeners();
}

/**
 * Delete Library item (hard delete - Admin only)
 */
export function deleteLibraryItem(id: string): void {
  const currentUser = getCurrentUser();
  
  if (currentUser.role !== "ADMIN") {
    throw new Error("Only admins can delete library items");
  }
  
  const index = libraryItems.findIndex(i => i.id === id);
  if (index > -1) {
    libraryItems.splice(index, 1);
    notifyListeners();
  }
}

/**
 * Create a new version of a Library item
 */
export function createNewVersion(
  parentId: string,
  updates: Partial<Omit<LibraryItem, "id" | "createdAt" | "updatedAt" | "version" | "parentId">>
): LibraryItem {
  const parent = libraryItems.find(i => i.id === parentId);
  if (!parent) {
    throw new Error(`Parent item ${parentId} not found`);
  }
  
  const currentUser = getCurrentUser();
  const now = timestamp();
  
  // Permission check: Manager can only version items in their scope
  if (currentUser.role === "MANAGER") {
    if (parent.siteId && parent.siteId !== currentUser.siteId) {
      throw new Error("Cannot create version of item outside your scope");
    }
    if (parent.departmentId && parent.departmentId !== currentUser.departmentId) {
      throw new Error("Cannot create version of item outside your scope");
    }
  }
  
  const newVersion: LibraryItem = {
    ...parent,
    ...updates,
    id: `lib_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    version: parent.version + 1,
    parentId: parent.id,
    createdAt: now,
    updatedAt: now,
    archivedAt: undefined,
  };
  
  libraryItems.push(newVersion);
  notifyListeners();
  return newVersion;
}

/**
 * Bulk create Library items (for bulk upload)
 */
export function bulkCreateLibraryItems(
  items: Array<Omit<LibraryItem, "id" | "createdAt" | "updatedAt" | "version">>
): LibraryItem[] {
  const now = timestamp();
  const currentUser = getCurrentUser();
  const created: LibraryItem[] = [];
  
  items.forEach(data => {
    const item: LibraryItem = {
      ...data,
      id: `lib_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdByUserId: currentUser.id,
      createdAt: now,
      updatedAt: now,
      version: 1,
      tags: data.tags || [],
      categories: data.categories || [],
    };
    
    libraryItems.push(item);
    created.push(item);
  });
  
  notifyListeners();
  return created;
}

/**
 * Compute checksum for duplicate detection
 * Simple hash: filename (lowercase) + '_' + fileSize
 */
export function computeChecksum(filename: string, fileSize: number): string {
  return `${filename.toLowerCase()}_${fileSize}`;
}

/**
 * Check if newer version exists for a Library item
 */
export function getNewerVersion(libraryItemId: string): LibraryItem | null {
  const item = libraryItems.find(i => i.id === libraryItemId);
  if (!item) return null;
  
  // Find all versions (items with this item's ID as parentId)
  const versions = libraryItems.filter(i => i.parentId === libraryItemId);
  if (versions.length === 0) return null;
  
  // Return the highest version
  return versions.sort((a, b) => b.version - a.version)[0];
}

/**
 * Get all versions of a Library item (including parent)
 */
export function getLibraryItemVersions(libraryItemId: string): LibraryItem[] {
  const item = libraryItems.find(i => i.id === libraryItemId);
  if (!item) return [];
  
  // Find parent if this is a version
  let rootId = libraryItemId;
  if (item.parentId) {
    rootId = item.parentId;
  }
  
  // Get all items that are either the root or have root as parent
  const versions = libraryItems.filter(i => 
    i.id === rootId || i.parentId === rootId
  );
  
  return versions.sort((a, b) => a.version - b.version);
}
