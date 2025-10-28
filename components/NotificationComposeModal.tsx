// Phase I AI Uplift - Unified: Notification Compose Modal (Audience-Aware)
"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Sparkles, Check, Send, Users } from "lucide-react";
import Button from "./Button";
import Toast from "./Toast";
import { ToneVariant, generateSuggestion, resolveRecipients, Audience } from "@/lib/notifyAI";
import { Notification, NotificationSource } from "@/types";
import { useScope } from "@/hooks/useScope";
import { createNotification, getSiteById, getDepartmentById, getCurrentUser } from "@/lib/store";

type RecipientMode = "managers" | "learners" | "specific";

interface NotificationComposeModalProps {
  open: boolean;
  onClose: () => void;
  initialTone?: ToneVariant;
  initialSource: NotificationSource;
  defaultRecipientMode?: RecipientMode;
  filters?: any;
  prefilledData?: { 
    subject: string; 
    body: string; 
    recipients: Array<{ userId: string; name: string; email: string }>; 
    audience?: Audience;
  };
}

export default function NotificationComposeModal({
  open,
  onClose,
  initialTone = "direct",
  initialSource,
  defaultRecipientMode = "learners",
  filters,
  prefilledData,
}: NotificationComposeModalProps) {
  const { scope } = useScope();
  const currentUser = getCurrentUser();
  const [selectedTone, setSelectedTone] = useState<ToneVariant>(initialTone);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>(defaultRecipientMode);
  const [audience, setAudience] = useState<Audience>(
    prefilledData?.audience || (defaultRecipientMode === "managers" ? "MANAGERS" : "LEARNERS")
  );
  const [recipients, setRecipients] = useState<Array<{ userId: string; name: string; email: string }>>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Update audience when recipient mode changes
  useEffect(() => {
    if (!prefilledData) {
      if (recipientMode === "managers") {
        setAudience("MANAGERS");
      } else if (recipientMode === "learners") {
        setAudience("LEARNERS");
      } else {
        setAudience("SPECIFIC");
      }
    }
  }, [recipientMode, prefilledData]);

  // Load recipients based on mode
  useEffect(() => {
    if (open) {
      if (prefilledData?.recipients) {
        setRecipients(prefilledData.recipients);
      } else {
        const resolved = resolveRecipients(recipientMode, scope);
        setRecipients(resolved);
      }
    }
  }, [recipientMode, scope, open, prefilledData]);

  // Generate audience-appropriate content
  useEffect(() => {
    if (open && !prefilledData) {
      const userIds = recipients.map(r => r.userId);
      const suggestion = generateSuggestion(audience, scope, userIds, selectedTone, filters);
      setSubject(suggestion.subject);
      setBody(suggestion.body);
    }
  }, [audience, selectedTone, open, recipients, scope, filters, prefilledData]);

  // Set prefilled data
  useEffect(() => {
    if (prefilledData) {
      setSubject(prefilledData.subject);
      setBody(prefilledData.body);
    }
  }, [prefilledData]);

  useEffect(() => {
    setSelectedTone(initialTone);
  }, [initialTone]);

  useEffect(() => {
    setRecipientMode(defaultRecipientMode);
  }, [defaultRecipientMode]);

  const handleCopy = () => {
    if (subject && body && typeof navigator !== 'undefined' && navigator.clipboard) {
      const textToCopy = `Subject: ${subject}\n\n${body}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = () => {
    if (recipients.length === 0) {
      setToastMessage("Please select at least one recipient");
      setToastType("error");
      return;
    }

    if (!subject || !body) {
      setToastMessage("Subject and body are required");
      setToastType("error");
      return;
    }

    // Get site and dept names for snapshot
    const site = scope.siteId !== "ALL" ? getSiteById(scope.siteId) : undefined;
    const dept = scope.deptId !== "ALL" ? getDepartmentById(scope.deptId) : undefined;

    // Create notification
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
      senderId: currentUser.id,
      audience: audience,
      subject,
      body,
      source: initialSource,
      recipients: [...recipients],
      scopeSnapshot: {
        siteId: scope.siteId,
        deptId: scope.deptId,
        siteName: site?.name,
        deptName: dept?.name,
      },
      contextSnapshot: {
        departmentName: dept?.name,
        siteName: site?.name,
        countOverdue: 0, // These will be in context from AI generation
        dueSoonCount: 0,
      },
      status: "SENT",
    };

    createNotification(notification);

    setToastMessage(`Notification sent to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`);
    setToastType("success");

    // Close modal after short delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleRemoveRecipient = (userId: string) => {
    setRecipients(prev => prev.filter(r => r.userId !== userId));
  };

  const toneOptions: Array<{ value: ToneVariant; label: string; description: string }> = [
    { value: "friendly", label: "Friendly", description: "Light nudge" },
    { value: "direct", label: "Direct", description: "Clear action items" },
    { value: "escalation", label: "Escalation", description: "Urgent compliance" },
    { value: "praise", label: "Praise", description: "Celebrate success" },
  ];

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Compose Notification</h2>
          <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
            {audience === "MANAGERS" ? "To Managers" : audience === "LEARNERS" ? "To Learners" : "To Specific"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* To Section */}
          {!prefilledData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <div className="space-y-3">
                {/* Recipient Mode Radio Buttons */}
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={recipientMode === "managers"}
                      onChange={() => setRecipientMode("managers")}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Managers in scope</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={recipientMode === "learners"}
                      onChange={() => setRecipientMode("learners")}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Learners in scope</span>
                  </label>
                </div>

                {/* Recipients Preview */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{recipients.length} recipient{recipients.length !== 1 ? 's' : ''} selected</span>
                </div>

                {/* Recipient Chips */}
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    {recipients.slice(0, 10).map((recipient) => (
                      <div
                        key={recipient.userId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        <span>{recipient.name}</span>
                        <button
                          onClick={() => handleRemoveRecipient(recipient.userId)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {recipients.length > 10 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{recipients.length - 10} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {prefilledData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To (from original notification)
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.userId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                  >
                    <span>{recipient.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tone Selector */}
          {!prefilledData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTone(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTone === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject (NOW EDITABLE) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subject..."
            />
          </div>

          {/* Body (EDITABLE) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter message..."
            />
          </div>
        </div>

        {/* Right: Context Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Audience</h3>
            <div className="bg-purple-50 rounded-lg p-3 text-xs">
              <div className="font-medium text-purple-900 mb-1">
                {audience === "MANAGERS" ? "Team Managers" : audience === "LEARNERS" ? "Learners" : "Specific Users"}
              </div>
              <div className="text-purple-700">
                {audience === "MANAGERS" 
                  ? "Message includes team metrics and management language"
                  : "Message includes personal assignments and direct language"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Scope</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Site:</span>{" "}
                <span className="text-gray-900 font-medium">
                  {scope.siteId !== "ALL" ? getSiteById(scope.siteId)?.name : "All Sites"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>{" "}
                <span className="text-gray-900 font-medium">
                  {scope.deptId !== "ALL" ? getDepartmentById(scope.deptId)?.name : "All Departments"}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <span className="text-gray-500">Recipients:</span>{" "}
                <span className="text-gray-900 font-medium">{recipients.length}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              Subject and body are fully editable. Changes will be saved when you send the notification.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <Button variant="primary" onClick={handleSend}>
          <Send className="w-4 h-4" />
          Send Notification
        </Button>
      </div>
          </div>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </>
  );
}
