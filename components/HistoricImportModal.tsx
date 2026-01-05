/**
 * Historic Import Modal
 * Allows admins to bulk import historic training completion records
 * CSV Format: User Email, Training Name, Completion Date, Expiry Date
 */
"use client";

import React, { useState } from "react";
import { Upload, Download, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import {
  parseHistoricCSV,
  validateHistoricImport,
  createHistoricCompletions,
  generateHistoricCSVTemplate,
  ImportPreviewRow,
} from "@/lib/importers";
import {
  getUsers,
  getTrainings,
  createCompletion,
} from "@/lib/store";
import { logChange } from "@/lib/changeLog";

interface HistoricImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (created: number, errors: number) => void;
}

export default function HistoricImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: HistoricImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<ImportPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplate, setShowTemplate] = useState(true);

  const users = getUsers();
  const trainings = getTrainings();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowTemplate(false);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const rows = parseHistoricCSV(text);
      const previewResults = validateHistoricImport(rows, users, trainings);
      setPreviews(previewResults);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert("Failed to process CSV file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyImport = () => {
    const validRows = previews.filter(p => p.status === "valid");

    if (validRows.length === 0) {
      alert("No valid rows to import.");
      return;
    }

    // Create completions from valid rows
    const completions = createHistoricCompletions(validRows);

    // Apply to store
    completions.forEach(completion => {
      createCompletion(completion);
      logChange(
        completion.id,
        `Historic Import: Created completion for training (completed ${completion.completedAt})`,
        { action: "historic_import" }
      );
    });

    const errorCount = previews.filter(p => p.status === "error").length;
    onImportComplete(completions.length, errorCount);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreviews([]);
    setShowTemplate(true);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const template = generateHistoricCSVTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historic-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const validCount = previews.filter(p => p.status === "valid").length;
  const errorCount = previews.filter(p => p.status === "error").length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import History">
      <div className="space-y-4">
        {/* Template Download Section */}
        {showTemplate && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-emerald-900 mb-1">
                  CSV Format
                </h4>
                <p className="text-sm text-emerald-700 mb-3">
                  Your CSV should have these columns: <strong>User Email</strong>, <strong>Training Name</strong>, <strong>Completion Date</strong>, <strong>Expiry Date</strong>
                </p>
                <p className="text-xs text-emerald-600 mb-3">
                  Dates should be in YYYY-MM-DD format. All imported records will be marked as COMPLETED.
                </p>
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div>
          <label
            htmlFor="historicCsvFile"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select CSV File
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="historicCsvFile"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-1 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">CSV files only</p>
              </div>
              <input
                type="file"
                id="historicCsvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Processing CSV...</p>
          </div>
        )}

        {/* Preview Results */}
        {previews.length > 0 && !isProcessing && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="flex gap-4 text-sm">
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {errorCount} errors
                </span>
              )}
            </div>

            {/* Error Summary */}
            {errorCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-900 mb-2">
                  Import Errors
                </h4>
                <ul className="space-y-1 text-sm text-red-700 max-h-32 overflow-y-auto">
                  {previews
                    .filter(p => p.status === "error")
                    .map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500">Row {p.row}:</span>
                        <span>{p.error}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
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
                      Completed
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previews.map((preview, index) => (
                    <tr
                      key={index}
                      className={preview.status === "error" ? "bg-red-50" : ""}
                    >
                      <td className="px-3 py-2 text-gray-900">{preview.row}</td>
                      <td className="px-3 py-2 text-gray-900 truncate max-w-[150px]">
                        {preview.email}
                      </td>
                      <td className="px-3 py-2 text-gray-900 truncate max-w-[150px]">
                        {preview.trainingName}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {preview.completionDate}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {preview.expiryDate || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {preview.status === "valid" ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600" title={preview.error}>
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyImport}
                disabled={validCount === 0}
              >
                Import {validCount} Record{validCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

