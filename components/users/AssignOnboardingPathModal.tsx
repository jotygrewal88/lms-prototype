// Modal for assigning an existing published onboarding path to an EXISTING
// user. The new-user creation flow has its own inline path-assign UX
// (in NewUserModal); this modal fills the previously-missing post-creation
// case so admins can assign or change a learner's onboarding path anytime
// from their profile.
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Calendar,
  Briefcase,
  Search,
  Info,
} from "lucide-react";
import Button from "@/components/Button";
import {
  getPublishedOnboardingPaths,
  getJobTitleById,
  assignOnboardingPathToUser,
  getCurrentUser,
} from "@/lib/store";
import type { User, OnboardingPath } from "@/types";
import { getFullName } from "@/types";

interface Props {
  user: User;
  onClose: () => void;
  onAssigned: (pathTitle: string) => void;
}

export default function AssignOnboardingPathModal({ user, onClose, onAssigned }: Props) {
  const allPublished = useMemo(() => getPublishedOnboardingPaths(), []);
  const currentUser = getCurrentUser();

  const [search, setSearch] = useState("");
  // Default to true if the user has a job title — admins almost always want
  // to start with the role-matched path filter narrowed on.
  const [onlyJobTitleMatch, setOnlyJobTitleMatch] = useState<boolean>(
    Boolean(user.jobTitleId)
  );
  const [selectedPathId, setSelectedPathId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Auto-select the user's role-matched path on mount (if any), as a sensible default.
  React.useEffect(() => {
    if (!user.jobTitleId) return;
    const match = allPublished.find((p) => p.jobTitleId === user.jobTitleId);
    if (match) setSelectedPathId(match.id);
  }, [user.jobTitleId, allPublished]);

  const userJobTitle = user.jobTitleId ? getJobTitleById(user.jobTitleId) : null;

  const visiblePaths = useMemo(() => {
    let list: OnboardingPath[] = allPublished;
    if (onlyJobTitleMatch && user.jobTitleId) {
      list = list.filter((p) => p.jobTitleId === user.jobTitleId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allPublished, onlyJobTitleMatch, user.jobTitleId, search]);

  const handleAssign = () => {
    if (!selectedPathId) return;
    const result = assignOnboardingPathToUser(
      user.id,
      selectedPathId,
      startDate,
      currentUser.id,
    );
    if (!result) return;
    const path = allPublished.find((p) => p.id === selectedPathId);
    onAssigned(path?.title || "onboarding path");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Assign Onboarding Path
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigning to{" "}
              <span className="font-medium text-gray-700">{getFullName(user)}</span>
              {userJobTitle && (
                <>
                  {" "}
                  · <span className="text-gray-500">{userJobTitle.name}</span>
                </>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search paths..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
            />
          </div>
          {user.jobTitleId && (
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyJobTitleMatch}
                onChange={(e) => setOnlyJobTitleMatch(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-300"
              />
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Show only paths for {userJobTitle?.name || "this job title"}
              </span>
            </label>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {allPublished.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No published onboarding paths exist yet.
              </p>
              <Link
                href="/admin/onboarding"
                className="inline-block mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Go to Onboarding Paths →
              </Link>
            </div>
          ) : visiblePaths.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No paths match these filters.
                {onlyJobTitleMatch && user.jobTitleId && (
                  <>
                    {" "}
                    Try{" "}
                    <button
                      onClick={() => setOnlyJobTitleMatch(false)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      showing all paths
                    </button>
                    .
                  </>
                )}
              </p>
            </div>
          ) : (
            visiblePaths.map((p) => {
              const isSelected = p.id === selectedPathId;
              const jt = getJobTitleById(p.jobTitleId);
              const totalItems = p.phases.reduce((s, ph) => s + ph.courses.length, 0);
              const isJobTitleMatch =
                user.jobTitleId && p.jobTitleId === user.jobTitleId;
              return (
                <label
                  key={p.id}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="onboarding-path"
                    checked={isSelected}
                    onChange={() => setSelectedPathId(p.id)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{p.title}</span>
                      {isJobTitleMatch && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded">
                          Role match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                      {jt && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" />
                          {jt.name}
                        </span>
                      )}
                      <span>·</span>
                      <span>{p.phases.length} phase{p.phases.length === 1 ? "" : "s"}</span>
                      <span>·</span>
                      <span>{totalItems} item{totalItems === 1 ? "" : "s"}</span>
                      <span>·</span>
                      <span>{p.durationDays} day{p.durationDays === 1 ? "" : "s"}</span>
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            Start date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-300"
            />
          </label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssign} disabled={!selectedPathId}>
              {selectedPathId ? "Assign Path" : "Select a path"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
