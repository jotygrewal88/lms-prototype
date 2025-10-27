// Phase I Epic 1 & 2: Core type definitions for UpKeep LMS

export type Role = "ADMIN" | "MANAGER" | "LEARNER";

export interface Organization {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  siteId?: string;
  departmentId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export type CompletionStatus = "ASSIGNED" | "COMPLETED" | "OVERDUE";

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
}

