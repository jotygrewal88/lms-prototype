"use client";

import React, { useState, useEffect } from "react";
import { X, Users, Building2, Briefcase, UserCheck } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import {
  getUsers,
  getSites,
  getDepartments,
  getCurrentUser,
  createCourseAssignment,
  updateCourseAssignment,
  getAssignmentsByCourseId,
  CourseAssignment,
  CourseAssignmentTarget,
} from "@/lib/store";
import { CourseAssignmentTarget as TargetType } from "@/types";

interface CourseAssignmentModalProps {
  courseId: string;
  assignment: CourseAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CourseAssignmentModal({
  courseId,
  assignment,
  isOpen,
  onClose,
  onSave,
}: CourseAssignmentModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "role" | "site" | "department">("user");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Array<"ADMIN" | "MANAGER" | "LEARNER">>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [roleSiteIds, setRoleSiteIds] = useState<string[]>([]);
  const [roleDepartmentIds, setRoleDepartmentIds] = useState<string[]>([]);
  const [dueAt, setDueAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

  useEffect(() => {
    if (assignment && isOpen) {
      // Load assignment data into form
      const { target } = assignment;
      switch (target.type) {
        case "user":
          setActiveTab("user");
          setSelectedUserIds(target.userIds);
          break;
        case "role":
          setActiveTab("role");
          setSelectedRoles(target.roles);
          setRoleSiteIds(target.siteIds || []);
          setRoleDepartmentIds(target.departmentIds || []);
          break;
        case "site":
          setActiveTab("site");
          setSelectedSiteIds(target.siteIds);
          break;
        case "department":
          setActiveTab("department");
          setSelectedDepartmentIds(target.departmentIds);
          break;
      }
      setDueAt(assignment.dueAt || "");
      setNotes(assignment.notes || "");
    } else if (!assignment && isOpen) {
      // Reset form for new assignment
      setActiveTab("user");
      setSelectedUserIds([]);
      setSelectedRoles([]);
      setSelectedSiteIds([]);
      setSelectedDepartmentIds([]);
      setRoleSiteIds([]);
      setRoleDepartmentIds([]);
      setDueAt("");
      setNotes("");
    }
    setError(null);
  }, [assignment, isOpen]);

  const handleSave = () => {
    setError(null);

    // Build target based on active tab
    let target: CourseAssignmentTarget | null = null;

    switch (activeTab) {
      case "user":
        if (selectedUserIds.length === 0) {
          setError("Please select at least one user.");
          return;
        }
        target = { type: "user", userIds: selectedUserIds };
        break;
      case "role":
        if (selectedRoles.length === 0) {
          setError("Please select at least one role.");
          return;
        }
        target = {
          type: "role",
          roles: selectedRoles,
          siteIds: roleSiteIds.length > 0 ? roleSiteIds : undefined,
          departmentIds: roleDepartmentIds.length > 0 ? roleDepartmentIds : undefined,
        };
        break;
      case "site":
        if (selectedSiteIds.length === 0) {
          setError("Please select at least one site.");
          return;
        }
        target = { type: "site", siteIds: selectedSiteIds };
        break;
      case "department":
        if (selectedDepartmentIds.length === 0) {
          setError("Please select at least one department.");
          return;
        }
        target = { type: "department", departmentIds: selectedDepartmentIds };
        break;
    }

    if (!target) {
      setError("Please select a target.");
      return;
    }

    // Check for duplicate assignment
    const existingAssignments = getAssignmentsByCourseId(courseId);
    const isDuplicate = existingAssignments.some((a) => {
      if (a.id === assignment?.id) return false; // Skip current assignment when editing
      if (JSON.stringify(a.target) === JSON.stringify(target)) return true;
      return false;
    });

    if (isDuplicate) {
      setError("An assignment with the same target already exists for this course.");
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (assignment) {
        // Update existing assignment
        updateCourseAssignment(assignment.id, {
          target,
          dueAt: dueAt || undefined,
          notes: notes || undefined,
        });
        setToast({ message: "Assignment updated successfully!", type: "success" });
      } else {
        // Create new assignment
        createCourseAssignment({
          courseId,
          target,
          dueAt: dueAt || undefined,
          notes: notes || undefined,
          assignerUserId: currentUser.id,
        });
        setToast({ message: "Assignment created successfully!", type: "success" });
      }

      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save assignment.");
      setToast({ message: err.message || "Failed to save assignment.", type: "error" });
    }
  };

  const formatAssignmentTargetSummary = (target: CourseAssignmentTarget): string => {
    switch (target.type) {
      case "user":
        return `${target.userIds.length} user(s)`;
      case "role":
        const parts = [target.roles.join(", ")];
        if (target.siteIds && target.siteIds.length > 0) {
          const siteNames = target.siteIds.map(sid => sites.find(s => s.id === sid)?.name || sid).join(", ");
          parts.push(`at ${siteNames}`);
        }
        if (target.departmentIds && target.departmentIds.length > 0) {
          const deptNames = target.departmentIds.map(did => departments.find(d => d.id === did)?.name || did).join(", ");
          parts.push(`in ${deptNames}`);
        }
        return parts.join(" ");
      case "site":
        return `Site(s): ${target.siteIds.map(sid => sites.find(s => s.id === sid)?.name || sid).join(", ")}`;
      case "department":
        return `Department(s): ${target.departmentIds.map(did => departments.find(d => d.id === did)?.name || did).join(", ")}`;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={assignment ? "Edit Assignment" : "New Assignment"}
        size="large"
      >
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200">
            {[
              { id: "user", label: "Users", icon: Users },
              { id: "role", label: "Roles", icon: UserCheck },
              { id: "site", label: "Sites", icon: Building2 },
              { id: "department", label: "Departments", icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Target Selection */}
          <div className="space-y-4">
            {activeTab === "user" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Users
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {users.filter(u => u.role === "LEARNER").map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds([...selectedUserIds, user.id]);
                          } else {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedUserIds.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedUserIds.length} user(s) selected
                  </p>
                )}
              </div>
            )}

            {activeTab === "role" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Roles
                  </label>
                  <div className="flex gap-3">
                    {(["ADMIN", "MANAGER", "LEARNER"] as const).map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles([...selectedRoles, role]);
                            } else {
                              setSelectedRoles(selectedRoles.filter(r => r !== role));
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-900">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedRoles.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Filter by Sites (optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {sites.map((site) => (
                          <label
                            key={site.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={roleSiteIds.includes(site.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRoleSiteIds([...roleSiteIds, site.id]);
                                } else {
                                  setRoleSiteIds(roleSiteIds.filter(id => id !== site.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-900">{site.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Filter by Departments (optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {departments.map((dept) => (
                          <label
                            key={dept.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={roleDepartmentIds.includes(dept.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRoleDepartmentIds([...roleDepartmentIds, dept.id]);
                                } else {
                                  setRoleDepartmentIds(roleDepartmentIds.filter(id => id !== dept.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-900">{dept.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "site" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Sites
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {sites.map((site) => (
                    <label
                      key={site.id}
                      className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSiteIds.includes(site.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSiteIds([...selectedSiteIds, site.id]);
                          } else {
                            setSelectedSiteIds(selectedSiteIds.filter(id => id !== site.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-900">{site.name}</span>
                    </label>
                  ))}
                </div>
                {selectedSiteIds.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedSiteIds.length} site(s) selected
                  </p>
                )}
              </div>
            )}

            {activeTab === "department" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Departments
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartmentIds.includes(dept.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartmentIds([...selectedDepartmentIds, dept.id]);
                          } else {
                            setSelectedDepartmentIds(selectedDepartmentIds.filter(id => id !== dept.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-900">{dept.name}</span>
                    </label>
                  ))}
                </div>
                {selectedDepartmentIds.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedDepartmentIds.length} department(s) selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any notes about this assignment..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {assignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </div>
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



