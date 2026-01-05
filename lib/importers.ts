// Historic Data Import Utility
// Parses CSV format: User Email, Training Name, Completion Date, Expiry Date
// Creates TrainingCompletion records with status: "COMPLETED"

import { User, Training, TrainingCompletion } from "@/types";

export interface HistoricCSVRow {
  userEmail: string;
  trainingName: string;
  completionDate: string;
  expiryDate: string;
}

export interface ImportError {
  row: number;
  email: string;
  trainingName: string;
  error: string;
}

export interface ImportPreviewRow {
  row: number;
  email: string;
  trainingName: string;
  completionDate: string;
  expiryDate: string;
  status: "valid" | "error";
  error?: string;
  userId?: string;
  trainingId?: string;
}

export interface ImportResult {
  created: number;
  errors: ImportError[];
}

/**
 * Parse CSV text into row objects
 * Expected columns: User Email, Training Name, Completion Date, Expiry Date
 */
export function parseHistoricCSV(csvData: string): HistoricCSVRow[] {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header row - normalize column names
  const rawHeaders = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  
  // Map various header formats to our expected format
  const headerMap: Record<string, keyof HistoricCSVRow> = {
    "user email": "userEmail",
    "useremail": "userEmail",
    "email": "userEmail",
    "training name": "trainingName",
    "trainingname": "trainingName",
    "training": "trainingName",
    "completion date": "completionDate",
    "completiondate": "completionDate",
    "completed": "completionDate",
    "completedat": "completionDate",
    "expiry date": "expiryDate",
    "expirydate": "expiryDate",
    "expires": "expiryDate",
    "expiresat": "expiryDate",
  };

  const normalizedHeaders = rawHeaders.map(h => {
    const normalized = h.toLowerCase().replace(/[_-]/g, " ");
    return headerMap[normalized] || normalized;
  });

  const rows: HistoricCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle CSV values that may contain commas within quotes
    const values = parseCSVLine(lines[i]);
    const row: Partial<HistoricCSVRow> = {};

    normalizedHeaders.forEach((header, index) => {
      if (header === "userEmail" || header === "trainingName" || 
          header === "completionDate" || header === "expiryDate") {
        row[header] = values[index]?.trim().replace(/^"|"$/g, "") || "";
      }
    });

    // Only add rows that have at least an email
    if (row.userEmail) {
      rows.push({
        userEmail: row.userEmail || "",
        trainingName: row.trainingName || "",
        completionDate: row.completionDate || "",
        expiryDate: row.expiryDate || "",
      });
    }
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

/**
 * Validate and preview the import - returns preview rows with validation status
 */
export function validateHistoricImport(
  rows: HistoricCSVRow[],
  users: User[],
  trainings: Training[]
): ImportPreviewRow[] {
  const previews: ImportPreviewRow[] = [];

  rows.forEach((row, index) => {
    const preview: ImportPreviewRow = {
      row: index + 2, // +2 for 1-indexed and header row
      email: row.userEmail,
      trainingName: row.trainingName,
      completionDate: row.completionDate,
      expiryDate: row.expiryDate,
      status: "valid",
    };

    // Find user by email (case-insensitive)
    const user = users.find(
      u => u.email.toLowerCase() === row.userEmail.toLowerCase()
    );
    
    if (!user) {
      preview.status = "error";
      preview.error = `User not found: ${row.userEmail}`;
      previews.push(preview);
      return;
    }
    preview.userId = user.id;

    // Find training by title (case-insensitive)
    const training = trainings.find(
      t => t.title.toLowerCase() === row.trainingName.toLowerCase()
    );
    
    if (!training) {
      preview.status = "error";
      preview.error = `Training not found: ${row.trainingName}`;
      previews.push(preview);
      return;
    }
    preview.trainingId = training.id;

    // Validate completion date
    if (!row.completionDate) {
      preview.status = "error";
      preview.error = "Missing completion date";
      previews.push(preview);
      return;
    }

    if (!isValidDate(row.completionDate)) {
      preview.status = "error";
      preview.error = "Invalid completion date format (use YYYY-MM-DD)";
      previews.push(preview);
      return;
    }

    // Validate expiry date (optional but must be valid if provided)
    if (row.expiryDate && !isValidDate(row.expiryDate)) {
      preview.status = "error";
      preview.error = "Invalid expiry date format (use YYYY-MM-DD)";
      previews.push(preview);
      return;
    }

    previews.push(preview);
  });

  return previews;
}

/**
 * Import historic completions from validated preview rows
 * Returns the completions to be created (caller handles actual store creation)
 */
export function createHistoricCompletions(
  validRows: ImportPreviewRow[]
): TrainingCompletion[] {
  const completions: TrainingCompletion[] = [];

  validRows
    .filter(row => row.status === "valid" && row.userId && row.trainingId)
    .forEach((row, index) => {
      const completion: TrainingCompletion = {
        id: `cmp_hist_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
        trainingId: row.trainingId!,
        userId: row.userId!,
        status: "COMPLETED",
        dueAt: row.completionDate, // Set due date to completion date for historic records
        completedAt: row.completionDate,
        expiresAt: row.expiryDate || undefined,
      };

      completions.push(completion);
    });

  return completions;
}

/**
 * Main import function - parses CSV and validates, returns preview
 */
export function importHistoricCompletions(
  csvData: string,
  users: User[],
  trainings: Training[]
): { previews: ImportPreviewRow[]; validCount: number; errorCount: number } {
  const rows = parseHistoricCSV(csvData);
  const previews = validateHistoricImport(rows, users, trainings);
  
  const validCount = previews.filter(p => p.status === "valid").length;
  const errorCount = previews.filter(p => p.status === "error").length;

  return { previews, validCount, errorCount };
}

/**
 * Generate a CSV template for historic imports
 */
export function generateHistoricCSVTemplate(): string {
  return `User Email,Training Name,Completion Date,Expiry Date
alex.rivera@upkeepdemo.co,Forklift Certification,2024-06-15,2026-06-15
marcus.johnson@upkeepdemo.co,OSHA Safety Training,2024-08-01,2025-08-01`;
}


