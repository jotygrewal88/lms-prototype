"use client";

import React, { useState, useMemo } from "react";
import {
  X as XIcon,
  Search,
  Loader2,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import Button from "@/components/Button";
import {
  getLibraryItems,
  createOnboardingPath,
  getOrganizationProfile,
} from "@/lib/store";
import { generateOnboardingPath } from "@/lib/mockOnboardingGenerator";
import type { JobTitle } from "@/types";

export default function BatchGenerateModal({
  uncoveredJTs,
  onClose,
  onComplete,
}: {
  uncoveredJTs: JobTitle[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    () => new Set(uncoveredJTs.map((jt) => jt.id))
  );
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [sourceSearch, setSourceSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const allSources = getLibraryItems().filter((s) => s.allowedForSynthesis);

  const filteredSources = useMemo(() => {
    if (!sourceSearch) return allSources;
    const q = sourceSearch.toLowerCase();
    return allSources.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.regulatoryRef || "").toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [allSources, sourceSearch]);

  const toggleRole = (id: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRoles = uncoveredJTs.filter((jt) => selectedRoleIds.has(jt.id));

  const handleGenerate = async () => {
    if (selectedRoles.length === 0) return;
    setIsGenerating(true);
    setCurrentIdx(0);
    setCompletedIds([]);

    const industryContext = getOrganizationProfile().industry;
    const sourceIds = [...selectedSourceIds];

    for (let i = 0; i < selectedRoles.length; i++) {
      setCurrentIdx(i);
      try {
        const result = await generateOnboardingPath({
          jobTitleId: selectedRoles[i].id,
          sourceIds,
          industryContext,
        });
        createOnboardingPath(result);
        setCompletedIds((prev) => [...prev, selectedRoles[i].id]);
      } catch {
        // continue with next
      }
    }

    setIsGenerating(false);
    onComplete();
  };

  // Generation progress screen
  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" />
        <div className="relative bg-white rounded-xl max-w-lg w-full shadow-xl p-8">
          <div className="text-center mb-6">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Generating Onboarding Paths</h3>
            <p className="text-sm text-gray-500 mt-1">
              Generating path {currentIdx + 1} of {selectedRoles.length}
            </p>
          </div>

          <div className="space-y-2">
            {selectedRoles.map((jt, i) => (
              <div
                key={jt.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  completedIds.includes(jt.id)
                    ? "bg-emerald-50 text-emerald-700"
                    : i === currentIdx
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-400"
                }`}
              >
                {completedIds.includes(jt.id) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : i === currentIdx ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className="font-medium">{jt.name}</span>
                <span className="text-gray-400 ml-auto">{jt.requiredSkills.length} skills</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Batch Generate Onboarding Paths</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Generate paths for {uncoveredJTs.length} roles at once. Each path will use the same knowledge sources
              but be customized to each role&apos;s required skills.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Roles checklist */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Roles to Generate</h4>
            <p className="text-xs text-gray-500 mb-3">Deselect any roles you want to skip.</p>
            <div className="space-y-2">
              {uncoveredJTs.map((jt) => (
                <label
                  key={jt.id}
                  className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.has(jt.id)}
                    onChange={() => toggleRole(jt.id)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{jt.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({jt.requiredSkills.length} required skills)
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Shared Source Picker */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Shared Knowledge Sources</h4>
            <p className="text-xs text-gray-500 mb-3">
              Selected: {selectedSourceIds.size}
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    placeholder="Search sources..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {filteredSources.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No sources found.</p>
                ) : (
                  filteredSources.map((src) => (
                    <label
                      key={src.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSourceIds.has(src.id)}
                        onChange={() => toggleSource(src.id)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{src.title}</p>
                        <p className="text-xs text-gray-500">
                          {src.categories?.join(", ") || "—"}
                          {src.regulatoryRef && ` • ${src.regulatoryRef}`}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={selectedRoles.length === 0}
          >
            <Rocket className="w-4 h-4" />
            Generate {selectedRoles.length} Path{selectedRoles.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
