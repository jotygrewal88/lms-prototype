/**
 * PHASE I POLISH PACK ACCEPTANCE CHECKLIST:
 * ✓ CSV Import with dry-run preview
 * ✓ Strict column validation (employeeEmail, trainingTitle, status, dueAt, completedAt, notes, proofUrl)
 * ✓ Status normalization (ASSIGNED, COMPLETED, OVERDUE, EXEMPT)
 * ✓ Date format validation (YYYY-MM-DD)
 * ✓ Upsert based on (email, training) key
 * ✓ Manager scope enforcement
 * ✓ Shows create/update/error counts
 * ✓ Apply button disabled if errors exist
 */
"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import {
  parseCSV,
  validateAndPreviewImport,
  generateCSVTemplate,
  ImportPreview,
} from "@/lib/csvImport";
import {
  getCurrentUser,
  getUsers,
  getTrainings,
  getCompletions,
  createCompletion,
  updateCompletion,
} from "@/lib/store";
import { logChange } from "@/lib/changeLog";
import { today } from "@/lib/utils";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDownloadTemplate, setShowDownloadTemplate] = useState(true);

  const currentUser = getCurrentUser();
  const users = getUsers();
  const trainings = getTrainings();
  const completions = getCompletions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowDownloadTemplate(false);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const previewResults = validateAndPreviewImport(
        rows,
        currentUser,
        users,
        trainings,
        completions
      );
      setPreviews(previewResults);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert("Failed to process CSV file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyImport = () => {
    const validPreviews = previews.filter((p) => p.action !== "error");

    if (validPreviews.length === 0) {
      alert("No valid rows to import.");
      return;
    }

    // Apply imports
    validPreviews.forEach((preview) => {
      if (!preview.data) return;

      if (preview.action === "create") {
        createCompletion(preview.data as any);
        logChange(
          preview.data.id!,
          `CSV Import: Created completion for ${preview.email} - ${preview.training}`,
          {
            action: "bulk_op",
          }
        );
      } else if (preview.action === "update") {
        updateCompletion(preview.data.id!, preview.data);
        logChange(
          preview.data.id!,
          `CSV Import: Updated completion for ${preview.email} - ${preview.training}`,
          {
            action: "bulk_op",
          }
        );
      }
    });

    alert(
      `Import complete! ${validPreviews.filter((p) => p.action === "create").length} created, ${validPreviews.filter((p) => p.action === "update").length} updated.`
    );
    onImportComplete();
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreviews([]);
    setShowDownloadTemplate(true);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const createCount = previews.filter((p) => p.action === "create").length;
  const updateCount = previews.filter((p) => p.action === "update").length;
  const errorCount = previews.filter((p) => p.action === "error").length;
  const hasErrors = errorCount > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import CSV">
      <div className="space-y-4">
        {showDownloadTemplate && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900 mb-2">
              Download the CSV template to ensure correct formatting.
            </p>
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              Download Template
            </Button>
          </div>
        )}

        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Required columns: employeeEmail, trainingTitle, status, dueAt, completedAt, notes,
            proofUrl
          </p>
        </div>

        {isProcessing && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Processing...</p>
          </div>
        )}

        {previews.length > 0 && !isProcessing && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">
                ✓ {createCount} will create
              </span>
              <span className="text-blue-600 font-medium">
                ↻ {updateCount} will update
              </span>
              <span className="text-red-600 font-medium">
                ✗ {errorCount} errors
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Row
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Training
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previews.map((preview, index) => (
                    <tr
                      key={index}
                      className={preview.action === "error" ? "bg-red-50" : ""}
                    >
                      <td className="px-3 py-2 text-gray-900">{preview.row}</td>
                      <td className="px-3 py-2 text-gray-900">{preview.email}</td>
                      <td className="px-3 py-2 text-gray-900">{preview.training}</td>
                      <td className="px-3 py-2 text-gray-900">{preview.status}</td>
                      <td className="px-3 py-2">
                        {preview.action === "create" && (
                          <span className="text-green-600 font-medium">Create</span>
                        )}
                        {preview.action === "update" && (
                          <span className="text-blue-600 font-medium">Update</span>
                        )}
                        {preview.action === "error" && (
                          <span className="text-red-600 font-medium">Error</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {preview.error || "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyImport}
                disabled={hasErrors || createCount + updateCount === 0}
              >
                Apply Import ({createCount + updateCount} rows)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

