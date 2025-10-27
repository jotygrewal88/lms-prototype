// Phase I Epic 2: Utility functions for dates and calculations

// Fixed "today" for deterministic demos - December 15, 2024
export const DEMO_TODAY = "2024-12-15T00:00:00.000Z";

export function today(): string {
  return DEMO_TODAY;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function daysDiff(date1Str: string, date2Str: string): number {
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function isOverdue(dueAt: string, currentStatus: string): boolean {
  if (currentStatus === "COMPLETED") return false;
  const todayDate = new Date(today());
  const dueDate = new Date(dueAt);
  return todayDate > dueDate;
}

export function calculateOverdueDays(dueAt: string): number {
  const todayDate = new Date(today());
  const dueDate = new Date(dueAt);
  if (todayDate <= dueDate) return 0;
  return daysDiff(dueAt, today());
}

