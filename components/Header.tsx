// Phase I Epic 1, Polish Pack & UI Refresh v2: Clean white header (EHS-style)
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Bell, User } from "lucide-react";
import { getCurrentUser, getUsers, switchRole, subscribe, getReceivedNotifications } from "@/lib/store";
import { User as UserType, getFullName } from "@/types";
import ScopeSelector from "@/components/ScopeSelector";

export default function Header() {
  const [currentUser, setCurrentUser] = useState<UserType>(getCurrentUser());
  const [notificationCount, setNotificationCount] = useState(0);
  const users = getUsers();

  useEffect(() => {
    const updateState = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      
      // Update notification count for learners
      if (user.role === "LEARNER") {
        setNotificationCount(getReceivedNotifications(user.id).length);
      }
    };
    
    updateState();
    const unsubscribe = subscribe(updateState);
    return unsubscribe;
  }, []);

  const handleRoleSwitch = (userId: string) => {
    switchRole(userId);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-gray-800" />
        <span className="text-lg font-semibold tracking-tight text-gray-900">UpKeep Learn</span>
      </div>

      <div className="flex items-center gap-4">
        <ScopeSelector />
        
        {/* Learner Notifications Bell */}
        {currentUser.role === "LEARNER" && (
          <>
            <Link 
              href="/learner/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </Link>
            {/* Phase II — 1M.1: Profile Link */}
            <Link
              href="/learner/profile"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Link>
          </>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Role:</span>
          <select
            value={currentUser.id}
            onChange={(e) => handleRoleSwitch(e.target.value)}
            className="bg-gray-50 text-gray-900 rounded-lg px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id} className="text-gray-900">
                {getFullName(user)} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
