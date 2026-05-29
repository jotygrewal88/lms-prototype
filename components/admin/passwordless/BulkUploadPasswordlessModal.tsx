// Passwordless Login Prototype — admin-only bulk CSV upload (mock).
// 4-step flow: download template → upload CSV → preview → confirmation.
// Nothing is actually parsed; the preview uses generated mock rows.
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Toast from "@/components/Toast";
import WelcomeSlipPreviewModal from "@/components/admin/passwordless/WelcomeSlipPreviewModal";
import { WelcomeSlipData } from "@/components/admin/passwordless/WelcomeSlip";
import { bulkCreatePasswordlessLearners } from "@/lib/store";
import { getFullName } from "@/types";
import { generateBulkLearnerRows, BulkLearnerRow } from "@/data/passwordlessBulkMock";
import {
  Download,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface BulkUploadPasswordlessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLearners: (ids: string[]) => void;
}

type Step = 1 | 2 | 3 | 4;

export default function BulkUploadPasswordlessModal({
  isOpen,
  onClose,
  onViewLearners,
}: BulkUploadPasswordlessModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [rows, setRows] = useState<BulkLearnerRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [createdSlips, setCreatedSlips] = useState<WelcomeSlipData[]>([]);
  const [createdIds, setCreatedIds] = useState<string[]>([]);
  const [bulkSlipsOpen, setBulkSlipsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRows(generateBulkLearnerRows());
      setFileName("");
      setShowFormatHelp(false);
      setShowErrors(false);
      setCreatedSlips([]);
      setCreatedIds([]);
      setBulkSlipsOpen(false);
    }
  }, [isOpen]);

  const readyRows = rows.filter((r) => r.status === "ready");
  const errorRows = rows.filter((r) => r.status === "error");

  const handleUploadClick = () => {
    setFileName("passwordless_learners.csv");
    setStep(3);
  };

  const handleConfirmImport = () => {
    const results = bulkCreatePasswordlessLearners(
      readyRows.map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        employeeId: r.employeeId,
        siteId: r.siteId,
        departmentId: r.departmentId,
        managerId: r.managerId,
        jobTitleText: r.roleTitle,
      }))
    );
    setCreatedSlips(
      results.map((r) => ({
        learnerName: getFullName(r.user),
        employeeId: r.user.employeeId || "",
        starterPin: r.starterPin,
      }))
    );
    setCreatedIds(results.map((r) => r.user.id));
    setStep(4);
  };

  const stepTitle: Record<Step, string> = {
    1: "Bulk upload passwordless learners",
    2: "Upload your CSV",
    3: "Preview your import",
    4: `${createdSlips.length} learners created!`,
  };

  const FormatHelp = () => (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
      <p className="font-medium text-gray-700 mb-1">CSV format</p>
      <p>
        <span className="font-medium">Required columns:</span> First name, Last name, Employee ID.
      </p>
      <p>
        <span className="font-medium">Optional columns:</span> Team, Manager, Role, Site/Location.
      </p>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen && !bulkSlipsOpen} onClose={onClose} title={stepTitle[step]} size="large">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5 text-xs font-medium">
          {[
            { n: 1, label: "Template" },
            { n: 2, label: "Upload" },
            { n: 3, label: "Preview" },
            { n: 4, label: "Done" },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <span
                className={`flex items-center gap-1.5 ${step >= s.n ? "text-emerald-700" : "text-gray-400"}`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    step > s.n
                      ? "bg-emerald-600 text-white"
                      : step === s.n
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.n ? "✓" : s.n}
                </span>
                {s.label}
              </span>
              {i < 3 && <span className="flex-1 h-px bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Template */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Add multiple learners at once by uploading a CSV file.</p>
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
              <Button variant="primary" onClick={() => setToast("Template download is stubbed in this prototype.")}>
                <Download className="w-4 h-4" />
                Download CSV template
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              The template includes required columns: <span className="font-medium">First name, Last name, Employee ID</span>.
              Optional columns: <span className="font-medium">Team, Manager, Role, Site/Location</span>.
            </p>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setStep(2)}>
                Next: Upload your CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
            >
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Drag a CSV file here, or click to browse.</span>
              <span className="text-xs text-gray-400">.csv up to 5 MB</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFormatHelp((v) => !v)}
              className="text-sm text-emerald-700 hover:text-emerald-800"
            >
              Need help with the format?
            </button>
            {showFormatHelp && <FormatHelp />}

            <div className="flex justify-between gap-3 pt-2 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleUploadClick}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              We&apos;ll create <span className="font-semibold">{readyRows.length} new passwordless learners</span>.{" "}
              {errorRows.length > 0 && (
                <span className="text-red-600">{errorRows.length} rows had errors.</span>
              )}
            </p>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["First name", "Last name", "Employee ID", "Team", "Manager", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.slice(0, 8).map((r, i) => (
                    <tr key={i} className={r.status === "error" ? "bg-red-50/40" : ""}>
                      <td className="px-4 py-2 text-sm text-gray-900">{r.firstName || <span className="text-red-500">—</span>}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{r.lastName || <span className="text-red-500">—</span>}</td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-700">{r.employeeId}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.teamLabel}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.managerName}</td>
                      <td className="px-4 py-2 text-sm">
                        {r.status === "ready" ? (
                          <Badge variant="success">
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          </Badge>
                        ) : (
                          <span>
                            <Badge variant="error">
                              <span className="inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Error
                              </span>
                            </Badge>
                            <span className="block text-xs text-red-600 mt-0.5">{r.error}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 8 && (
              <p className="text-xs text-gray-400">Showing first 8 of {rows.length} rows.</p>
            )}

            {errorRows.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowErrors((v) => !v)}
                  className="w-full flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {showErrors ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  View {errorRows.length} errored rows
                </button>
                {showErrors && (
                  <div className="px-4 pb-3 space-y-2">
                    {errorRows.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">
                            {r.firstName} {r.lastName || "(no last name)"} · {r.employeeId}
                          </span>
                          <span className="block text-red-600">{r.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Errored rows will be skipped. You can fix them and re-upload separately.
            </p>

            <div className="flex justify-between gap-3 pt-2 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleConfirmImport}>
                Confirm import
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center gap-2 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{createdSlips.length} learners created!</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Download the welcome slips below to print and distribute to your learners.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button variant="primary" onClick={() => setBulkSlipsOpen(true)}>
                <Download className="w-4 h-4" />
                Download all welcome slips (PDF)
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onViewLearners(createdIds);
                  onClose();
                }}
              >
                View learners
              </Button>
            </div>
          </div>
        )}

        {toast && <Toast message={toast} type="info" onClose={() => setToast(null)} />}
      </Modal>

      {/* Bulk welcome slips preview (sample of created slips) */}
      <WelcomeSlipPreviewModal
        isOpen={bulkSlipsOpen}
        onClose={() => setBulkSlipsOpen(false)}
        slips={createdSlips.slice(0, 4)}
        title="Welcome slips (sample of 4)"
      />
    </>
  );
}
