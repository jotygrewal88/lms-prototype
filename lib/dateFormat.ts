// Phase I Polish Pack: Date formatting with organization settings
import { OrgSettings } from "@/types";

export function formatDateWithOrgSettings(
  isoDate: string,
  settings: OrgSettings
): string {
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) {
    return isoDate; // Return original if invalid
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (settings.dateFormat) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
    default:
      return `${year}-${month}-${day}`;
  }
}

export function parseDateString(dateStr: string): Date | null {
  // Try to parse various formats
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(dateStr);
  }

  const mdyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mdyMatch) {
    return new Date(`${mdyMatch[3]}-${mdyMatch[1]}-${mdyMatch[2]}`);
  }

  const dmyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) {
    return new Date(`${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`);
  }

  return null;
}

