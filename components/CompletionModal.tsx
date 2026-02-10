// Phase I Epic 2 & Polish Pack: Completion logging modal with change history
// ✅ Epic 2 Acceptance: Mark completion with proof/notes; calculates expiresAt = completedAt + retrainIntervalDays
// ✅ Demo: Submit updates status=COMPLETED, sets completedAt, computes expiration
// ✅ Polish Pack: Logs changes to change history
// ✅ File Upload: Support file attachment as proof via paperclip icon
"use client";

import React, { useState, useEffect, useRef } from "react";
import { TrainingCompletion } from "@/types";
import { updateCompletion } from "@/lib/store";
import { today, addDays, formatDate } from "@/lib/utils";
import { logChange } from "@/lib/changeLog";
import { Paperclip, Loader2, X, FileText, ExternalLink } from "lucide-react";
import Button from "./Button";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completion: TrainingCompletion | null;
  trainingRetrainDays?: number;
  onSave: () => void;
}

export default function CompletionModal({ isOpen, onClose, completion, trainingRetrainDays, onSave }: CompletionModalProps) {
  const [completedAt, setCompletedAt] = useState(formatDate(today()));
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExempt, setIsExempt] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if the current proofUrl is an uploaded file (starts with /uploads/)
  const isUploadedFile = proofUrl.startsWith("/uploads/");

  useEffect(() => {
    if (completion) {
      setCompletedAt(completion.completedAt ? formatDate(completion.completedAt) : formatDate(today()));
      setNotes(completion.notes || "");
      const existingProofUrl = completion.proofUrl || "";
      setProofUrl(existingProofUrl);
      // If it's an uploaded file, extract filename from path
      if (existingProofUrl.startsWith("/uploads/")) {
        const pathParts = existingProofUrl.split("/");
        const filename = pathParts[pathParts.length - 1];
        // Remove UUID prefix if present (format: uuid-filename.ext)
        const cleanFilename = filename.includes("-") ? filename.substring(filename.indexOf("-") + 1) : filename;
        setUploadedFileName(cleanFilename);
      } else {
        setUploadedFileName(null);
      }
      setIsExempt(completion.notes?.includes("exempt") || false);
    } else {
      resetForm();
    }
  }, [completion, isOpen]);

  const resetForm = () => {
    setCompletedAt(formatDate(today()));
    setNotes("");
    setProofUrl("");
    setUploadedFileName(null);
    setIsExempt(false);
    setIsUploading(false);
  };

  // Handle file upload for proof attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Determine resource type based on MIME
      let resourceType = "pdf";
      if (file.type.startsWith("image/")) {
        resourceType = "image";
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", resourceType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        setProofUrl(result.url);
        setUploadedFileName(file.name);
      } else {
        alert(result.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!completion) return;

    const completedDate = `${completedAt}T00:00:00.000Z`;
    let expiresAt: string | undefined = undefined;

    if (trainingRetrainDays && !isExempt) {
      expiresAt = addDays(completedDate, trainingRetrainDays);
    }

    updateCompletion(completion.id, {
      status: "COMPLETED",
      completedAt: completedDate,
      expiresAt,
      notes: isExempt ? `${notes}\n[EXEMPT]`.trim() : notes,
      proofUrl: proofUrl || undefined,
      overdueDays: undefined,
    });

    // Log the change
    logChange(
      completion.id,
      `Marked as COMPLETED on ${formatDate(completedDate)}${proofUrl ? " with proof" : ""}`,
      {
        action: "completion_logged",
      }
    );

    onSave();
    onClose();
    resetForm();
  };

  const handleExempt = () => {
    if (!completion) return;

    updateCompletion(completion.id, {
      status: "COMPLETED",
      completedAt: today(),
      notes: "Exempt - No completion required",
      expiresAt: undefined,
      overdueDays: undefined,
    });

    onSave();
    onClose();
    resetForm();
  };

  if (!isOpen || !completion) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div
          className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Log Completion</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="completedAt" className="block text-sm font-medium text-gray-700 mb-1">
                Completed Date *
              </label>
              <input
                type="date"
                id="completedAt"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                max={formatDate(today())}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this completion..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof/Certificate
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {isUploadedFile && uploadedFileName ? (
                // Show uploaded file as clickable link
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {uploadedFileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setProofUrl("");
                      setUploadedFileName(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Show URL input with paperclip button
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      id="proofUrl"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="Enter URL or attach a file"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {proofUrl && !isUploadedFile && (
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {/* Paperclip button to trigger file upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Attach a file"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {isUploadedFile ? "Click filename to view, or X to remove" : "Enter a URL or click the paperclip to upload a file"}
              </p>
            </div>

            {trainingRetrainDays && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Retrain Interval:</span> {trainingRetrainDays} days
                  <br />
                  Completion will expire on: {formatDate(addDays(`${completedAt}T00:00:00.000Z`, trainingRetrainDays))}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary">
                Mark Complete
              </Button>
              <Button type="button" variant="secondary" onClick={handleExempt}>
                Mark Exempt
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

