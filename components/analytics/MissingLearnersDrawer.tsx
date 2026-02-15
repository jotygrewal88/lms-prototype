// Phase II — 1M.2: Missing Learners Drawer for Skill Coverage
"use client";

import React from "react";
import Link from "next/link";
import { X, Users, BookOpen } from "lucide-react";
import { Scope, User, Course, getFullName } from "@/types";
import { learnersMissingSkill } from "@/lib/stats";

interface MissingLearnersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  scope: Scope;
}

export default function MissingLearnersDrawer({
  isOpen,
  onClose,
  skillId,
  skillName,
  scope,
}: MissingLearnersDrawerProps) {
  if (!isOpen) return null;

  const missingLearners = learnersMissingSkill(scope, skillId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Learners Missing This Skill</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {skillName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {missingLearners.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All learners have this skill
              </h3>
              <p className="text-sm text-gray-500">
                Great job! All learners in scope have earned this skill.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {missingLearners.map(({ user, siteName, deptName, assignedCourses }) => (
                <div
                  key={user.id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">
                        <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {getFullName(user)}
                        </Link>
                      </h3>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        {siteName && (
                          <span>Site: {siteName}</span>
                        )}
                        {deptName && (
                          <span>Dept: {deptName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {assignedCourses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Assigned courses that confer this skill:
                      </p>
                      <div className="space-y-1">
                        {assignedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>{course.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {assignedCourses.length === 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 italic">
                        No courses assigned that confer this skill
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


