// Phase I Epic 3: Notifications page
/**
 * ACCEPTANCE CHECKLIST (Epic 3):
 * ✓ Table displays all generated Notifications (Message, Recipient, Type, Created At)
 * ✓ Filter by type (reminder | escalation)
 * ✓ "Clear All" button resets notification list
 * ✓ Manager view shows only their team's notifications
 * ✓ Learner blocked from accessing this page
 * ✓ Colored badges for notification types (reminder=blue, escalation=red)
 */
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { 
  getNotifications, 
  getUsers,
  getCurrentUser,
  clearAllNotifications,
  subscribe 
} from "@/lib/store";
import { Notification, NotificationType } from "@/types";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(getNotifications());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [filterType, setFilterType] = useState<NotificationType | "">("");

  const users = getUsers();

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setNotifications(getNotifications());
      setCurrentUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const getUser = (userId: string) => users.find(u => u.id === userId);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      clearAllNotifications();
    }
  };

  const getFilteredNotifications = (): Notification[] => {
    let filtered = notifications;

    // Manager scope: only show notifications for their team
    if (currentUser.role === "MANAGER") {
      filtered = filtered.filter(notif => {
        const recipient = getUser(notif.recipientId);
        return recipient?.siteId === currentUser.siteId;
      });
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter(notif => notif.type === filterType);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "reminder":
        return <Badge variant="info">Reminder</Badge>;
      case "escalation":
        return <Badge variant="error">Escalation</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const reminderCount = notifications.filter(n => n.type === "reminder").length;
  const escalationCount = notifications.filter(n => n.type === "escalation").length;

  return (
    <RouteGuard>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                View generated reminders and escalations from the compliance page
              </p>
            </div>
            {currentUser.role === "ADMIN" && notifications.length > 0 && (
              <Button variant="secondary" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Notifications</p>
              </div>
            </Card>
            <Card>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-blue-600">{reminderCount}</p>
                <p className="text-sm text-gray-600 mt-1">Reminders</p>
              </div>
            </Card>
            <Card>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-red-600">{escalationCount}</p>
                <p className="text-sm text-gray-600 mt-1">Escalations</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <label htmlFor="filterType" className="text-sm font-medium text-gray-700">
                Filter by Type:
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NotificationType | "")}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="reminder">Reminder</option>
                <option value="escalation">Escalation</option>
              </select>

              {filterType && (
                <button
                  onClick={() => setFilterType("")}
                  className="text-sm text-primary hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </Card>

          {/* Notifications Table */}
          <Card>
            {filteredNotifications.length === 0 ? (
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
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Run &quot;Run Reminders Now&quot; from the Compliance page to generate notifications.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => {
                      const recipient = getUser(notification.recipientId);
                      
                      return (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTypeBadge(notification.type)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-2xl">
                              {notification.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {recipient?.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {recipient?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {currentUser.role === "MANAGER" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Manager View:</span> You are seeing notifications for your site only.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About Notifications</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>Reminders:</strong> Sent to learners when trainings are upcoming or overdue</li>
              <li><strong>Escalations:</strong> Sent to managers when overdue trainings exceed threshold</li>
              <li>All notifications are in-memory only (no actual emails sent)</li>
              <li>Notifications persist until manually cleared or app is restarted</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}

