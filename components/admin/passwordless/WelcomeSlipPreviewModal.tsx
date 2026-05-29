// Passwordless Login Prototype — modal wrapper around the welcome slip preview.
// Used for single-learner re-print (per-learner detail) and bulk slip preview.
"use client";

import React from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import WelcomeSlipPreview from "@/components/admin/passwordless/WelcomeSlipPreview";
import { WelcomeSlipData } from "@/components/admin/passwordless/WelcomeSlip";

interface WelcomeSlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slips: WelcomeSlipData[];
  title?: string;
}

export default function WelcomeSlipPreviewModal({
  isOpen,
  onClose,
  slips,
  title,
}: WelcomeSlipPreviewModalProps) {
  const multiple = slips.length > 1;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (multiple ? "Welcome slips" : "Welcome slip")}
      size={multiple ? "large" : "medium"}
    >
      <div className="space-y-4">
        {multiple && (
          <p className="no-print text-sm text-gray-600">
            Preview of the welcome slips (one per page). Print on letter paper and cut along
            the edges to hand out.
          </p>
        )}
        <WelcomeSlipPreview slips={slips} scale={multiple ? 0.5 : 0.62} />
        <div className="no-print flex justify-end border-t border-gray-200 pt-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
