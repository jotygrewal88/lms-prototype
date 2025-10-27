// Phase I Epic 1: Notification settings page (placeholder)
// ✅ Acceptance: Placeholder for future notification features
"use client";

import React from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";

export default function NotificationSettingsPage() {
  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Settings</h1>

        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Notification settings coming soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              Notification configuration will be added in Epic 2.
            </p>
          </div>
        </Card>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}

