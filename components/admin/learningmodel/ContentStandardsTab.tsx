"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Info } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import {
  getOrganization,
  setOrgStyleGuide,
  getOrganizationProfile,
  updateOrganizationProfile,
  getCurrentUser,
  subscribe,
} from "@/lib/store";
import { OrgStyleGuide } from "@/types";

const RECERT_OPTIONS = [
  { value: "annual", label: "Annual (12 months)" },
  { value: "biannual", label: "Bi-Annual (6 months)" },
  { value: "2years", label: "Every 2 Years" },
  { value: "3years", label: "Every 3 Years" },
];

export default function ContentStandardsTab() {
  const currentUser = getCurrentUser();
  const [organization, setOrganization] = useState(getOrganization());
  const [styleGuide, setStyleGuide] = useState<OrgStyleGuide>(organization.styleGuide || {});

  const profile = getOrganizationProfile();
  const [defaultPassingScore, setDefaultPassingScore] = useState(profile.defaultPassingScore);
  const [defaultRecertPeriod, setDefaultRecertPeriod] = useState(profile.defaultRecertPeriod);
  const [customAIInstructions, setCustomAIInstructions] = useState(profile.customAIInstructions);

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

  const markChanged = () => setHasChanges(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOrgStyleGuide(styleGuide);
      updateOrganizationProfile({
        defaultPassingScore,
        defaultRecertPeriod,
        customAIInstructions,
        updatedByUserId: currentUser.id,
      });
      setHasChanges(false);
      setToast({ message: "Content standards saved", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast({ message: error.message || "Failed to save", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // --- Preferred Terms ---
  const handleAddPreferredTerm = () => {
    setStyleGuide({
      ...styleGuide,
      preferredTerms: [...(styleGuide.preferredTerms || []), { term: "", preferred: "" }],
    });
    markChanged();
  };
  const handleUpdatePreferredTerm = (index: number, field: "term" | "preferred", value: string) => {
    const updated = [...(styleGuide.preferredTerms || [])];
    updated[index] = { ...updated[index], [field]: value };
    setStyleGuide({ ...styleGuide, preferredTerms: updated });
    markChanged();
  };
  const handleRemovePreferredTerm = (index: number) => {
    setStyleGuide({ ...styleGuide, preferredTerms: (styleGuide.preferredTerms || []).filter((_, i) => i !== index) });
    markChanged();
  };

  // --- Banned Terms ---
  const handleAddBannedTerm = () => {
    const term = prompt("Enter banned term:");
    if (term?.trim()) {
      setStyleGuide({ ...styleGuide, bannedTerms: [...(styleGuide.bannedTerms || []), term.trim()] });
      markChanged();
    }
  };
  const handleRemoveBannedTerm = (term: string) => {
    setStyleGuide({ ...styleGuide, bannedTerms: (styleGuide.bannedTerms || []).filter((t) => t !== term) });
    markChanged();
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Content Standards</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure tone, terminology, training defaults, and AI instructions that apply to all generated content.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ━━━ Tone ━━━ */}
        <section>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Tone</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Writing Tone</label>
            <select
              value={styleGuide.tone || "professional"}
              onChange={(e) => {
                setStyleGuide({ ...styleGuide, tone: e.target.value as any });
                markChanged();
              }}
              className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="plain">Plain</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Content will be checked against this tone for consistency.
            </p>
          </div>
        </section>

        {/* ━━━ Preferred Terms ━━━ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Preferred Terms</h3>
            <Button type="button" variant="secondary" onClick={handleAddPreferredTerm}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Define terminology replacements. The style audit will flag non-preferred terms and suggest fixes.
          </p>
          <div className="space-y-2">
            {(styleGuide.preferredTerms || []).map((pair, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={pair.term}
                  onChange={(e) => handleUpdatePreferredTerm(index, "term", e.target.value)}
                  placeholder="Term to replace"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-gray-400">&rarr;</span>
                <input
                  type="text"
                  value={pair.preferred}
                  onChange={(e) => handleUpdatePreferredTerm(index, "preferred", e.target.value)}
                  placeholder="Preferred term"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button type="button" onClick={() => handleRemovePreferredTerm(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!styleGuide.preferredTerms || styleGuide.preferredTerms.length === 0) && (
              <p className="text-sm text-gray-400 italic text-center py-4">No preferred terms configured.</p>
            )}
          </div>
        </section>

        {/* ━━━ Banned Terms ━━━ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Banned Terms</h3>
            <Button type="button" variant="secondary" onClick={handleAddBannedTerm}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Terms that should never appear in course content. The style audit will flag these.
          </p>
          <div className="flex flex-wrap gap-2">
            {(styleGuide.bannedTerms || []).map((term) => (
              <span key={term} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">
                {term}
                <button type="button" onClick={() => handleRemoveBannedTerm(term)} className="hover:text-red-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(!styleGuide.bannedTerms || styleGuide.bannedTerms.length === 0) && (
              <p className="text-sm text-gray-400 italic w-full text-center py-4">No banned terms configured.</p>
            )}
          </div>
        </section>

        {/* ━━━ Training Defaults ━━━ */}
        <section>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Training Defaults</h3>
          <p className="text-xs text-gray-500 mb-4">
            Default settings applied when generating new training content.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Certification Passing Score</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={defaultPassingScore}
                  onChange={(e) => { setDefaultPassingScore(Math.min(100, Math.max(0, Number(e.target.value)))); markChanged(); }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Recertification Period</label>
              <select
                value={defaultRecertPeriod}
                onChange={(e) => { setDefaultRecertPeriod(e.target.value); markChanged(); }}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {RECERT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ━━━ Custom AI Instructions ━━━ */}
        <section>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Custom AI Instructions</h3>
          <p className="text-xs text-gray-500 mb-4">
            Free-text context included in every AI generation. Tell the AI about conventions, naming, or anything specific.
          </p>
          <textarea
            value={customAIInstructions}
            onChange={(e) => { setCustomAIInstructions(e.target.value); markChanged(); }}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
          />
          <p className="mt-2 text-xs text-gray-400">
            Ex. &quot;We refer to maintenance workers as Maintenance Partners&quot;, &quot;Our internal SOP numbering follows: [DEPT]-[YEAR]-[SEQ]&quot;, &quot;All safety training must reference our company motto&quot;
          </p>
        </section>

        {/* Info box */}
        <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            These standards are used by the style audit in the course editor and as context for all AI-generated content.
          </p>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button type="submit" variant="primary" disabled={!hasChanges}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
