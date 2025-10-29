// Phase I Epic 1, 2 & 3: In-memory global state store
// Phase II Epic 1: Extended with Course Library
"use client";

import { Organization, User, Site, Department, Training, TrainingCompletion, ReminderRule, EscalationLog, Notification, ChangeLog, AuditSnapshot, NotificationTemplate, Scope, Course, Lesson, Resource, Section, Quiz, Question, CourseAssignment, ProgressCourse, ProgressLesson, Certificate } from "@/types";
import { 
  organization as seedOrg, 
  users as seedUsers, 
  sites as seedSites, 
  departments as seedDepartments,
  trainings as seedTrainings,
  completions as seedCompletions,
  reminderRules as seedReminderRules,
  notificationTemplates as seedNotificationTemplates
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
let progressCourses: ProgressCourse[] = [...seedProgressCourses];
let progressLessons: ProgressLesson[] = [...seedProgressLessons];
let certificates: Certificate[] = [...seedCertificates];

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
  if (!quiz) return [];
  return questions.filter(q => quiz.questionIds.includes(q.id));
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
  if (quiz && !quiz.questionIds.includes(question.id)) {
    quiz.questionIds.push(question.id);
    quiz.updatedAt = timestamp();
  }

  notifyListeners();
  return question;
}

export function updateQuestion(id: string, updates: Partial<Omit<Question, "id" | "createdAt" | "updatedAt">>): void {
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
  if (quiz) {
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
        isAssigned = target.userId === userId;
        break;
      case "role":
        isAssigned = user.role === target.role;
        break;
      case "site":
        isAssigned = user.siteId === target.siteId;
        break;
      case "dept":
        isAssigned = user.departmentId === target.deptId;
        break;
    }

    if (isAssigned) {
      assignedCourseIds.add(assignment.courseId);
    }
  });

  return courses.filter(c => assignedCourseIds.has(c.id));
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

