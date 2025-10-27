// Phase I Epic 1: Global header with role toggle
"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getUsers, switchRole, subscribe, getOrganization } from "@/lib/store";
import { User } from "@/types";

export default function Header() {
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [organization, setOrganization] = useState(getOrganization());
  const users = getUsers();

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setCurrentUser(getCurrentUser());
      setOrganization(getOrganization());
    });
    return unsubscribe;
  }, []);

  const handleRoleSwitch = (userId: string) => {
    switchRole(userId);
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={organization.logo} 
            alt="UpKeep Logo" 
            className="h-8 object-contain"
          />
          <h1 className="text-xl font-semibold">UpKeep LMS</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Role:</span>
            <select
              value={currentUser.id}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="bg-gray-800 text-white rounded-md px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

