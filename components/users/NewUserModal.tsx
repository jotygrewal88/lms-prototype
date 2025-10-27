// User Management: Modal for creating and editing users
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { 
  createUser, 
  updateUser, 
  getCurrentUser, 
  getSites, 
  getDepartments,
  getUsers 
} from "@/lib/store";
import { User, Role } from "@/types";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export default function NewUserModal({ isOpen, onClose, editUser }: NewUserModalProps) {
  const currentUser = getCurrentUser();
  const sites = getSites();
  const departments = getDepartments();
  const allUsers = getUsers(true); // Include inactive for manager selection

  const isAdmin = currentUser.role === "ADMIN";
  const isEditing = !!editUser;

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("LEARNER");
  const [siteId, setSiteId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [sendInvite, setSendInvite] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Initialize form with edit data
  useEffect(() => {
    if (editUser) {
      setFirstName(editUser.firstName);
      setLastName(editUser.lastName);
      setEmail(editUser.email);
      setRole(editUser.role);
      setSiteId(editUser.siteId || "");
      setDepartmentId(editUser.departmentId || "");
      setManagerId(editUser.managerId || "");
    } else {
      // Reset form for new user
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("LEARNER");
      setSiteId(currentUser.role === "MANAGER" ? currentUser.siteId || "" : "");
      setDepartmentId(currentUser.role === "MANAGER" ? currentUser.departmentId || "" : "");
      setManagerId("");
      setSendInvite(false);
    }
    setError(null);
  }, [editUser, isOpen, currentUser]);

  // Filter departments based on selected site
  const availableDepartments = departmentId || siteId
    ? departments.filter(d => d.siteId === siteId)
    : departments;

  // Filter managers based on selected site/dept
  const availableManagers = allUsers.filter(u => {
    if (u.role !== "MANAGER") return false;
    if (!siteId) return true; // Show all managers if no site selected
    if (u.siteId !== siteId) return false;
    // If department is selected, manager must match or be site-level
    if (departmentId && u.departmentId && u.departmentId !== departmentId) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (role === "MANAGER" && !siteId) {
      setError("Site is required for Manager role");
      return;
    }
    if (role === "LEARNER" && !managerId) {
      setError("Manager is required for Learner role");
      return;
    }

    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        role,
        siteId: siteId || undefined,
        departmentId: departmentId || undefined,
        managerId: role === "LEARNER" ? managerId || undefined : undefined,
        active: true,
      };

      if (isEditing && editUser) {
        updateUser(editUser.id, userData);
        setToast({ message: "User updated successfully", type: "success" });
      } else {
        createUser(userData);
        setToast({ message: "User created successfully", type: "success" });
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setToast(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    }
  };

  const handleClose = () => {
    setError(null);
    setToast(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit User" : "New User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={!isAdmin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {isAdmin && <option value="ADMIN">Admin</option>}
              {isAdmin && <option value="MANAGER">Manager</option>}
              <option value="LEARNER">Learner</option>
            </select>
            {!isAdmin && (
              <p className="mt-1 text-xs text-gray-500">Managers can only create Learner users</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site {role === "MANAGER" && <span className="text-red-500">*</span>}
            </label>
            <select
              value={siteId}
              onChange={(e) => {
                setSiteId(e.target.value);
                // Reset department if it doesn't belong to new site
                if (departmentId) {
                  const dept = departments.find(d => d.id === departmentId);
                  if (dept && dept.siteId !== e.target.value) {
                    setDepartmentId("");
                  }
                }
              }}
              disabled={currentUser.role === "MANAGER"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select site...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={currentUser.role === "MANAGER" || !siteId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select department...</option>
              {availableDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {role === "LEARNER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager <span className="text-red-500">*</span>
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select manager...</option>
                {availableManagers.map(mgr => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.firstName} {mgr.lastName} ({mgr.departmentId ? departments.find(d => d.id === mgr.departmentId)?.name : sites.find(s => s.id === mgr.siteId)?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendInvite"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sendInvite" className="text-sm text-gray-700">
                Send invite email (mock - not functional)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

