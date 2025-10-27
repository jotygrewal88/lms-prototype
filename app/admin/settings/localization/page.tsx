// Phase I Polish Pack: Localization Settings (Admin-only)
// ✅ AC #9: Timezone and Date Format configuration
// ✅ Persists to OrgSettings in-memory store
// ✅ All date renders across the app respect these settings
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import {
  getOrganization,
  updateOrganizationSettings,
  subscribe,
} from "@/lib/store";

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Phoenix", label: "Arizona Time (MST)" },
  { value: "America/Toronto", label: "Toronto (ET)" },
  { value: "America/Vancouver", label: "Vancouver (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Rome", label: "Rome (CET)" },
  { value: "Europe/Madrid", label: "Madrid (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/Mexico_City", label: "Mexico City (CST)" },
  { value: "UTC", label: "UTC (Universal)" },
];

const DATE_FORMATS = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-01-31)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (01/31/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/01/2024)" },
];

export default function LocalizationPage() {
  const [organization, setOrganization] = useState(getOrganization());
  const [timezone, setTimezone] = useState(
    organization.settings?.timezone || "America/Los_Angeles"
  );
  const [dateFormat, setDateFormat] = useState<"YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY">(
    organization.settings?.dateFormat || "YYYY-MM-DD"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const org = getOrganization();
      setOrganization(org);
      setTimezone(org.settings?.timezone || "America/Los_Angeles");
      setDateFormat(org.settings?.dateFormat || "YYYY-MM-DD");
    });
    return unsubscribe;
  }, []);

  const handleSave = () => {
    updateOrganizationSettings({
      settings: {
        timezone,
        dateFormat,
      },
    });

    setToastMessage("Localization settings saved successfully");
    setToastType("success");
  };

  return (
    <RouteGuard>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Localization Settings</h1>

          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Regional Preferences
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Configure timezone and date format for the entire organization. Changes apply
                  immediately to all date displays across the application.
                </p>
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Current selection: {timezone}
                </p>
              </div>

              {/* Date Format */}
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DATE_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Preview: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: dateFormat === "MM/DD/YYYY" ? '2-digit' : dateFormat === "DD/MM/YYYY" ? '2-digit' : 'numeric',
                    day: dateFormat === "MM/DD/YYYY" ? '2-digit' : dateFormat === "DD/MM/YYYY" ? '2-digit' : 'numeric',
                  })}
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  📋 What changes?
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Compliance table (Due, Completed, Expires columns)</li>
                  <li>• Learner dashboard and detail pages</li>
                  <li>• Notifications list and preview</li>
                  <li>• Audit snapshots and print headers</li>
                  <li>• Dashboard KPI date ranges</li>
                  <li>• CSV exports include a header noting the display format used</li>
                </ul>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleSave}>
                  Save Localization Settings
                </Button>
              </div>
            </div>
          </Card>

          {toastMessage && (
            <Toast
              message={toastMessage}
              type={toastType}
              onClose={() => setToastMessage(null)}
            />
          )}
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}

