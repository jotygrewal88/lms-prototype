// Phase I Epic 2: Completion logging modal
// ✅ Epic 2 Acceptance: Mark completion with proof/notes; calculates expiresAt = completedAt + retrainIntervalDays
// ✅ Demo: Submit updates status=COMPLETED, sets completedAt, computes expiration
"use client";

import React, { useState, useEffect } from "react";
import { TrainingCompletion } from "@/types";
import { updateCompletion } from "@/lib/store";
import { today, addDays, formatDate } from "@/lib/utils";
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
  const [isExempt, setIsExempt] = useState(false);

  useEffect(() => {
    if (completion) {
      setCompletedAt(completion.completedAt ? formatDate(completion.completedAt) : formatDate(today()));
      setNotes(completion.notes || "");
      setProofUrl(completion.proofUrl || "");
      setIsExempt(completion.notes?.includes("exempt") || false);
    } else {
      resetForm();
    }
  }, [completion, isOpen]);

  const resetForm = () => {
    setCompletedAt(formatDate(today()));
    setNotes("");
    setProofUrl("");
    setIsExempt(false);
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
              <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Proof/Certificate URL
              </label>
              <input
                type="url"
                id="proofUrl"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://example.com/certificate.pdf"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
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

