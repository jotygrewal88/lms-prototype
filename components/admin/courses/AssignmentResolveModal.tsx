"use client";

import React from "react";
import { X, Users } from "lucide-react";
import Modal from "@/components/Modal";
import {
  resolveAssigneesForCourse,
  getAssignmentsByCourseId,
  getUsers,
  getSites,
  getDepartments,
} from "@/lib/store";
import { CourseAssignment } from "@/types";

interface AssignmentResolveModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignmentResolveModal({
  courseId,
  isOpen,
  onClose,
}: AssignmentResolveModalProps) {
  const assignments = getAssignmentsByCourseId(courseId);
  const resolvedUserIds = resolveAssigneesForCourse(courseId);
  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

  const resolvedUsers = users.filter((u) => resolvedUserIds.includes(u.id));

  const formatAssignmentTargetSummary = (assignment: CourseAssignment): string => {
    const { target } = assignment;
    switch (target.type) {
      case "user":
        return `${target.userIds.length} user(s)`;
      case "role":
        const parts = [target.roles.join(", ")];
        if (target.siteIds && target.siteIds.length > 0) {
          const siteNames = target.siteIds.map(sid => { const s = sites.find(s => s.id === sid); return s ? (s.region ? `${s.name} (${s.region})` : s.name) : sid; }).join(", ");
          parts.push(`at ${siteNames}`);
        }
        if (target.departmentIds && target.departmentIds.length > 0) {
          const deptNames = target.departmentIds.map(did => departments.find(d => d.id === did)?.name || did).join(", ");
          parts.push(`in ${deptNames}`);
        }
        return parts.join(" ");
      case "site":
        return `Site(s): ${target.siteIds.map(sid => { const s = sites.find(s => s.id === sid); return s ? (s.region ? `${s.name} (${s.region})` : s.name) : sid; }).join(", ")}`;
      case "department":
        return `Department(s): ${target.departmentIds.map(did => departments.find(d => d.id === did)?.name || did).join(", ")}`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolved Assignees"
      size="large"
    >
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">
              Total Resolved Users: {resolvedUsers.length}
            </span>
          </div>
          <p className="text-xs text-indigo-700">
            These are all users who will receive this assignment based on the current assignment targets.
          </p>
        </div>

        {/* Assignment Breakdown */}
        {assignments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Assignment Breakdown
            </h3>
            <div className="space-y-2">
              {assignments.map((assignment) => {
                const targetSummary = formatAssignmentTargetSummary(assignment);
                return (
                  <div
                    key={assignment.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {targetSummary}
                    </div>
                    {assignment.dueAt && (
                      <div className="text-xs text-gray-500">
                        Due: {new Date(assignment.dueAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resolved Users List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Resolved Users ({resolvedUsers.length})
          </h3>
          {resolvedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">No users resolved from current assignments.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {resolvedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.role}
                      {user.siteId && ` • ${(() => { const s = sites.find(s => s.id === user.siteId); return s ? (s.region ? `${s.name} (${s.region})` : s.name) : user.siteId; })()}`}
                      {user.departmentId && ` • ${departments.find(d => d.id === user.departmentId)?.name || user.departmentId}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}



