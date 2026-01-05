// Bulk User Import: CSV parsing, validation, and template generation
import { User, Role, Site, Department } from "@/types";

export interface UserCSVRow {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  siteName: string;
  departmentName: string;
  managerEmail: string;
  active: string;
}

export interface UserImportPreview {
  row: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  siteName: string;
  departmentName: string;
  managerEmail: string;
  action: "create" | "update" | "error";
  errors: string[];
  data?: Omit<User, "id"> & { id?: string };
}

/**
 * Parse CSV text into typed rows
 */
export function parseUserCSV(csvText: string): UserCSVRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: UserCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted values with commas inside
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ""));

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row as UserCSVRow);
  }

  return rows;
}

/**
 * Validate CSV rows and generate preview with actions and errors
 */
export function validateAndPreviewUserImport(
  csvRows: UserCSVRow[],
  existingUsers: User[],
  sites: Site[],
  departments: Department[]
): UserImportPreview[] {
  const previews: UserImportPreview[] = [];
  const emailsInBatch = new Map<string, number>(); // Track emails within the batch

  csvRows.forEach((row, index) => {
    const rowNum = index + 2; // +2 because row 1 is header, and we're 0-indexed
    const errors: string[] = [];

    const preview: UserImportPreview = {
      row: rowNum,
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      email: row.email || "",
      role: row.role || "",
      siteName: row.siteName || "",
      departmentName: row.departmentName || "",
      managerEmail: row.managerEmail || "",
      action: "create",
      errors: [],
    };

    // Required field validation
    if (!row.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!row.lastName?.trim()) {
      errors.push("Last name is required");
    }
    if (!row.email?.trim()) {
      errors.push("Email is required");
    }
    if (!row.role?.trim()) {
      errors.push("Role is required");
    }

    // Email format validation
    const email = row.email?.trim().toLowerCase();
    if (email && !email.includes("@")) {
      errors.push("Invalid email format");
    }

    // Check for duplicate email within the same batch
    if (email) {
      const existingRowNum = emailsInBatch.get(email);
      if (existingRowNum) {
        errors.push(`Duplicate email in batch (same as row ${existingRowNum})`);
      } else {
        emailsInBatch.set(email, rowNum);
      }
    }

    // Role validation
    const normalizedRole = row.role?.trim().toUpperCase();
    if (normalizedRole && !["ADMIN", "MANAGER", "LEARNER"].includes(normalizedRole)) {
      errors.push("Invalid role (use ADMIN, MANAGER, or LEARNER)");
    }

    // Check if user already exists (for update vs create)
    const existingUser = email
      ? existingUsers.find((u) => u.email.toLowerCase() === email)
      : undefined;

    if (existingUser) {
      preview.action = "update";
    }

    // Site resolution
    let siteId: string | undefined;
    if (row.siteName?.trim()) {
      const site = sites.find(
        (s) => s.name.toLowerCase() === row.siteName.trim().toLowerCase()
      );
      if (!site) {
        errors.push(`Site not found: ${row.siteName}`);
      } else {
        siteId = site.id;
      }
    }

    // Manager role requires site
    if (normalizedRole === "MANAGER" && !row.siteName?.trim()) {
      errors.push("Site is required for Manager role");
    }

    // Department resolution
    let departmentId: string | undefined;
    if (row.departmentName?.trim()) {
      const dept = departments.find(
        (d) =>
          d.name.toLowerCase() === row.departmentName.trim().toLowerCase() &&
          (!siteId || d.siteId === siteId)
      );
      if (!dept) {
        errors.push(`Department not found: ${row.departmentName}`);
      } else {
        departmentId = dept.id;
      }
    }

    // Manager resolution for learners
    let managerId: string | undefined;
    if (normalizedRole === "LEARNER") {
      if (!row.managerEmail?.trim()) {
        errors.push("Manager is required for Learner role");
      } else {
        const manager = existingUsers.find(
          (u) =>
            u.email.toLowerCase() === row.managerEmail.trim().toLowerCase() &&
            u.role === "MANAGER"
        );
        if (!manager) {
          errors.push(`Manager not found: ${row.managerEmail}`);
        } else {
          managerId = manager.id;
        }
      }
    }

    // Parse active status (defaults to true)
    const activeStr = row.active?.trim().toLowerCase();
    const active = activeStr === "false" || activeStr === "0" ? false : true;

    // Set errors and action
    preview.errors = errors;
    if (errors.length > 0) {
      preview.action = "error";
    } else {
      // Build the user data for import
      preview.data = {
        id: existingUser?.id,
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        email: email!,
        role: normalizedRole as Role,
        siteId,
        departmentId,
        managerId: normalizedRole === "LEARNER" ? managerId : undefined,
        active,
      };
    }

    previews.push(preview);
  });

  return previews;
}

/**
 * Generate a CSV template with example rows
 */
export function generateUserCSVTemplate(
  sites: Site[],
  departments: Department[],
  managers: User[]
): string {
  const header = "firstName,lastName,email,role,siteName,departmentName,managerEmail,active";
  
  // Get example data from actual sites/departments/managers
  const exampleSite = sites[0]?.name || "Plant A";
  const exampleDept = departments[0]?.name || "Maintenance";
  const exampleManager = managers.find((m) => m.role === "MANAGER");
  const exampleManagerEmail = exampleManager?.email || "manager@example.com";

  const exampleRows = [
    `John,Doe,john.doe@company.com,LEARNER,${exampleSite},${exampleDept},${exampleManagerEmail},true`,
    `Jane,Smith,jane.smith@company.com,MANAGER,${exampleSite},${exampleDept},,true`,
    `Bob,Admin,bob.admin@company.com,ADMIN,,,,true`,
  ];

  return [header, ...exampleRows].join("\n");
}

/**
 * Get import summary counts
 */
export function getImportSummary(previews: UserImportPreview[]): {
  createCount: number;
  updateCount: number;
  errorCount: number;
  hasErrors: boolean;
} {
  const createCount = previews.filter((p) => p.action === "create").length;
  const updateCount = previews.filter((p) => p.action === "update").length;
  const errorCount = previews.filter((p) => p.action === "error").length;

  return {
    createCount,
    updateCount,
    errorCount,
    hasErrors: errorCount > 0,
  };
}



