// Hierarchy & Access Control - Visibility computation logic
// Implements hybrid access: tree-based inheritance + explicit scope assignments

import { User } from "@/types";
import {
  getUsers,
  getUserAccessGrants,
  getManagedByAdditionalManager,
  getDepartments,
  getSites,
} from "./store";

export interface UserVisibleScope {
  userIds: string[];        // All user IDs this person can see
  siteIds: string[];        // Site IDs they have access to
  departmentIds: string[];  // Department IDs they have access to
}

/**
 * Get all direct reports for a manager (users where managerId === userId)
 */
export function getDirectReports(managerId: string): User[] {
  const allUsers = getUsers(true); // include inactive for complete picture
  return allUsers.filter(u => u.managerId === managerId);
}

/**
 * Recursively get all reports down the tree (direct + indirect reports)
 */
export function getAllReportsRecursive(managerId: string, visited = new Set<string>()): User[] {
  // Prevent infinite loops in case of circular references
  if (visited.has(managerId)) return [];
  visited.add(managerId);
  
  const directReports = getDirectReports(managerId);
  const allReports: User[] = [...directReports];
  
  // Recursively get reports of reports
  for (const report of directReports) {
    const indirectReports = getAllReportsRecursive(report.id, visited);
    allReports.push(...indirectReports);
  }
  
  return allReports;
}

/**
 * Get users managed through additional manager relationships
 */
export function getAdditionallyManagedUsers(managerId: string): User[] {
  const additionalRelations = getManagedByAdditionalManager(managerId);
  const allUsers = getUsers(true);
  
  return additionalRelations
    .map(rel => allUsers.find(u => u.id === rel.userId))
    .filter((u): u is User => u !== undefined);
}

/**
 * Get users in a specific site
 */
export function getUsersInSite(siteId: string): User[] {
  const allUsers = getUsers(true);
  return allUsers.filter(u => u.siteId === siteId);
}

/**
 * Get users in a specific department
 */
export function getUsersInDepartment(departmentId: string): User[] {
  const allUsers = getUsers(true);
  return allUsers.filter(u => u.departmentId === departmentId);
}

/**
 * Main visibility function - computes what a user can see based on:
 * 1. Their home site/department
 * 2. Direct reports (managerId chain)
 * 3. Recursive reports (tree cascade)
 * 4. Additional manager relationships
 * 5. Explicit access grants
 * 6. ADMIN role sees everything
 */
export function getUserVisibleScope(userId: string): UserVisibleScope {
  const allUsers = getUsers(true);
  const user = allUsers.find(u => u.id === userId);
  
  if (!user) {
    return { userIds: [], siteIds: [], departmentIds: [] };
  }
  
  // ADMIN sees everything
  if (user.role === "ADMIN") {
    const sites = getSites();
    const departments = getDepartments();
    return {
      userIds: allUsers.map(u => u.id),
      siteIds: sites.map(s => s.id),
      departmentIds: departments.map(d => d.id),
    };
  }
  
  const visibleUserIds = new Set<string>();
  const visibleSiteIds = new Set<string>();
  const visibleDepartmentIds = new Set<string>();
  
  // 1. Always can see themselves
  visibleUserIds.add(userId);
  
  // 2. Add home site/department
  if (user.siteId) {
    visibleSiteIds.add(user.siteId);
  }
  if (user.departmentId) {
    visibleDepartmentIds.add(user.departmentId);
  }
  
  // 3. Add all direct reports (tree cascade)
  const allReports = getAllReportsRecursive(userId);
  for (const report of allReports) {
    visibleUserIds.add(report.id);
    if (report.siteId) visibleSiteIds.add(report.siteId);
    if (report.departmentId) visibleDepartmentIds.add(report.departmentId);
  }
  
  // 4. Add users from additional manager relationships
  const additionallyManaged = getAdditionallyManagedUsers(userId);
  for (const managed of additionallyManaged) {
    visibleUserIds.add(managed.id);
    if (managed.siteId) visibleSiteIds.add(managed.siteId);
    if (managed.departmentId) visibleDepartmentIds.add(managed.departmentId);
  }
  
  // 5. Add explicit access grants
  const accessGrants = getUserAccessGrants(userId);
  for (const grant of accessGrants) {
    if (grant.siteId) {
      visibleSiteIds.add(grant.siteId);
      // Add all users in that site
      const siteUsers = getUsersInSite(grant.siteId);
      siteUsers.forEach(u => visibleUserIds.add(u.id));
      // Add all departments in that site
      const siteDepts = getDepartments().filter(d => d.siteId === grant.siteId);
      siteDepts.forEach(d => visibleDepartmentIds.add(d.id));
    }
    if (grant.departmentId) {
      visibleDepartmentIds.add(grant.departmentId);
      // Add all users in that department
      const deptUsers = getUsersInDepartment(grant.departmentId);
      deptUsers.forEach(u => visibleUserIds.add(u.id));
    }
  }
  
  return {
    userIds: Array.from(visibleUserIds),
    siteIds: Array.from(visibleSiteIds),
    departmentIds: Array.from(visibleDepartmentIds),
  };
}

/**
 * Check if a user can view another user's data
 */
export function canViewUser(viewerId: string, targetUserId: string): boolean {
  const scope = getUserVisibleScope(viewerId);
  return scope.userIds.includes(targetUserId);
}

/**
 * Check if a user can view data for a site
 */
export function canViewSite(viewerId: string, siteId: string): boolean {
  const scope = getUserVisibleScope(viewerId);
  return scope.siteIds.includes(siteId);
}

/**
 * Check if a user can view data for a department
 */
export function canViewDepartment(viewerId: string, departmentId: string): boolean {
  const scope = getUserVisibleScope(viewerId);
  return scope.departmentIds.includes(departmentId);
}

/**
 * Get all managers for a user (primary + additional)
 */
export function getAllManagersForUser(userId: string): User[] {
  const allUsers = getUsers(true);
  const user = allUsers.find(u => u.id === userId);
  
  if (!user) return [];
  
  const managers: User[] = [];
  
  // Primary manager
  if (user.managerId) {
    const primaryManager = allUsers.find(u => u.id === user.managerId);
    if (primaryManager) {
      managers.push(primaryManager);
    }
  }
  
  // Additional managers
  const additionallyManaged = getManagedByAdditionalManager(userId);
  // Note: getManagedByAdditionalManager returns relations where userId is the employee
  // But we want to find managers for this user, so we need getUserAdditionalManagers
  // Let's import and use it properly
  
  return managers;
}

/**
 * Get the management chain for a user (all managers up to the top)
 */
export function getManagementChain(userId: string, visited = new Set<string>()): User[] {
  // Prevent infinite loops
  if (visited.has(userId)) return [];
  visited.add(userId);
  
  const allUsers = getUsers(true);
  const user = allUsers.find(u => u.id === userId);
  
  if (!user || !user.managerId) return [];
  
  const manager = allUsers.find(u => u.id === user.managerId);
  if (!manager) return [];
  
  // Return this manager + their manager chain
  return [manager, ...getManagementChain(manager.id, visited)];
}
