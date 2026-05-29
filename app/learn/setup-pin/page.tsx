// Passwordless Login Prototype — first-time PIN setup
// Lands here after logging in with the starter PIN. Maria sets a custom PIN.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import KioskCard from "@/components/passwordless/KioskCard";
import { setCustomPin, startSession } from "@/lib/passwordless/store";
import { validateNewPin } from "@/lib/passwordless/pinValidation";
import { DEMO_LEARNER } from "@/data/passwordlessSeed";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function SetupPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateNewPin(pin, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCustomPin(pin);
    startSession();
    router.push("/learner");
  };

  return (
    <KioskCard>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {DEMO_LEARNER.firstName}! Let&apos;s set up your account.
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a 6-digit PIN you&apos;ll use to log in next time.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPin" className={labelClass}>
            New PIN
          </label>
          <input
            id="newPin"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="6-digit PIN"
            maxLength={6}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="confirmPin" className={labelClass}>
            Confirm new PIN
          </label>
          <input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="Re-enter PIN"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <p className="text-xs text-gray-500">Don&apos;t share your PIN with anyone.</p>

        <Button type="submit" variant="primary" className="w-full justify-center">
          Continue
        </Button>
      </form>
    </KioskCard>
  );
}
