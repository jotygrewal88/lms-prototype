// Passwordless Login Prototype — learner kiosk login
// The page floor workers see on shared kiosks/iPads. Employee ID + PIN only.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import KioskCard from "@/components/passwordless/KioskCard";
import { authenticate, startSession } from "@/lib/passwordless/store";
import { PWLESS_COMPANY } from "@/data/passwordlessSeed";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function LearnerLoginPage() {
  const router = useRouter();
  const [companyCode, setCompanyCode] = useState(PWLESS_COMPANY.slug);
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = authenticate(companyCode, employeeId, pin);

    if (result.status === "starter") {
      router.push("/learn/setup-pin");
      return;
    }

    if (result.status === "custom") {
      startSession();
      router.push("/learner");
      return;
    }

    setError("We couldn't find that account. Check your Employee ID and PIN.");
  };

  return (
    <KioskCard>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Log in</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your Employee ID and PIN to continue.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyCode" className={labelClass}>
            Company code
          </label>
          <input
            id="companyCode"
            type="text"
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="employeeId" className={labelClass}>
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className={inputClass}
            placeholder="EMP-1042"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="pin" className={labelClass}>
            PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="6-digit PIN"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <Button type="submit" variant="primary" className="w-full justify-center">
          Log in
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center">
        <p className="text-xs text-gray-500">
          First time? Use the starter PIN from your welcome slip.
        </p>
        <Link
          href="/learn/forgot-pin"
          className="block text-sm text-primary hover:underline"
        >
          Forgot PIN? Ask your manager.
        </Link>
      </div>
    </KioskCard>
  );
}
