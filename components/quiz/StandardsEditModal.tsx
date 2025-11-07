// Epic 1G.7: Standards Edit Modal Component
"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { CourseStandards } from "@/types";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

interface StandardsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  standards: CourseStandards | undefined;
  onSave: (standards: CourseStandards) => void;
  isReadOnly?: boolean;
}

export default function StandardsEditModal({
  isOpen,
  onClose,
  standards,
  onSave,
  isReadOnly = false,
}: StandardsEditModalProps) {
  const [oshaCodes, setOshaCodes] = useState<string[]>([]);
  const [mshaCodes, setMshaCodes] = useState<string[]>([]);
  const [epaCodes, setEpaCodes] = useState<string[]>([]);
  const [otherStandards, setOtherStandards] = useState<{ label: string; codes: string[] }[]>([]);
  const [newOsha, setNewOsha] = useState("");
  const [newMsha, setNewMsha] = useState("");
  const [newEpa, setNewEpa] = useState("");
  const [newOtherLabel, setNewOtherLabel] = useState("");
  const [newOtherCode, setNewOtherCode] = useState("");

  useEffect(() => {
    if (standards) {
      setOshaCodes(standards.osha || []);
      setMshaCodes(standards.msha || []);
      setEpaCodes(standards.epa || []);
      setOtherStandards(standards.other || []);
    } else {
      setOshaCodes([]);
      setMshaCodes([]);
      setEpaCodes([]);
      setOtherStandards([]);
    }
  }, [standards, isOpen]);

  const handleSave = () => {
    const updated: CourseStandards = {};
    if (oshaCodes.length > 0) updated.osha = oshaCodes;
    if (mshaCodes.length > 0) updated.msha = mshaCodes;
    if (epaCodes.length > 0) updated.epa = epaCodes;
    if (otherStandards.length > 0) updated.other = otherStandards;
    onSave(updated);
    onClose();
  };

  const addOsha = () => {
    if (newOsha.trim() && !oshaCodes.includes(newOsha.trim())) {
      setOshaCodes([...oshaCodes, newOsha.trim()]);
      setNewOsha("");
    }
  };

  const removeOsha = (code: string) => {
    setOshaCodes(oshaCodes.filter(c => c !== code));
  };

  const addMsha = () => {
    if (newMsha.trim() && !mshaCodes.includes(newMsha.trim())) {
      setMshaCodes([...mshaCodes, newMsha.trim()]);
      setNewMsha("");
    }
  };

  const removeMsha = (code: string) => {
    setMshaCodes(mshaCodes.filter(c => c !== code));
  };

  const addEpa = () => {
    if (newEpa.trim() && !epaCodes.includes(newEpa.trim())) {
      setEpaCodes([...epaCodes, newEpa.trim()]);
      setNewEpa("");
    }
  };

  const removeEpa = (code: string) => {
    setEpaCodes(epaCodes.filter(c => c !== code));
  };

  const addOther = () => {
    if (newOtherLabel.trim() && newOtherCode.trim()) {
      const existing = otherStandards.find(o => o.label === newOtherLabel.trim());
      if (existing) {
        if (!existing.codes.includes(newOtherCode.trim())) {
          existing.codes.push(newOtherCode.trim());
          setOtherStandards([...otherStandards]);
        }
      } else {
        setOtherStandards([...otherStandards, {
          label: newOtherLabel.trim(),
          codes: [newOtherCode.trim()],
        }]);
      }
      setNewOtherLabel("");
      setNewOtherCode("");
    }
  };

  const removeOtherCode = (label: string, code: string) => {
    const updated = otherStandards.map(o => {
      if (o.label === label) {
        return { ...o, codes: o.codes.filter(c => c !== code) };
      }
      return o;
    }).filter(o => o.codes.length > 0);
    setOtherStandards(updated);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Standards</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* OSHA */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">OSHA Standards</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newOsha}
                onChange={(e) => setNewOsha(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOsha())}
                disabled={isReadOnly}
                placeholder="e.g., 1910.178"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {!isReadOnly && (
                <Button onClick={addOsha} variant="secondary" >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {oshaCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200"
                >
                  {code}
                  {!isReadOnly && (
                    <button
                      onClick={() => removeOsha(code)}
                      className="hover:text-red-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* MSHA */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">MSHA Standards</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMsha}
                onChange={(e) => setNewMsha(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMsha())}
                disabled={isReadOnly}
                placeholder="e.g., 30 CFR Part 46"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {!isReadOnly && (
                <Button onClick={addMsha} variant="secondary" >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {mshaCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200"
                >
                  {code}
                  {!isReadOnly && (
                    <button
                      onClick={() => removeMsha(code)}
                      className="hover:text-yellow-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* EPA */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">EPA Standards</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEpa}
                onChange={(e) => setNewEpa(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEpa())}
                disabled={isReadOnly}
                placeholder="e.g., 40 CFR Part 262"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {!isReadOnly && (
                <Button onClick={addEpa} variant="secondary" >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {epaCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200"
                >
                  {code}
                  {!isReadOnly && (
                    <button
                      onClick={() => removeEpa(code)}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Other */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Other Standards</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newOtherLabel}
                onChange={(e) => setNewOtherLabel(e.target.value)}
                disabled={isReadOnly}
                placeholder="Label (e.g., ANSI)"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              <input
                type="text"
                value={newOtherCode}
                onChange={(e) => setNewOtherCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOther())}
                disabled={isReadOnly}
                placeholder="Code"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
              {!isReadOnly && (
                <Button onClick={addOther} variant="secondary" >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {otherStandards.map((standard, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 mb-2">{standard.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {standard.codes.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200"
                      >
                        {code}
                        {!isReadOnly && (
                          <button
                            onClick={() => removeOtherCode(standard.label, code)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

