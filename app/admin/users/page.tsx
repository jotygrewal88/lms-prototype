// Phase I Epic 1 + User Management: Users page with CRUD
// ✅ Acceptance: Displays all seed users with roles, sites, departments
// ✅ Scope Filtering: Users filtered by selected scope
// ✅ User Management: Create, edit, deactivate/reactivate users
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import NewUserModal from "@/components/users/NewUserModal";
import NewPasswordlessLearnerModal from "@/components/admin/passwordless/NewPasswordlessLearnerModal";
import BulkUploadPasswordlessModal from "@/components/admin/passwordless/BulkUploadPasswordlessModal";
import UserImportModal from "@/components/users/UserImportModal";
import Toast from "@/components/Toast";
import ComplianceBadge from "@/components/ComplianceBadge";
import { getSites, getDepartments, getUsers, deactivateUser, reactivateUser, subscribe, getCurrentUser, getPasswordlessRecord } from "@/lib/store";
import { useScope } from "@/hooks/useScope";
import { User, getFullName } from "@/types";
import { Upload, ExternalLink, KeyRound, Mail, ChevronDown, Plus, FileSpreadsheet, X } from "lucide-react";

type AuthMethodFilter = "all" | "email" | "passwordless";

function formatLastLogin(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UsersPage() {
  const { scope } = useScope();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [authFilter, setAuthFilter] = useState<AuthMethodFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordlessModalOpen, setIsPasswordlessModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [createdFilterIds, setCreatedFilterIds] = useState<string[] | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const sites = getSites();
  const departments = getDepartments();

  // Admin and Manager both see auth-method/last-login columns + filter.
  const showAuthColumns = isAdmin || isManager;

  useEffect(() => {
    const updateData = () => {
      // Get users based on show deactivated toggle
      const users = getUsers(!showDeactivated); // true = include inactive
      setAllUsers(users);
      const cu = getCurrentUser();
      setIsAdmin(cu.role === "ADMIN");
      setIsManager(cu.role === "MANAGER");
      setCurrentUserId(cu.id);
    };
    
    updateData();
    const unsubscribe = subscribe(updateData);
    return unsubscribe;
  }, [showDeactivated]);

  // Auth-method filter helper (treat undefined authMethod as "email").
  const matchesAuthFilter = (user: User) => {
    if (authFilter === "all") return true;
    const method = user.authMethod === "passwordless" ? "passwordless" : "email";
    return method === authFilter;
  };

  // Filter by scope + auth method. Managers are scoped to their own team.
  const filteredUsers = allUsers.filter(user => {
    // "Newly created" filter (after a bulk import) takes precedence.
    if (createdFilterIds) return createdFilterIds.includes(user.id);

    // Managers see only their direct reports (their team), never admins/peers.
    if (isManager && !isAdmin) {
      if (user.managerId !== currentUserId) return false;
      return matchesAuthFilter(user);
    }

    if (!matchesAuthFilter(user)) return false;

    // Admin always visible
    if (user.role === "ADMIN") return true;
    
    // Filter by scope
    if (scope.siteId !== "ALL" && user.siteId !== scope.siteId) return false;
    if (scope.deptId !== "ALL" && user.departmentId !== scope.deptId) return false;
    
    return true;
  });

  const getSiteName = (siteId?: string) => {
    if (!siteId) return "—";
    const site = sites.find(s => s.id === siteId);
    if (!site) return "—";
    return site.region ? `${site.name} (${site.region})` : site.name;
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return "—";
    return departments.find(d => d.id === deptId)?.name || "—";
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return "—";
    const manager = allUsers.find(u => u.id === managerId);
    return manager ? getFullName(manager) : "—";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "MANAGER":
        return "warning";
      case "LEARNER":
        return "info";
      default:
        return "default";
    }
  };

  const handleNewUser = () => {
    setEditUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleDeactivateUser = (user: User) => {
    if (confirm(`Are you sure you want to deactivate ${getFullName(user)}? They will be removed from assignments and reports.`)) {
      try {
        deactivateUser(user.id);
        setToast({ message: "User deactivated successfully", type: "success" });
      } catch (err: any) {
        setToast({ message: err.message || "Failed to deactivate user", type: "error" });
      }
    }
  };

  const handleReactivateUser = (user: User) => {
    if (confirm(`Are you sure you want to reactivate ${getFullName(user)}?`)) {
      try {
        reactivateUser(user.id);
        setToast({ message: "User reactivated successfully", type: "success" });
      } catch (err: any) {
        setToast({ message: err.message || "Failed to reactivate user", type: "error" });
      }
    }
  };

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isManager && !isAdmin ? "My Team" : "Users"}</h1>
            <p className="text-gray-500 mt-1">
              {isManager && !isAdmin
                ? "Manage PINs and welcome slips for learners on your team"
                : "Manage employee accounts, roles, and department assignments"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="relative">
                <Button variant="secondary" onClick={() => setBulkMenuOpen((o) => !o)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Import
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                {bulkMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setBulkMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-40">
                      <button
                        onClick={() => {
                          setBulkMenuOpen(false);
                          setIsImportModalOpen(true);
                        }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">Bulk import by email</span>
                          <span className="block text-xs text-gray-500">CSV of email + password users</span>
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setBulkMenuOpen(false);
                          setIsBulkModalOpen(true);
                        }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">Bulk upload passwordless learners</span>
                          <span className="block text-xs text-gray-500">CSV of Employee ID + PIN learners</span>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
            {isAdmin ? (
              <div className="relative">
                <Button variant="primary" onClick={() => setAddMenuOpen((o) => !o)}>
                  <Plus className="w-4 h-4" />
                  Add learner
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {addMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setAddMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-40">
                      <button
                        onClick={() => {
                          setAddMenuOpen(false);
                          handleNewUser();
                        }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">Add by email</span>
                          <span className="block text-xs text-gray-500">Email + password sign-in</span>
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setAddMenuOpen(false);
                          setIsPasswordlessModalOpen(true);
                        }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <KeyRound className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">Add for passwordless login</span>
                          <span className="block text-xs text-gray-500">Employee ID + PIN (shared devices)</span>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showDeactivated"
              checked={showDeactivated}
              onChange={(e) => setShowDeactivated(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showDeactivated" className="text-sm text-gray-700">
              Show deactivated users
            </label>
          </div>

          {showAuthColumns && (
            <div className="flex items-center gap-2">
              <label htmlFor="authFilter" className="text-sm text-gray-700">
                Auth method
              </label>
              <select
                id="authFilter"
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value as AuthMethodFilter)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="email">Email</option>
                <option value="passwordless">Passwordless</option>
              </select>
            </div>
          )}
        </div>

        {createdFilterIds && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <p className="text-sm text-emerald-800">
              Showing {createdFilterIds.length} newly created learner{createdFilterIds.length !== 1 ? "s" : ""}.
            </p>
            <button
              onClick={() => setCreatedFilterIds(null)}
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
              Clear filter
            </button>
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  {showAuthColumns && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auth Method
                    </th>
                  )}
                  {showAuthColumns && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <ComplianceBadge userId={user.id} size="sm" />
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 group"
                        >
                          {getFullName(user)}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.authMethod === "passwordless" ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.jobTitleText || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSiteName(user.siteId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDepartmentName(user.departmentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === "LEARNER" ? getManagerName(user.managerId) : "—"}
                    </td>
                    {showAuthColumns && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.authMethod === "passwordless" ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Badge variant="info">
                              <span className="inline-flex items-center gap-1">
                                <KeyRound className="w-3 h-3" />
                                Passwordless
                              </span>
                            </Badge>
                            {user.employeeId && (
                              <span className="text-xs font-mono text-gray-500">{user.employeeId}</span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            Email
                          </span>
                        )}
                      </td>
                    )}
                    {showAuthColumns && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.authMethod === "passwordless" ? (
                          (() => {
                            const rec = getPasswordlessRecord(user.id);
                            if (!rec || rec.status === "pending_first_login") {
                              return <Badge variant="warning">Pending first login</Badge>;
                            }
                            return <span className="text-gray-500">{formatLastLogin(rec.lastLoginAt)}</span>;
                          })()
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={user.active ? "success" : "default"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEditUser(user)}
                            className="text-sm"
                          >
                            Edit
                          </Button>
                          {user.active ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleDeactivateUser(user)}
                              className="text-sm text-orange-600 hover:text-orange-700"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => handleReactivateUser(user)}
                              className="text-sm text-green-600 hover:text-green-700"
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8 + (showAuthColumns ? 2 : 0) + (isAdmin ? 1 : 0)} className="px-6 py-12 text-center text-sm text-gray-500">
                      No users found. {!showDeactivated && "Try enabling 'Show deactivated users'."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      </AdminLayout>

      <NewUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditUser(null);
        }}
        editUser={editUser}
      />

      <NewPasswordlessLearnerModal
        isOpen={isPasswordlessModalOpen}
        onClose={() => setIsPasswordlessModalOpen(false)}
      />

      <BulkUploadPasswordlessModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onViewLearners={(ids) => {
          setIsBulkModalOpen(false);
          setAuthFilter("all");
          setCreatedFilterIds(ids);
        }}
      />

      <UserImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          setToast({ message: "Users imported successfully", type: "success" });
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </RouteGuard>
  );
}

