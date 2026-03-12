"use client";

import React, { useState } from "react";
import { Building2, Save, CheckCircle2, X, Plus, Info } from "lucide-react";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { getOrganizationProfile, updateOrganizationProfile, getCurrentUser, getUser } from "@/lib/store";
import type { OrganizationProfile } from "@/types";
import { getFullName } from "@/types";

// ─── Option Data ─────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Manufacturing",
  "Food & Beverage",
  "Pharmaceutical",
  "Oil & Gas",
  "Mining",
  "Utilities",
  "Construction",
  "Transportation",
  "Warehousing & Logistics",
  "Healthcare",
  "Education",
  "Government",
  "Property Management",
  "Other",
];

const INDUSTRY_SUBTYPES: Record<string, string[]> = {
  Manufacturing: [
    "Discrete Manufacturing — Metal Fabrication",
    "Discrete Manufacturing — Electronics",
    "Discrete Manufacturing — Automotive",
    "Discrete Manufacturing — Aerospace",
    "Process Manufacturing — Chemicals",
    "Process Manufacturing — Plastics",
    "General Manufacturing",
  ],
  "Food & Beverage": [
    "Food Processing",
    "Beverage Production",
    "Dairy",
    "Meat & Poultry",
    "Bakery & Confectionery",
  ],
  Pharmaceutical: [
    "Drug Manufacturing",
    "Biotech",
    "Medical Devices",
    "Clinical Research",
  ],
  "Oil & Gas": [
    "Upstream — Exploration & Production",
    "Midstream — Transportation & Storage",
    "Downstream — Refining & Distribution",
  ],
  Mining: ["Surface Mining", "Underground Mining", "Quarrying"],
  Utilities: ["Electric", "Gas", "Water & Wastewater", "Renewable Energy"],
  Construction: ["General Contracting", "Heavy Civil", "Residential", "Commercial"],
  Transportation: ["Trucking", "Rail", "Maritime", "Aviation"],
  "Warehousing & Logistics": ["Distribution Centers", "3PL", "Cold Storage"],
  Healthcare: ["Hospital", "Clinic / Ambulatory", "Long-term Care", "Home Health"],
  Education: ["K-12", "Higher Education", "Vocational / Trade"],
  Government: ["Federal", "State", "Municipal"],
  "Property Management": ["Commercial Properties", "Residential Properties", "Industrial Properties"],
  Other: ["Other"],
};

const COMPANY_SIZES = [
  "1-50 employees",
  "50-200 employees",
  "200-500 employees",
  "500-1,000 employees",
  "1,000-5,000 employees",
  "5,000+ employees",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Mexico",
  "Brazil",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Other",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const LANGUAGES = [
  "English", "Spanish", "French", "Portuguese", "German",
  "Mandarin Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Other",
];

const REGULATORY_GROUPS: { category: string; items: { id: string; label: string }[] }[] = [
  {
    category: "Safety & Health",
    items: [
      { id: "OSHA", label: "OSHA (US Occupational Safety & Health Administration)" },
      { id: "Cal/OSHA", label: "Cal/OSHA (California specific)" },
      { id: "CSA", label: "CSA (Canadian Standards Association)" },
      { id: "HSE", label: "HSE (UK Health & Safety Executive)" },
      { id: "EU Framework Directive 89/391/EEC", label: "EU Framework Directive 89/391/EEC" },
      { id: "ANSI", label: "ANSI (American National Standards Institute)" },
      { id: "NFPA", label: "NFPA (National Fire Protection Association)" },
    ],
  },
  {
    category: "Quality & Management",
    items: [
      { id: "ISO 9001", label: "ISO 9001 (Quality Management)" },
      { id: "ISO 45001", label: "ISO 45001 (Occupational Health & Safety)" },
      { id: "ISO 14001", label: "ISO 14001 (Environmental Management)" },
      { id: "ISO 22000", label: "ISO 22000 (Food Safety)" },
      { id: "IATF 16949", label: "IATF 16949 (Automotive Quality)" },
      { id: "AS9100", label: "AS9100 (Aerospace Quality)" },
    ],
  },
  {
    category: "Industry-Specific",
    items: [
      { id: "FDA 21 CFR", label: "FDA 21 CFR (Food & Drug Administration)" },
      { id: "GMP", label: "GMP (Good Manufacturing Practices)" },
      { id: "HACCP", label: "HACCP (Hazard Analysis Critical Control Points)" },
      { id: "EPA", label: "EPA (Environmental Protection Agency)" },
      { id: "DOT", label: "DOT (Department of Transportation)" },
      { id: "MSHA", label: "MSHA (Mine Safety & Health Administration)" },
      { id: "NRC", label: "NRC (Nuclear Regulatory Commission)" },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrganizationTab() {
  const currentUser = getCurrentUser();
  const profile = getOrganizationProfile();

  // Form state — initialized from current profile
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [industry, setIndustry] = useState(profile.industry);
  const [industrySubtype, setIndustrySubtype] = useState(profile.industrySubtype);
  const [companySize, setCompanySize] = useState(profile.companySize);
  const [description, setDescription] = useState(profile.description);
  const [primaryCountry, setPrimaryCountry] = useState(profile.primaryCountry);
  const [stateRegion, setStateRegion] = useState(profile.stateRegion);
  const [additionalCountries, setAdditionalCountries] = useState<string[]>(profile.additionalCountries);
  const [primaryLanguage, setPrimaryLanguage] = useState(profile.primaryLanguage);
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>(profile.additionalLanguages);
  const [regulatoryFrameworks, setRegulatoryFrameworks] = useState<string[]>(profile.regulatoryFrameworks);
  const [otherRegulations, setOtherRegulations] = useState(profile.otherRegulations);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(!!profile.companyName || !!profile.industry);

  const updatedByUser = profile.updatedByUserId ? getUser(profile.updatedByUserId) : null;

  const toggleRegulation = (id: string) => {
    setRegulatoryFrameworks((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const addCountry = (country: string) => {
    if (country && !additionalCountries.includes(country)) {
      setAdditionalCountries((prev) => [...prev, country]);
    }
  };

  const removeCountry = (country: string) => {
    setAdditionalCountries((prev) => prev.filter((c) => c !== country));
  };

  const addLanguage = (lang: string) => {
    if (lang && !additionalLanguages.includes(lang)) {
      setAdditionalLanguages((prev) => [...prev, lang]);
    }
  };

  const removeLanguage = (lang: string) => {
    setAdditionalLanguages((prev) => prev.filter((l) => l !== lang));
  };

  const handleSave = () => {
    updateOrganizationProfile({
      companyName,
      industry,
      industrySubtype,
      companySize,
      description,
      primaryCountry,
      stateRegion,
      additionalCountries,
      primaryLanguage,
      additionalLanguages,
      regulatoryFrameworks,
      otherRegulations,
      updatedByUserId: currentUser.id,
    });
    setToast({ message: "Organization profile saved", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  // Subtypes based on selected industry
  const subtypes = INDUSTRY_SUBTYPES[industry] || [];

  // Empty state
  if (!showForm) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set Up Your Organization Profile
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            Help the AI understand your business so it can generate relevant, accurate training content.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This takes about 2 minutes and dramatically improves the quality of AI-generated training.
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tell the AI about your business. This context is automatically applied to all generated training content.
        </p>
      </div>

      {/* ━━━ Section 1: Company Information ━━━ */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          Company Information
        </h3>
        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setIndustrySubtype("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Industry Sub-type */}
          {subtypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sub-type</label>
              <select
                value={industrySubtype}
                onChange={(e) => setIndustrySubtype(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Select sub-type...</option>
                {subtypes.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          )}

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="">Select size...</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Brief Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your business, operations, and facilities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* ━━━ Section 2: Geography & Jurisdiction ━━━ */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          Geography & Jurisdiction
        </h3>
        <div className="space-y-4">
          {/* Primary Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Country <span className="text-red-500">*</span>
            </label>
            <select
              value={primaryCountry}
              onChange={(e) => {
                setPrimaryCountry(e.target.value);
                if (e.target.value !== "United States") setStateRegion("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* State / Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
            {primaryCountry === "United States" ? (
              <select
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                placeholder="Enter state or region..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            )}
            {primaryCountry === "United States" && stateRegion === "California" && (
              <p className="mt-1 text-xs text-amber-600">
                California has additional requirements (Cal/OSHA). Consider adding it under Regulatory Frameworks.
              </p>
            )}
          </div>

          {/* Additional Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Countries
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {additionalCountries.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {c}
                  <button onClick={() => removeCountry(c)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => { if (e.target.value) addCountry(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="">+ Add country</option>
              {COUNTRIES.filter((c) => c !== primaryCountry && !additionalCountries.includes(c)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Languages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Languages</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {additionalLanguages.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {l}
                    <button onClick={() => removeLanguage(l)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => { if (e.target.value) addLanguage(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">+ Add</option>
                {LANGUAGES.filter((l) => l !== primaryLanguage && !additionalLanguages.includes(l)).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Section 3: Regulatory Frameworks ━━━ */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">
          Regulatory Frameworks
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Select all regulatory frameworks that apply to your organization. The AI will reference these standards when generating training.
        </p>
        <div className="space-y-5">
          {REGULATORY_GROUPS.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">{group.category}</h4>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {group.items.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regulatoryFrameworks.includes(item.id)}
                      onChange={() => toggleRegulation(item.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Other Regulations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Regulations (comma-separated)
            </label>
            <input
              type="text"
              value={otherRegulations}
              onChange={(e) => setOtherRegulations(e.target.value)}
              placeholder="e.g., ASME Boiler Code, API 510"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Info box */}
      <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          The more context you provide, the more relevant and accurate the AI-generated training will be. You can update this at any time -- changes apply to future generations, not past ones.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {profile.updatedAt && (
            <>
              Last updated:{" "}
              {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {updatedByUser && ` by ${getFullName(updatedByUser)}`}
            </>
          )}
        </p>
        <Button variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
