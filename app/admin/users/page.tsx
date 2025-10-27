// Phase I Epic 1: Users page
// ✅ Acceptance: Displays all seed users with roles, sites, departments
"use client";

import React from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Badge from "@/components/Badge";
import { getUsers, getSites, getDepartments } from "@/lib/store";

export default function UsersPage() {
  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

  const getSiteName = (siteId?: string) => {
    if (!siteId) return "—";
    return sites.find(s => s.id === siteId)?.name || "—";
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return "—";
    return departments.find(d => d.id === deptId)?.name || "—";
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

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>

        <Card>
          <Table headers={["Name", "Email", "Role", "Site", "Department"]}>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
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
              </tr>
            ))}
          </Table>
        </Card>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}

