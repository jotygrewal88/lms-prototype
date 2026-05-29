// Passwordless Login Prototype — the real, printable welcome slip.
// A single half-letter (8.5 x 5.5 aspect) card the admin prints and hands to a
// floor worker. Designed to print with high contrast on letter paper.
"use client";

import React from "react";
import { BookOpen, KeyRound } from "lucide-react";
import { PWLESS_COMPANY } from "@/data/passwordlessSeed";

export interface WelcomeSlipData {
  learnerName: string;
  employeeId: string;
  starterPin: string;
}

interface WelcomeSlipProps extends WelcomeSlipData {
  // "screen" renders at a fixed px size (for on-screen preview/scaling);
  // "print" renders at physical inches so it prints at true size.
  variant?: "screen" | "print";
}

const STEPS = [
  "Go to the login URL on any company device.",
  "Enter your Employee ID.",
  "Enter your Starter PIN.",
  "Create your own PIN that you'll remember.",
  "Start your assigned training.",
];

export default function WelcomeSlip({
  learnerName,
  employeeId,
  starterPin,
  variant = "screen",
}: WelcomeSlipProps) {
  const loginUrl = `learn.upkeep.com/${PWLESS_COMPANY.slug}`;

  // 8.5 x 5.5 aspect. Print size fits letter paper with 0.5in margins.
  const dims =
    variant === "print"
      ? { width: "7.5in", height: "4.85in" }
      : { width: "720px", height: "466px" };

  return (
    <div
      className="welcome-slip flex flex-col overflow-hidden bg-white text-gray-900"
      style={{
        ...dims,
        border: "1px solid #d1d5db",
      }}
    >
      {/* Brand header */}
      <div
        className="flex items-center justify-between px-7"
        style={{ height: 64, backgroundColor: "#047857", color: "#ffffff" }}
      >
        <div className="flex items-center gap-2">
          <BookOpen style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
            UpKeep Learn
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>
          {PWLESS_COMPANY.name}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 px-7 py-5 flex flex-col">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
            Welcome to UpKeep Learn!
          </h2>
          <p style={{ fontSize: 14, color: "#4b5563", marginTop: 4 }}>
            {learnerName}, here&apos;s how to sign in.
          </p>
        </div>

        <div className="flex gap-6 mt-4 flex-1">
          {/* Credentials */}
          <div style={{ width: "42%" }} className="flex flex-col">
            <div
              className="flex items-center gap-1.5"
              style={{ fontSize: 11, fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              <KeyRound style={{ width: 13, height: 13 }} />
              Your sign-in details
            </div>
            <div
              className="mt-2 flex-1 flex flex-col justify-center gap-3"
              style={{ border: "1px solid #e5e7eb", borderRadius: 12, backgroundColor: "#f9fafb", padding: "14px 16px" }}
            >
              <Field label="Login URL" value={loginUrl} />
              <Field label="Employee ID" value={employeeId} />
              <Field label="Starter PIN" value={starterPin} emphasize />
            </div>
          </div>

          {/* Steps */}
          <div style={{ width: "58%" }} className="flex flex-col">
            <div
              style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              First-time sign-in
            </div>
            <ol className="mt-2 flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 9999,
                      backgroundColor: "#047857",
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.35 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-7 flex items-center"
        style={{ height: 34, backgroundColor: "#f3f4f6", borderTop: "1px solid #e5e7eb" }}
      >
        <span style={{ fontSize: 12, color: "#4b5563" }}>
          Lost your PIN? Ask your manager.
        </span>
      </div>
    </div>
  );
}

function Field({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontWeight: 700,
          color: "#111827",
          fontSize: emphasize ? 24 : 15,
          letterSpacing: emphasize ? "0.18em" : "0.02em",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}
