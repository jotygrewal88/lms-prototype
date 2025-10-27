// Phase I Polish Pack: CSV Import logic
import { User, Training, TrainingCompletion, CompletionStatus } from "@/types";
import { today, addDays, calculateOverdueDays } from "@/lib/utils";

export interface CSVRow {
  employeeEmail: string;
  trainingTitle: string;
  status: string;
  dueAt: string;
  completedAt?: string;
  notes?: string;
  proofUrl?: string;
}

export interface ImportPreview {
  row: number;
  email: string;
  training: string;
  status: string;
  action: "create" | "update" | "error";
  error?: string;
  data?: Partial<TrainingCompletion>;
}

export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row as CSVRow);
  }

  return rows;
}

export function validateAndPreviewImport(
  csvRows: CSVRow[],
  currentUser: User,
  users: User[],
  trainings: Training[],
  existingCompletions: TrainingCompletion[]
): ImportPreview[] {
  const previews: ImportPreview[] = [];

  csvRows.forEach((row, index) => {
    const preview: ImportPreview = {
      row: index + 2, // +2 because row 1 is header, and we're 0-indexed
      email: row.employeeEmail,
      training: row.trainingTitle,
      status: row.status,
      action: "error",
    };

    // Find user by email
    const user = users.find(u => u.email === row.employeeEmail);
    if (!user) {
      preview.error = "User not found";
      previews.push(preview);
      return;
    }

    // Find training by title (case-sensitive exact match)
    const training = trainings.find(t => t.title === row.trainingTitle);
    if (!training) {
      preview.error = "Training not found";
      previews.push(preview);
      return;
    }

    // Check manager scope
    if (currentUser.role === "MANAGER") {
      if (user.siteId !== currentUser.siteId) {
        preview.error = "User outside your scope";
        previews.push(preview);
        return;
      }
    }

    // Normalize status (case-insensitive)
    const normalizedStatus = row.status.toUpperCase();
    if (!["ASSIGNED", "COMPLETED", "OVERDUE", "EXEMPT"].includes(normalizedStatus)) {
      preview.error = `Invalid status: ${row.status}`;
      previews.push(preview);
      return;
    }

    // Validate date format (YYYY-MM-DD)
    if (!row.dueAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
      preview.error = "Invalid due date format (use YYYY-MM-DD)";
      previews.push(preview);
      return;
    }

    // Check if completion already exists (upsert key: email + training)
    const existingCompletion = existingCompletions.find(
      c => c.userId === user.id && c.trainingId === training.id
    );

    let finalStatus = normalizedStatus as CompletionStatus;
    let completedAt = row.completedAt;

    // Normalization rules
    if (completedAt && finalStatus !== "COMPLETED") {
      finalStatus = "COMPLETED"; // Coerce to COMPLETED if completedAt provided
    }

    if (finalStatus === "COMPLETED" && !completedAt) {
      completedAt = today(); // Set to today if missing
    }

    // Calculate overdue days if OVERDUE
    let overdueDays = 0;
    if (finalStatus === "OVERDUE") {
      overdueDays = calculateOverdueDays(row.dueAt);
    }

    // Calculate expiresAt if COMPLETED and training has retrainIntervalDays
    let expiresAt: string | undefined;
    if (finalStatus === "COMPLETED" && training.retrainIntervalDays && completedAt) {
      expiresAt = addDays(completedAt, training.retrainIntervalDays);
    }

    preview.action = existingCompletion ? "update" : "create";
    preview.data = {
      id: existingCompletion?.id || `cmp_import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      trainingId: training.id,
      userId: user.id,
      status: finalStatus,
      dueAt: row.dueAt,
      completedAt: completedAt || undefined,
      expiresAt,
      overdueDays: overdueDays > 0 ? overdueDays : undefined,
      notes: row.notes || undefined,
      proofUrl: row.proofUrl || undefined,
    };

    // Check if EXEMPT requires reason (will be enforced during apply)
    if (finalStatus === "EXEMPT" && !row.notes) {
      preview.error = "EXEMPT status requires notes (reason)";
      preview.action = "error";
    }

    previews.push(preview);
  });

  return previews;
}

export function generateCSVTemplate(): string {
  return `employeeEmail,trainingTitle,status,dueAt,completedAt,notes,proofUrl
alex@upkeep.demo,OSHA Safety Training,ASSIGNED,2025-12-31,,,
maria@upkeep.demo,Forklift Certification,COMPLETED,2025-11-30,2025-11-28,Passed with 95%,https://example.com/proof.pdf`;
}

