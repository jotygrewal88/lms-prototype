"use client";

import React, { useState } from "react";
import { X as XIcon } from "lucide-react";
import Button from "@/components/Button";

export default function ResolveModal({
  signalTitle,
  onResolve,
  onClose,
}: {
  signalTitle: string;
  onResolve: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-md w-full shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <XIcon className="w-4 h-4" />
        </button>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Resolve Signal</h3>
        <p className="text-sm text-gray-500 mb-4">{signalTitle}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Describe what was done to address this signal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onResolve(notes)}>
            Resolve
          </Button>
        </div>
      </div>
    </div>
  );
}
