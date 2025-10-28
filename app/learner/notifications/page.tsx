// Phase I AI Uplift - Unified: Learner Notifications Inbox
"use client";

import React, { useState, useEffect } from "react";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { getCurrentUser, getReceivedNotifications, subscribe, getUser } from "@/lib/store";
import { Notification, getFullName } from "@/types";
import { formatDate } from "@/lib/utils";
import { X, Mail } from "lucide-react";

export default function LearnerNotificationsPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const updateNotifications = () => {
      setCurrentUser(getCurrentUser());
      setNotifications(getReceivedNotifications(getCurrentUser().id));
    };
    updateNotifications();
    return subscribe(updateNotifications);
  }, []);

  return (
    <RouteGuard>
      <LearnerLayout>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Notifications</h1>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Received At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications yet
                      </td>
                    </tr>
                  ) : (
                    notifications.map(n => {
                      const sender = getUser(n.senderId);
                      return (
                        <tr 
                          key={n.id} 
                          onClick={() => setSelectedNotification(n)} 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(n.sentAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {sender ? getFullName(sender) : "System"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{n.subject}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={n.source === "Compliance" ? "info" : "default"}>
                              {n.source}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedNotification(null)}>
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              <div 
                className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Message</h2>
                  </div>
                  <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">From:</span>
                      <span className="text-sm text-gray-900">
                        {getUser(selectedNotification.senderId) 
                          ? getFullName(getUser(selectedNotification.senderId)!) 
                          : "System"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">Sent:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedNotification.sentAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Source:</span>
                      <Badge variant={selectedNotification.source === "Compliance" ? "info" : "default"}>
                        {selectedNotification.source}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                    <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-900">
                      {selectedNotification.subject}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                    <pre className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedNotification.body}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setSelectedNotification(null)} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </LearnerLayout>
    </RouteGuard>
  );
}

