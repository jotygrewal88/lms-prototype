/**
 * PHASE I POLISH PACK ACCEPTANCE CHECKLIST:
 * ✓ Bulk Edit Due Date action
 * ✓ Bulk Add Note action
 * ✓ Creates ChangeLog entries for all bulk operations
 */
"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import {
  updateCompletion,
  getCurrentUser,
} from "@/lib/store";
import { logChange } from "@/lib/changeLog";
import { TrainingCompletion } from "@/types";

type BulkActionType = "edit_due_date" | "add_note";

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: BulkActionType;
  completions: TrainingCompletion[];
  onComplete: () => void;
}

export default function BulkActionModal({
  isOpen,
  onClose,
  actionType,
  completions,
  onComplete,
}: BulkActionModalProps) {
  const [newDueDate, setNewDueDate] = useState("");
  const [note, setNote] = useState("");
  const currentUser = getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();

    if (actionType === "edit_due_date") {
      if (!newDueDate) {
        alert("Please select a new due date.");
        return;
      }

      completions.forEach((completion) => {
        const oldDueDate = completion.dueAt;
        updateCompletion(completion.id, {
          dueAt: newDueDate,
        });

        logChange(
          completion.id,
          `Due date changed from ${oldDueDate} to ${newDueDate}`,
          {
            action: "due_date_change",
            oldValue: oldDueDate,
            newValue: newDueDate,
          }
        );
      });

      alert(`Due date updated for ${completions.length} completion(s).`);
    } else if (actionType === "add_note") {
      if (!note.trim()) {
        alert("Please enter a note.");
        return;
      }

      completions.forEach((completion) => {
        const existingNotes = completion.notes || "";
        const updatedNotes = existingNotes
          ? `${existingNotes}\n\n[${new Date().toLocaleString()}] ${note}`
          : `[${new Date().toLocaleString()}] ${note}`;

        updateCompletion(completion.id, {
          notes: updatedNotes,
        });

        logChange(
          completion.id,
          `Note added: ${note}`,
          {
            action: "bulk_op",
          }
        );
      });

      alert(`Note added to ${completions.length} completion(s).`);
    }

    onComplete();
    handleClose();
  };

  const handleClose = () => {
    setNewDueDate("");
    setNote("");
    onClose();
  };

  const getTitle = () => {
    switch (actionType) {
      case "edit_due_date":
        return "Edit Due Date";
      case "add_note":
        return "Add Note";
      default:
        return "Bulk Action";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Applying action to {completions.length} selected completion(s).
        </p>

        {actionType === "edit_due_date" && (
          <div>
            <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 mb-1">
              New Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="newDueDate"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {actionType === "add_note" && (
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={4}
              placeholder="Enter your note..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Apply to {completions.length} Item(s)
          </Button>
        </div>
      </form>
    </Modal>
  );
}

