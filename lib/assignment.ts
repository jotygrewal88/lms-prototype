// Phase I Epic 2: Assignment matching logic
"use client";

import { User, Training, TrainingAssignment } from "@/types";

export function matchesAssignment(user: User, assignment: TrainingAssignment): boolean {
  // Check role match
  if (assignment.roles && assignment.roles.length > 0) {
    if (!assignment.roles.includes(user.role)) {
      return false;
    }
  }

  // Check site match
  if (assignment.sites && assignment.sites.length > 0) {
    if (!user.siteId || !assignment.sites.includes(user.siteId)) {
      return false;
    }
  }

  // Check department match
  if (assignment.departments && assignment.departments.length > 0) {
    if (!user.departmentId || !assignment.departments.includes(user.departmentId)) {
      return false;
    }
  }

  // Check specific user match
  if (assignment.users && assignment.users.length > 0) {
    if (!assignment.users.includes(user.id)) {
      return false;
    }
  }

  // If no criteria specified, no one is assigned
  const hasCriteria = 
    (assignment.roles && assignment.roles.length > 0) ||
    (assignment.sites && assignment.sites.length > 0) ||
    (assignment.departments && assignment.departments.length > 0) ||
    (assignment.users && assignment.users.length > 0);

  return Boolean(hasCriteria);
}

export function getUsersForTraining(training: Training, allUsers: User[]): User[] {
  return allUsers.filter(user => matchesAssignment(user, training.assignment));
}

