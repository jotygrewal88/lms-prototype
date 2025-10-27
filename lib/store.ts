// Phase I Epic 1, 2 & 3: In-memory global state store
"use client";

import { Organization, User, Site, Department, Training, TrainingCompletion, ReminderRule, EscalationLog, Notification, ChangeLog, AuditSnapshot, NotificationTemplate, Scope } from "@/types";
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

