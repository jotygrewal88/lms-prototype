"use client";

import { useState, useEffect } from "react";
import type { AISynthesisSettings, SynthesisType } from "@/types";
import { getAISynthesisSettings, updateAISynthesisSettings } from "@/lib/store";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Settings, Save, RotateCcw } from "lucide-react";

export default function SettingsTab() {
  const [settings, setSettings] = useState<AISynthesisSettings>(getAISynthesisSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getAISynthesisSettings());
  }, []);

  const handleSave = () => {
    updateAISynthesisSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: AISynthesisSettings = {
      defaultSynthesisType: "full-course",
      defaultIndustry: "Manufacturing",
      complianceStrictness: "strict",
      defaultTone: "professional",
      autoSuggestSkills: true,
      includeQuizzes: true,
      maxLessonsPerCourse: 8,
    };
    setSettings(defaults);
    updateAISynthesisSettings(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-800">AI Synthesis Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Default Synthesis Type */}
        <Card className="p-5">
          <label className="text-sm font-semibold text-gray-700 block mb-3">
            Default Course Type
          </label>
          <div className="space-y-2">
            {(
              [
                { value: "micro-lesson", label: "Micro-Lesson", desc: "Short, focused 5-15 minute lessons" },
                { value: "full-course", label: "Full Course", desc: "Comprehensive multi-lesson training" },
                { value: "onboarding-path", label: "Onboarding Path", desc: "Role-based learning paths for new hires" },
              ] as { value: SynthesisType; label: string; desc: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  settings.defaultSynthesisType === opt.value
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="synthesisType"
                  value={opt.value}
                  checked={settings.defaultSynthesisType === opt.value}
                  onChange={() =>
                    setSettings({ ...settings, defaultSynthesisType: opt.value })
                  }
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Industry & Compliance */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Industry & Compliance</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Default Industry
              </label>
              <select
                value={settings.defaultIndustry}
                onChange={(e) =>
                  setSettings({ ...settings, defaultIndustry: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Construction">Construction</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Energy">Energy</option>
                <option value="Transportation">Transportation</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Chemical">Chemical</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Compliance Strictness
              </label>
              <div className="space-y-1">
                {(
                  ["standard", "strict", "maximum"] as const
                ).map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="complianceStrictness"
                      value={level}
                      checked={settings.complianceStrictness === level}
                      onChange={() =>
                        setSettings({ ...settings, complianceStrictness: level })
                      }
                      className="accent-purple-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tone */}
        <Card className="p-5">
          <label className="text-sm font-semibold text-gray-700 block mb-3">
            Default Tone
          </label>
          <div className="flex gap-3">
            {(
              [
                { value: "professional", label: "Professional" },
                { value: "conversational", label: "Conversational" },
                { value: "technical", label: "Technical" },
              ] as { value: AISynthesisSettings["defaultTone"]; label: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 text-center p-3 rounded-lg cursor-pointer border transition-colors ${
                  settings.defaultTone === opt.value
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={settings.defaultTone === opt.value}
                  onChange={() =>
                    setSettings({ ...settings, defaultTone: opt.value })
                  }
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Feature Toggles */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Features</h4>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm text-gray-700 font-medium">Auto-Suggest Skills</div>
                <div className="text-xs text-gray-500">
                  AI will suggest skills that the course should grant on completion
                </div>
              </div>
              <div
                onClick={() =>
                  setSettings({
                    ...settings,
                    autoSuggestSkills: !settings.autoSuggestSkills,
                  })
                }
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.autoSuggestSkills ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    settings.autoSuggestSkills ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm text-gray-700 font-medium">Include Quizzes</div>
                <div className="text-xs text-gray-500">
                  AI will generate quiz questions for assessment
                </div>
              </div>
              <div
                onClick={() =>
                  setSettings({
                    ...settings,
                    includeQuizzes: !settings.includeQuizzes,
                  })
                }
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.includeQuizzes ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    settings.includeQuizzes ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </Card>

        {/* Max Lessons */}
        <Card className="p-5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Max Lessons per Course
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={20}
              value={settings.maxLessonsPerCourse}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxLessonsPerCourse: parseInt(e.target.value, 10),
                })
              }
              className="flex-1 accent-purple-600"
            />
            <span className="text-sm font-medium text-gray-700 w-8 text-center">
              {settings.maxLessonsPerCourse}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of lessons the AI can generate in a single course
          </p>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
