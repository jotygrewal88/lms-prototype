// Phase I Epic 1, Polish Pack & UI Refresh v2: Clean white header (EHS-style)
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Bell, User, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { getCurrentUser, getUsers, switchRole, subscribe, getReceivedNotifications, getOrganization } from "@/lib/store";
import { User as UserType, getFullName } from "@/types";
import ScopeSelector from "@/components/ScopeSelector";
import ChangePinModal from "@/components/passwordless/ChangePinModal";
import Toast from "@/components/Toast";
import { isSessionActive, endSession, subscribePwless } from "@/lib/passwordless/store";

export default function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType>(getCurrentUser());
  const [notificationCount, setNotificationCount] = useState(0);
  const [orgLogo, setOrgLogo] = useState(getOrganization().logo);
  const [logoError, setLogoError] = useState(false);
  const [pwlessActive, setPwlessActive] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const users = getUsers();

  useEffect(() => {
    const updateState = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setOrgLogo(getOrganization().logo);
      setPwlessActive(isSessionActive());

      if (user.role === "LEARNER") {
        setNotificationCount(getReceivedNotifications(user.id).length);
      }
    };

    updateState();
    const unsubscribe = subscribe(updateState);
    const unsubscribePwless = subscribePwless(updateState);
    return () => {
      unsubscribe();
      unsubscribePwless();
    };
  }, []);

  const handleRoleSwitch = (userId: string) => {
    switchRole(userId);
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    endSession();
    router.push("/learn/login");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        {currentUser.role === "LEARNER" && orgLogo && !logoError ? (
          <img src={orgLogo} alt="Logo" className="h-8 object-contain" onError={() => setLogoError(true)} />
        ) : (
          <>
            <BookOpen className="w-5 h-5 text-gray-800" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">UpKeep Learn</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ScopeSelector />

        {/* Learner Notifications Bell */}
        {currentUser.role === "LEARNER" && (
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
        )}

        {/* Profile: dropdown during a passwordless session, plain link otherwise */}
        {currentUser.role === "LEARNER" && (
          pwlessActive ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Account"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <User className="w-5 h-5 text-gray-600" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                    <Link
                      href="/learner/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      View profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setShowChangePin(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <KeyRound className="w-4 h-4 text-gray-400" />
                      Change PIN
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/learner/profile"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Link>
          )
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

        {/* Passwordless session: prominent Log out (critical on shared devices) */}
        {pwlessActive && (
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        )}
      </div>

      <ChangePinModal
        isOpen={showChangePin}
        onClose={() => setShowChangePin(false)}
        onSuccess={() => {
          setShowChangePin(false);
          setToast("Your PIN has been updated.");
          router.push("/learner");
        }}
      />

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </header>
  );
}
