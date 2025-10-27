// Phase I Epic 1 & 2: In-memory global state store
"use client";

import { Organization, User, Site, Department, Training, TrainingCompletion } from "@/types";
import { 
  organization as seedOrg, 
  users as seedUsers, 
  sites as seedSites, 
  departments as seedDepartments,
  trainings as seedTrainings,
  completions as seedCompletions
} from "@/data/seed";

// In-memory state
let currentUser: User = seedUsers[0]; // Default to Admin
let organization: Organization = { ...seedOrg };
const users: User[] = [...seedUsers];
const sites: Site[] = [...seedSites];
const departments: Department[] = [...seedDepartments];
let trainings: Training[] = [...seedTrainings];
let completions: TrainingCompletion[] = [...seedCompletions];

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

export function getUsers(): User[] {
  return users;
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

