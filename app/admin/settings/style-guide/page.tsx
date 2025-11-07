// Epic 1G.7: Style Guide Settings Page (Admin only)
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { getOrganization, setOrgStyleGuide, subscribe } from "@/lib/store";
import { OrgStyleGuide } from "@/types";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function StyleGuidePage() {
  const [organization, setOrganization] = useState(getOrganization());
  const [styleGuide, setStyleGuide] = useState<OrgStyleGuide>(organization.styleGuide || {});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const org = getOrganization();
      setOrganization(org);
      setStyleGuide(org.styleGuide || {});
    });
    return unsubscribe;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOrgStyleGuide(styleGuide);
      setHasChanges(false);
      setToast({ message: "Style guide updated successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast({ message: error.message || "Failed to update style guide", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddPreferredTerm = () => {
    setStyleGuide({
      ...styleGuide,
      preferredTerms: [...(styleGuide.preferredTerms || []), { term: "", preferred: "" }],
    });
    setHasChanges(true);
  };

  const handleUpdatePreferredTerm = (index: number, field: "term" | "preferred", value: string) => {
    const updated = [...(styleGuide.preferredTerms || [])];
    updated[index] = { ...updated[index], [field]: value };
    setStyleGuide({ ...styleGuide, preferredTerms: updated });
    setHasChanges(true);
  };

  const handleRemovePreferredTerm = (index: number) => {
    const updated = (styleGuide.preferredTerms || []).filter((_, i) => i !== index);
    setStyleGuide({ ...styleGuide, preferredTerms: updated });
    setHasChanges(true);
  };

  const handleAddBannedTerm = () => {
    const term = prompt("Enter banned term:");
    if (term && term.trim()) {
      setStyleGuide({
        ...styleGuide,
        bannedTerms: [...(styleGuide.bannedTerms || []), term.trim()],
      });
      setHasChanges(true);
    }
  };

  const handleRemoveBannedTerm = (term: string) => {
    setStyleGuide({
      ...styleGuide,
      bannedTerms: (styleGuide.bannedTerms || []).filter(t => t !== term),
    });
    setHasChanges(true);
  };

  const handleAddGlossaryEntry = () => {
    setStyleGuide({
      ...styleGuide,
      glossary: [...(styleGuide.glossary || []), { term: "", definition: "" }],
    });
    setHasChanges(true);
  };

  const handleUpdateGlossaryEntry = (index: number, field: "term" | "definition", value: string) => {
    const updated = [...(styleGuide.glossary || [])];
    updated[index] = { ...updated[index], [field]: value };
    setStyleGuide({ ...styleGuide, glossary: updated });
    setHasChanges(true);
  };

  const handleRemoveGlossaryEntry = (index: number) => {
    const updated = (styleGuide.glossary || []).filter((_, i) => i !== index);
    setStyleGuide({ ...styleGuide, glossary: updated });
    setHasChanges(true);
  };

  return (
    <RouteGuard>
      <AdminLayout>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg border-2 border-indigo-100 p-6 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Style Guide</h1>
                <p className="text-sm text-gray-600">
                  Configure content style preferences, terminology, and consistency rules for all courses.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Tone */}
            <Card className="p-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 -m-6 mb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Tone</h2>
                </div>
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preferred Writing Tone
              </label>
              <select
                value={styleGuide.tone || "professional"}
                onChange={(e) => {
                  setStyleGuide({ ...styleGuide, tone: e.target.value as any });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
              >
                <option value="plain">Plain</option>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                This tone will be checked against course content for consistency.
              </p>
            </Card>

            {/* Reading Level Target */}
            <Card className="p-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 -m-6 mb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Reading Level Target</h2>
                </div>
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Target Reading Level
              </label>
              <select
                value={styleGuide.readingLevelTarget || "standard"}
                onChange={(e) => {
                  setStyleGuide({ ...styleGuide, readingLevelTarget: e.target.value as any });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="technical">Technical</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Content will be flagged if it exceeds this reading level.
              </p>
            </Card>

            {/* Preferred Terms */}
            <Card className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 -m-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-900">Preferred Terms</h2>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddPreferredTerm}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Define preferred terminology replacements. Content using non-preferred terms will be flagged.
              </p>
              <div className="space-y-3">
                {(styleGuide.preferredTerms || []).map((pair, index) => (
                  <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={pair.term}
                      onChange={(e) => handleUpdatePreferredTerm(index, "term", e.target.value)}
                      placeholder="Term to replace"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                      type="text"
                      value={pair.preferred}
                      onChange={(e) => handleUpdatePreferredTerm(index, "preferred", e.target.value)}
                      placeholder="Preferred term"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreferredTerm(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!styleGuide.preferredTerms || styleGuide.preferredTerms.length === 0) && (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No preferred terms configured. Add terms to enforce consistent terminology.
                  </p>
                )}
              </div>
            </Card>

            {/* Banned Terms */}
            <Card className="p-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 -m-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-900">Banned Terms</h2>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddBannedTerm}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Terms that should never appear in course content. Content using these terms will be flagged.
              </p>
              <div className="flex flex-wrap gap-2">
                {(styleGuide.bannedTerms || []).map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200"
                  >
                    {term}
                    <button
                      type="button"
                      onClick={() => handleRemoveBannedTerm(term)}
                      className="hover:text-red-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(!styleGuide.bannedTerms || styleGuide.bannedTerms.length === 0) && (
                  <p className="text-sm text-gray-400 italic w-full text-center py-4">
                    No banned terms configured.
                  </p>
                )}
              </div>
            </Card>

            {/* Glossary */}
            <Card className="p-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 -m-6 mb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-900">Glossary</h2>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddGlossaryEntry}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Define key terms and their definitions for reference.
              </p>
              <div className="space-y-3">
                {(styleGuide.glossary || []).map((entry, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={entry.term}
                        onChange={(e) => handleUpdateGlossaryEntry(index, "term", e.target.value)}
                        placeholder="Term"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGlossaryEntry(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={entry.definition}
                      onChange={(e) => handleUpdateGlossaryEntry(index, "definition", e.target.value)}
                      placeholder="Definition"
                      rows={2}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>
                ))}
                {(!styleGuide.glossary || styleGuide.glossary.length === 0) && (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No glossary entries. Add key terms and definitions.
                  </p>
                )}
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                disabled={!hasChanges}
                className="shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AdminLayout>
    </RouteGuard>
  );
}

