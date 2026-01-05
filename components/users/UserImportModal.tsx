// Bulk User Import Modal: CSV upload with dry-run preview
"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  parseUserCSV,
  validateAndPreviewUserImport,
  generateUserCSVTemplate,
  getImportSummary,
  UserImportPreview,
} from "@/lib/userImport";
import {
  getUsers,
  getSites,
  getDepartments,
  createUser,
  updateUser,
} from "@/lib/store";
import { Upload, Download, AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react";

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function UserImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: UserImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<UserImportPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDownloadTemplate, setShowDownloadTemplate] = useState(true);
  const [importResult, setImportResult] = useState<{ created: number; updated: number } | null>(null);

  const users = getUsers(true); // Include inactive
  const sites = getSites();
  const departments = getDepartments();
  const managers = users.filter((u) => u.role === "MANAGER");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowDownloadTemplate(false);
      setImportResult(null);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const rows = parseUserCSV(text);
      const previewResults = validateAndPreviewUserImport(
        rows,
        users,
        sites,
        departments
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
    const validPreviews = previews.filter((p) => p.action !== "error" && p.data);

    if (validPreviews.length === 0) {
      alert("No valid rows to import.");
      return;
    }

    let created = 0;
    let updated = 0;

    // Apply imports
    validPreviews.forEach((preview) => {
      if (!preview.data) return;

      try {
        if (preview.action === "create") {
          const { id, ...userData } = preview.data;
          createUser(userData);
          created++;
        } else if (preview.action === "update" && preview.data.id) {
          const { id, ...userData } = preview.data;
          updateUser(id, userData);
          updated++;
        }
      } catch (err) {
        console.error(`Error importing user ${preview.email}:`, err);
      }
    });

    setImportResult({ created, updated });
    onImportComplete();
    
    // Auto-close after showing result
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setFile(null);
    setPreviews([]);
    setShowDownloadTemplate(true);
    setImportResult(null);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const template = generateUserCSVTemplate(sites, departments, managers);
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setPreviews([]);
    setShowDownloadTemplate(true);
    setImportResult(null);
  };

  const { createCount, updateCount, errorCount, hasErrors } = getImportSummary(previews);

  const getActionBadge = (action: UserImportPreview["action"]) => {
    switch (action) {
      case "create":
        return <Badge variant="success">Create</Badge>;
      case "update":
        return <Badge variant="info">Update</Badge>;
      case "error":
        return <Badge variant="error">Error</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import Users" size="xl">
      <div className="space-y-4">
        {/* Success Result */}
        {importResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Import Complete!</p>
              <p className="text-sm text-green-700">
                {importResult.created} users created, {importResult.updated} users updated.
              </p>
            </div>
          </div>
        )}

        {/* Download Template Section */}
        {showDownloadTemplate && !importResult && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1">
                  Download the CSV template first
                </p>
                <p className="text-sm text-blue-700 mb-3">
                  The template includes all required columns with example data. Fill it out and upload to import users.
                </p>
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        {!importResult && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : "Click to select or drag and drop a CSV file"}
                  </span>
                </div>
              </label>
              {file && (
                <Button variant="secondary" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Required columns: firstName, lastName, email, role. Optional: siteName, departmentName, managerEmail, active
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Processing file...</span>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previews.length > 0 && !isProcessing && !importResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Preview Summary:</span>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{createCount} new</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">{updateCount} updates</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{errorCount} errors</span>
                </div>
              )}
            </div>

            {/* Error Warning */}
            {hasErrors && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Errors found</p>
                  <p className="text-sm text-red-700">
                    Please fix the errors below before importing. Rows with errors will not be imported.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Row
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Site
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Manager
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
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
                      className={preview.action === "error" ? "bg-red-50" : "hover:bg-gray-50"}
                    >
                      <td className="px-3 py-2 text-gray-500">{preview.row}</td>
                      <td className="px-3 py-2 text-gray-900 font-medium">
                        {preview.firstName} {preview.lastName}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{preview.email}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          preview.role.toUpperCase() === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : preview.role.toUpperCase() === "MANAGER"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {preview.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{preview.siteName || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{preview.departmentName || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{preview.managerEmail || "—"}</td>
                      <td className="px-3 py-2">{getActionBadge(preview.action)}</td>
                      <td className="px-3 py-2">
                        {preview.errors.length > 0 ? (
                          <div className="space-y-1">
                            {preview.errors.map((error, i) => (
                              <div key={i} className="flex items-start gap-1 text-red-600">
                                <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyImport}
                disabled={hasErrors || createCount + updateCount === 0}
              >
                Import {createCount + updateCount} Users
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!file && !isProcessing && !showDownloadTemplate && (
          <div className="text-center py-8 text-gray-500">
            <p>Select a CSV file to preview the import.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}



