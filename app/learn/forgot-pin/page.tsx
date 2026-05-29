// Passwordless Login Prototype — forgot PIN
// Floor workers don't have email, so PIN resets go through a manager/admin.
// No self-serve recovery.
"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import KioskCard from "@/components/passwordless/KioskCard";

export default function ForgotPinPage() {
  const router = useRouter();

  return (
    <KioskCard>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Forgot your PIN?</h1>
        <p className="text-sm text-gray-500 mt-2">
          Ask your manager or admin to reset your PIN. They&apos;ll give you a
          new starter PIN, just like when you first signed in.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => router.push("/learn/login")}
          >
            Back to login
          </Button>
        </div>
      </div>
    </KioskCard>
  );
}
