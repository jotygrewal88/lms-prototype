// Passwordless Login Prototype — Change PIN modal
// Opened from the profile menu in the top bar. Verifies the current PIN, then
// applies the same 6-digit rules used at first-time setup.
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { getCurrentPin, setCustomPin } from "@/lib/passwordless/store";
import { validateNewPin } from "@/lib/passwordless/pinValidation";

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function ChangePinModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePinModalProps) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPin !== getCurrentPin()) {
      setError("That current PIN isn't right. Try again.");
      return;
    }

    const validationError = validateNewPin(newPin, confirmPin);
    if (validationError) {
      setError(validationError);
      return;
    }

    setCustomPin(newPin);
    reset();
    onSuccess();
  };

  const onlyDigits = (v: string) => v.replace(/\D/g, "");

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change your PIN" size="small">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPin" className={labelClass}>
            Current PIN
          </label>
          <input
            id="currentPin"
            type="password"
            inputMode="numeric"
            value={currentPin}
            onChange={(e) => setCurrentPin(onlyDigits(e.target.value))}
            className={inputClass}
            placeholder="6-digit PIN"
            maxLength={6}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="newPin" className={labelClass}>
            New PIN
          </label>
          <input
            id="newPin"
            type="password"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => setNewPin(onlyDigits(e.target.value))}
            className={inputClass}
            placeholder="6-digit PIN"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="confirmNewPin" className={labelClass}>
            Confirm new PIN
          </label>
          <input
            id="confirmNewPin"
            type="password"
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
            className={inputClass}
            placeholder="Re-enter new PIN"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save new PIN
          </Button>
        </div>
      </form>
    </Modal>
  );
}
