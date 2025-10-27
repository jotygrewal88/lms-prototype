/**
 * PHASE I POLISH PACK ACCEPTANCE CHECKLIST:
 * ✓ Exemption reason text area (required, min 10 chars)
 * ✓ Attestation checkbox (required)
 * ✓ Stores exemptionReason, exemptionAttestedBy, exemptionAttestedAt
 * ✓ Creates ChangeLog entry
 */
"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import {
  updateCompletion,
  getCurrentUser,
} from "@/lib/store";
import { logChange } from "@/lib/changeLog";
import { TrainingCompletion } from "@/types";

interface ExemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completions: TrainingCompletion[];
  onComplete: () => void;
}

export default function ExemptionModal({
  isOpen,
  onClose,
  completions,
  onComplete,
}: ExemptionModalProps) {
  const [reason, setReason] = useState("");
  const [attested, setAttested] = useState(false);
  const currentUser = getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.length < 10) {
      alert("Reason must be at least 10 characters long.");
      return;
    }

    if (!attested) {
      alert("You must attest that this exemption is valid.");
      return;
    }

    const now = new Date().toISOString();

    completions.forEach((completion) => {
      updateCompletion(completion.id, {
        status: "EXEMPT",
        exemptionReason: reason,
        exemptionAttestedBy: currentUser.id,
        exemptionAttestedAt: now,
      });

      logChange(
        completion.id,
        `Marked as EXEMPT: ${reason}`,
        {
          action: "exempt",
          reason,
        }
      );
    });

    alert(`${completions.length} completion(s) marked as exempt.`);
    onComplete();
    handleClose();
  };

  const handleClose = () => {
    setReason("");
    setAttested(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark as Exempt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          You are marking {completions.length} completion(s) as exempt. Please provide a reason
          and attest to the validity of this exemption.
        </p>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Exemption Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={10}
            rows={4}
            placeholder="Enter the reason for this exemption (minimum 10 characters)..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-gray-500">{reason.length} / 10 characters minimum</p>
        </div>

        <div className="flex items-start">
          <input
            id="attest"
            name="attest"
            type="checkbox"
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
            required
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
          />
          <label htmlFor="attest" className="ml-2 block text-sm text-gray-900">
            I attest that this exemption is valid and complies with company policy.{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={reason.length < 10 || !attested}>
            Confirm Exemption
          </Button>
        </div>
      </form>
    </Modal>
  );
}

