// Passwordless Login Prototype — admin-only controls on the learner detail page.
// Renders auth method, Employee ID, last login, and the Reset PIN / welcome slip
// actions. Returns null for email learners or non-admin viewers.
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import WelcomeSlipPreview from "@/components/admin/passwordless/WelcomeSlipPreview";
import WelcomeSlipPreviewModal from "@/components/admin/passwordless/WelcomeSlipPreviewModal";
import {
  getCurrentUser,
  getPasswordlessRecord,
  resetLearnerPin,
  subscribe,
} from "@/lib/store";
import { User, PasswordlessRecord, getFullName } from "@/types";
import { KeyRound, Download, RotateCcw } from "lucide-react";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Admins manage any passwordless learner; managers only their own direct reports.
function computeCanManage(user: User): boolean {
  const cu = getCurrentUser();
  if (cu.role === "ADMIN") return true;
  if (cu.role === "MANAGER" && user.managerId === cu.id) return true;
  return false;
}

export default function PasswordlessLearnerControls({ user }: { user: User }) {
  const [canManage, setCanManage] = useState(computeCanManage(user));
  const [record, setRecord] = useState<PasswordlessRecord | undefined>(getPasswordlessRecord(user.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState<"confirm" | "done">("confirm");
  const [newPin, setNewPin] = useState("");
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCanManage(computeCanManage(user));
      setRecord(getPasswordlessRecord(user.id));
    };
    sync();
    return subscribe(sync);
  }, [user]);

  if (!canManage || user.authMethod !== "passwordless") return null;

  const pending = !record || record.status === "pending_first_login";

  const openReset = () => {
    setPhase("confirm");
    setNewPin("");
    setModalOpen(true);
  };

  const handleConfirmReset = () => {
    const pin = resetLearnerPin(user.id);
    setNewPin(pin);
    setPhase("done");
  };

  const reprintPin = record?.starterPin || newPin;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Passwordless login</h3>
            <Badge variant="info">Employee ID + PIN</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
            <div>
              <p className="text-xs text-gray-500">Employee ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {user.employeeId || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last login</p>
              {pending ? (
                <Badge variant="warning">Hasn&apos;t logged in yet</Badge>
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(record?.lastLoginAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" onClick={() => setSlipModalOpen(true)}>
            <Download className="w-4 h-4" />
            Download welcome slip
          </Button>
          <Button variant="secondary" onClick={openReset} className="text-orange-600 hover:text-orange-700">
            <RotateCcw className="w-4 h-4" />
            Reset PIN
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={phase === "confirm" ? `Reset ${getFullName(user)}'s PIN?` : "PIN reset"}
        size={phase === "confirm" ? "small" : "medium"}
      >
        {phase === "confirm" ? (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Their current PIN will stop working immediately. We&apos;ll generate a new
              starter PIN for them. You&apos;ll get a new welcome slip you can give them so
              they can log back in and set a new PIN of their own choosing.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReset}>
                Reset PIN
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="no-print text-sm text-gray-700">
              PIN reset. New starter PIN:{" "}
              <span className="font-mono font-bold tracking-widest text-gray-900">{newPin}</span>.
              Download the welcome slip to give to {getFullName(user)}.
            </p>
            <WelcomeSlipPreview
              slips={[
                {
                  learnerName: getFullName(user),
                  employeeId: user.employeeId || "",
                  starterPin: newPin,
                },
              ]}
              showCopyPin
            />
            <div className="no-print flex items-center justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <WelcomeSlipPreviewModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        slips={[
          {
            learnerName: getFullName(user),
            employeeId: user.employeeId || "",
            starterPin: reprintPin,
          },
        ]}
      />
    </div>
  );
}
