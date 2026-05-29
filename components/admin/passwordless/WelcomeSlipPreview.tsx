// Passwordless Login Prototype — on-screen preview of one or more welcome slips.
// Renders a scaled rendering for screen plus a hidden full-size print root that
// becomes the only visible content when the browser print dialog runs.
"use client";

import React, { useState } from "react";
import { Download, Printer, Copy, Check } from "lucide-react";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import WelcomeSlip, { WelcomeSlipData } from "@/components/admin/passwordless/WelcomeSlip";

interface WelcomeSlipPreviewProps {
  slips: WelcomeSlipData[];
  scale?: number;
  showCopyPin?: boolean; // copies the first slip's starter PIN (single-learner flows)
}

// On-screen slip base size (matches WelcomeSlip "screen" variant).
const BASE_W = 720;
const BASE_H = 466;

export default function WelcomeSlipPreview({ slips, scale = 0.62, showCopyPin }: WelcomeSlipPreviewProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleDownload = () =>
    setToast("PDF export is stubbed in this prototype — use Print to test the layout.");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(slips[0].starterPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      {/* Scaled, on-screen preview (hidden during print) */}
      <div className="no-print flex flex-col items-center gap-4 max-h-[60vh] overflow-y-auto py-1">
        {slips.map((slip, i) => (
          <div
            key={i}
            style={{ width: BASE_W * scale, height: BASE_H * scale }}
            className="flex-shrink-0 rounded-lg shadow-sm overflow-hidden"
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <WelcomeSlip variant="screen" {...slip} />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="no-print flex items-center justify-center gap-2 pt-4">
        <Button variant="primary" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button variant="secondary" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          {slips.length > 1 ? "Download all welcome slips (PDF)" : "Download PDF"}
        </Button>
        {showCopyPin && (
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy starter PIN"}
          </Button>
        )}
      </div>

      {/* Full-size print root — hidden on screen, isolated for printing */}
      <div className="welcome-print-root" aria-hidden>
        {slips.map((slip, i) => (
          <div key={i} className="welcome-slip-page">
            <WelcomeSlip variant="print" {...slip} />
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} type="info" onClose={() => setToast(null)} />}
    </div>
  );
}
