// Passwordless Login Prototype — admin-only "Add one passwordless learner".
// Modal variant, matching the existing "Add by email" (NewUserModal) experience.
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import WelcomeSlipPreview from "@/components/admin/passwordless/WelcomeSlipPreview";
import {
  getSites,
  getDepartments,
  getUsers,
  createPasswordlessLearner,
  generateEmployeeId,
} from "@/lib/store";
import { User, getFullName } from "@/types";

interface NewPasswordlessLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function NewPasswordlessLearnerModal({ isOpen, onClose }: NewPasswordlessLearnerModalProps) {
  const router = useRouter();
  const sites = getSites();
  const departments = getDepartments();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");

  // Confirmation state after a learner is created.
  const [created, setCreated] = useState<{ user: User; starterPin: string } | null>(null);

  // Reset all state whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      setFirstName("");
      setLastName("");
      setEmployeeId("");
      setAutoGenerate(false);
      setSiteId("");
      setDepartmentId("");
      setManagerId("");
      setJobTitle("");
      setError("");
      setCreated(null);
    }
  }, [isOpen]);

  const managers = getUsers(true).filter((u) => u.role === "MANAGER");
  const availableDepartments = siteId ? departments.filter((d) => d.siteId === siteId) : departments;

  const handleToggleAutoGenerate = (on: boolean) => {
    setAutoGenerate(on);
    setEmployeeId(on ? generateEmployeeId() : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) return setError("First name is required.");
    if (!lastName.trim()) return setError("Last name is required.");
    if (!employeeId.trim()) return setError("Employee ID is required (or turn on auto-generate).");

    try {
      const result = createPasswordlessLearner({
        firstName,
        lastName,
        employeeId,
        siteId: siteId || undefined,
        departmentId: departmentId || undefined,
        managerId: managerId || undefined,
        jobTitleText: jobTitle || undefined,
      });
      setCreated(result);
    } catch (err: any) {
      setError(err.message || "Failed to create learner.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={created ? "Learner created" : "Add passwordless learner"}
    >
      {created ? (
        <div className="space-y-4">
          <p className="no-print text-sm text-gray-700">Learner created. Here&apos;s their welcome slip:</p>
          <WelcomeSlipPreview
            slips={[
              {
                learnerName: getFullName(created.user),
                employeeId: created.user.employeeId || "",
                starterPin: created.starterPin,
              },
            ]}
          />
          <div className="no-print flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                const id = created.user.id;
                onClose();
                router.push(`/admin/users/${id}`);
              }}
            >
              View learner
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={autoGenerate}
              className={inputClass}
              placeholder="EMP-1042"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use your existing employee ID system or let us auto-generate one.
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => handleToggleAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Auto-generate Employee ID
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Site</label>
              <select
                value={siteId}
                onChange={(e) => {
                  setSiteId(e.target.value);
                  setDepartmentId("");
                }}
                className={inputClass}
              >
                <option value="">Select site...</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.region ? ` (${s.region})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Department / team</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!siteId}
                className={inputClass}
              >
                <option value="">Select department...</option>
                {availableDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select manager...</option>
              {managers.map((m) => {
                const mgrSite = sites.find((s) => s.id === m.siteId);
                const mgrDept = departments.find((d) => d.id === m.departmentId);
                const loc = mgrDept?.name || mgrSite?.name || "";
                return (
                  <option key={m.id} value={m.id}>
                    {getFullName(m)}{loc ? ` (${loc})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className={labelClass}>Role / job title (optional)</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g., Production Floor Associate"
            />
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
            This learner will log in with their Employee ID and a PIN. After you save,
            you&apos;ll get a printable welcome slip to give to them.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create learner
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
