// Phase I Epic 3: Reminder Rule creation/editing modal
/**
 * ACCEPTANCE CHECKLIST (Epic 3):
 * ✓ Admin can create/edit reminder rules with all fields
 * ✓ Fields: name, trigger (upcoming/overdue/retraining), offsetDays, escalationAfterDays, active
 * ✓ Validation ensures required fields are filled
 * ✓ "Test Preview" shows sample message for the rule
 */

"use client";

import React, { useState, useEffect } from "react";
import { ReminderRule, ReminderTrigger } from "@/types";
import { generatePreviewMessage } from "@/lib/reminders";
import Button from "./Button";
import Modal from "./Modal";

interface ReminderRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: ReminderRule) => void;
  existingRule?: ReminderRule;
}

export default function ReminderRuleModal({
  isOpen,
  onClose,
  onSave,
  existingRule,
}: ReminderRuleModalProps) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<ReminderTrigger>("upcoming");
  const [offsetDays, setOffsetDays] = useState(0);
  const [escalationAfterDays, setEscalationAfterDays] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existingRule) {
      setName(existingRule.name);
      setTrigger(existingRule.trigger);
      setOffsetDays(existingRule.offsetDays);
      setEscalationAfterDays(existingRule.escalationAfterDays);
      setActive(existingRule.active);
    } else {
      // Reset form for new rule
      setName("");
      setTrigger("upcoming");
      setOffsetDays(0);
      setEscalationAfterDays(undefined);
      setActive(true);
    }
    setShowPreview(false);
  }, [existingRule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rule: ReminderRule = {
      id: existingRule?.id || `rule_${Date.now()}`,
      name,
      trigger,
      offsetDays,
      escalationAfterDays,
      active,
    };

    onSave(rule);
    onClose();
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const previewMessage = generatePreviewMessage({
    id: "preview",
    name,
    trigger,
    offsetDays,
    escalationAfterDays,
    active,
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingRule ? "Edit Reminder Rule" : "New Reminder Rule"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Rule Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Upcoming Due (7 days before)"
            required
          />
        </div>

        <div>
          <label htmlFor="trigger" className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Type *
          </label>
          <select
            id="trigger"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as ReminderTrigger)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="retraining">Retraining</option>
          </select>
        </div>

        <div>
          <label htmlFor="offsetDays" className="block text-sm font-medium text-gray-700 mb-1">
            Offset Days *
          </label>
          <input
            id="offsetDays"
            type="number"
            value={offsetDays}
            onChange={(e) => setOffsetDays(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., -7 for 7 days before, 3 for 3 days after"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Negative = days before due date, Positive = days after due date
          </p>
        </div>

        <div>
          <label htmlFor="escalationAfterDays" className="block text-sm font-medium text-gray-700 mb-1">
            Escalation After Days (optional)
          </label>
          <input
            id="escalationAfterDays"
            type="number"
            value={escalationAfterDays || ""}
            onChange={(e) => setEscalationAfterDays(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3"
          />
          <p className="text-xs text-gray-500 mt-1">
            If set, will escalate to manager after this many days overdue
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        {showPreview && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-1">Preview:</p>
            <p className="text-sm text-blue-800">{previewMessage}</p>
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handlePreview}>
            Test Preview
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {existingRule ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

