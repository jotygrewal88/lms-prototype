// Enhanced Notification Composer with Template Variables and Per-Recipient Preview
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, Copy, Sparkles, Check, Send, Users, Eye, ChevronLeft, ChevronRight,
  Variable, Shield, AlertCircle, Clock, CheckCircle2 
} from "lucide-react";
import Button from "./Button";
import Toast from "./Toast";
import RecipientPicker, { RecipientWithStats } from "./RecipientPicker";
import { 
  ToneVariant, 
  generateSuggestion, 
  resolveRecipients, 
  Audience,
  TEMPLATE_VARIABLES,
  buildRecipientContext,
  resolveTemplate,
  generatePersonalizedTemplate,
  RecipientContext,
} from "@/lib/notifyAI";
import { Notification, NotificationSource, getFullName } from "@/types";
import { useScope } from "@/hooks/useScope";
import { createNotification, getSiteById, getDepartmentById, getCurrentUser, getUsers } from "@/lib/store";
import { getScopedData } from "@/lib/stats";

type RecipientMode = "managers" | "learners" | "custom";

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
  initialTone = "friendly",
  initialSource,
  defaultRecipientMode = "custom",
  filters,
  prefilledData,
}: NotificationComposeModalProps) {
  const { scope } = useScope();
  const currentUser = getCurrentUser();
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Core state
  const [selectedTone, setSelectedTone] = useState<ToneVariant>(initialTone);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>(defaultRecipientMode);
  const [recipients, setRecipients] = useState<RecipientWithStats[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // Preview state
  const [previewRecipientId, setPreviewRecipientId] = useState<string | null>(null);
  const [previewContext, setPreviewContext] = useState<RecipientContext | null>(null);
  
  // UI state
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showVariableMenu, setShowVariableMenu] = useState(false);

  // Get audience type
  const audience: Audience = useMemo(() => {
    if (recipientMode === "managers") return "MANAGERS";
    if (recipientMode === "learners") return "LEARNERS";
    return "SPECIFIC";
  }, [recipientMode]);

  // Initialize recipients when mode changes
  useEffect(() => {
    if (open && recipientMode !== "custom") {
      const scoped = getScopedData(scope);
      const filteredUsers = recipientMode === "managers" 
        ? scoped.users.filter(u => u.role === "MANAGER" && u.active)
        : scoped.users.filter(u => u.role === "LEARNER" && u.active);
      
      // Convert to RecipientWithStats
      const newRecipients: RecipientWithStats[] = filteredUsers.slice(0, 50).map(user => {
        const ctx = buildRecipientContext(user.id);
        return {
          userId: user.id,
          name: getFullName(user),
          email: user.email,
          role: user.role,
          stats: ctx ? {
            overdueCount: ctx.overdueCount,
            dueSoonCount: ctx.dueSoonCount,
            completedCount: ctx.completedCount,
            assignedCount: ctx.assignedCount,
          } : { overdueCount: 0, dueSoonCount: 0, completedCount: 0, assignedCount: 0 },
        };
      });
      setRecipients(newRecipients);
    }
  }, [recipientMode, scope, open]);

  // Load prefilled data
  useEffect(() => {
    if (open && prefilledData) {
      setSubject(prefilledData.subject);
      setBody(prefilledData.body);
      // Convert prefilled recipients
      const converted: RecipientWithStats[] = prefilledData.recipients.map(r => {
        const ctx = buildRecipientContext(r.userId);
        return {
          userId: r.userId,
          name: r.name,
          email: r.email,
          role: "LEARNER",
          stats: ctx ? {
            overdueCount: ctx.overdueCount,
            dueSoonCount: ctx.dueSoonCount,
            completedCount: ctx.completedCount,
            assignedCount: ctx.assignedCount,
          } : { overdueCount: 0, dueSoonCount: 0, completedCount: 0, assignedCount: 0 },
        };
      });
      setRecipients(converted);
    }
  }, [open, prefilledData]);

  // Generate personalized template when tone changes
  useEffect(() => {
    if (open && !prefilledData && recipientMode === "custom") {
      const template = generatePersonalizedTemplate(selectedTone);
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedTone, open, prefilledData, recipientMode]);

  // Update preview context when preview recipient changes
  useEffect(() => {
    if (previewRecipientId) {
      const ctx = buildRecipientContext(previewRecipientId);
      setPreviewContext(ctx);
    } else if (recipients.length > 0) {
      // Auto-select first recipient for preview
      setPreviewRecipientId(recipients[0].userId);
    }
  }, [previewRecipientId, recipients]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedTone(initialTone);
      setRecipientMode(defaultRecipientMode);
      if (!prefilledData) {
        setRecipients([]);
        const template = generatePersonalizedTemplate(initialTone);
        setSubject(template.subject);
        setBody(template.body);
      }
    }
  }, [open, initialTone, defaultRecipientMode, prefilledData]);

  // Handlers
  const handleAddRecipient = (recipient: RecipientWithStats) => {
    setRecipients(prev => [...prev, recipient]);
    // Auto-select for preview if first recipient
    if (recipients.length === 0) {
      setPreviewRecipientId(recipient.userId);
    }
  };

  const handleRemoveRecipient = (userId: string) => {
    setRecipients(prev => prev.filter(r => r.userId !== userId));
    // Update preview if removed recipient was being previewed
    if (previewRecipientId === userId) {
      const remaining = recipients.filter(r => r.userId !== userId);
      setPreviewRecipientId(remaining.length > 0 ? remaining[0].userId : null);
    }
  };

  const handleSelectForPreview = (recipient: RecipientWithStats) => {
    setPreviewRecipientId(recipient.userId);
  };

  const handleInsertVariable = (variableKey: string) => {
    const variable = `{{${variableKey}}}`;
    const textarea = bodyTextareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + variable + body.substring(end);
      setBody(newBody);
      
      // Set cursor position after variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setBody(prev => prev + variable);
    }
    setShowVariableMenu(false);
  };

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
      setToastMessage("Please add at least one recipient");
      setToastType("error");
      return;
    }

    if (!subject || !body) {
      setToastMessage("Subject and message are required");
      setToastType("error");
      return;
    }

    // Get site and dept names for snapshot
    const site = scope.siteId !== "ALL" ? getSiteById(scope.siteId) : undefined;
    const dept = scope.deptId !== "ALL" ? getDepartmentById(scope.deptId) : undefined;

    // Create notification with template (variables will be resolved per recipient on display)
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
      senderId: currentUser.id,
      audience: audience,
      subject,
      body,
      source: initialSource,
      recipients: recipients.map(r => ({ userId: r.userId, name: r.name, email: r.email })),
      scopeSnapshot: {
        siteId: scope.siteId,
        deptId: scope.deptId,
        siteName: site?.name,
        deptName: dept?.name,
      },
      contextSnapshot: {
        departmentName: dept?.name,
        siteName: site?.name,
        countOverdue: 0,
        dueSoonCount: 0,
      },
      status: "SENT",
    };

    createNotification(notification);

    setToastMessage(`Sent personalized notifications to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`);
    setToastType("success");

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Compute resolved preview
  const resolvedPreview = useMemo(() => {
    if (!previewContext) return { subject: "", body: "" };
    return {
      subject: resolveTemplate(subject, previewContext),
      body: resolveTemplate(body, previewContext),
    };
  }, [subject, body, previewContext]);

  const toneOptions: Array<{ value: ToneVariant; label: string; icon: string }> = [
    { value: "friendly", label: "Friendly", icon: "👋" },
    { value: "direct", label: "Direct", icon: "📋" },
    { value: "escalation", label: "Escalation", icon: "⚠️" },
    { value: "praise", label: "Praise", icon: "🎉" },
  ];

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          
          <div 
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Compose Personalized Notification</h2>
                  <p className="text-xs text-gray-500">Use variables for personalized messages to each recipient</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-140px)] overflow-hidden">
              {/* Left: Compose Form */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-gray-100">
                {/* Recipients Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  
                  {/* Mode Tabs */}
                  {!prefilledData && (
                    <div className="flex gap-2 mb-3">
                      {[
                        { mode: "custom" as RecipientMode, label: "Search & Add" },
                        { mode: "learners" as RecipientMode, label: "All Learners" },
                        { mode: "managers" as RecipientMode, label: "All Managers" },
                      ].map(({ mode, label }) => (
                        <button
                          key={mode}
                          onClick={() => setRecipientMode(mode)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            recipientMode === mode
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recipient Picker (Custom mode) */}
                  {recipientMode === "custom" && !prefilledData && (
                    <RecipientPicker
                      selectedRecipients={recipients}
                      onAddRecipient={handleAddRecipient}
                      onRemoveRecipient={handleRemoveRecipient}
                      onSelectForPreview={handleSelectForPreview}
                      previewRecipientId={previewRecipientId || undefined}
                    />
                  )}

                  {/* Summary for bulk modes */}
                  {recipientMode !== "custom" && !prefilledData && recipients.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                      <Users className="w-4 h-4" />
                      <span>{recipients.length} {recipientMode} selected from current scope</span>
                    </div>
                  )}

                  {/* Prefilled recipients */}
                  {prefilledData && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                      {recipients.map(r => (
                        <span key={r.userId} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tone Selector */}
                {!prefilledData && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <div className="flex gap-2">
                      {toneOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedTone(option.value)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all ${
                            selectedTone === option.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <span>{option.icon}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject..."
                  />
                </div>

                {/* Variable Toolbar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowVariableMenu(!showVariableMenu)}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Variable className="w-3.5 h-3.5" />
                        Insert Variable
                      </button>
                      
                      {showVariableMenu && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <span className="text-xs font-medium text-gray-600">Available Variables</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {TEMPLATE_VARIABLES.map((v) => (
                              <button
                                key={v.key}
                                onClick={() => handleInsertVariable(v.key)}
                                className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                              >
                                <div>
                                  <span className="text-sm text-gray-900 font-mono">{`{{${v.key}}}`}</span>
                                  <span className="ml-2 text-xs text-gray-500">{v.label}</span>
                                </div>
                                <span className="text-xs text-gray-400 group-hover:text-gray-600">{v.example}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <textarea
                  ref={bodyTextareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message... Use {{variableName}} for personalization"
                />

                {/* Quick Variable Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TEMPLATE_VARIABLES.slice(0, 5).map((v) => (
                    <button
                      key={v.key}
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Preview Panel */}
              <div className="w-full lg:w-80 bg-gray-50 p-6 overflow-y-auto">
                <div className="sticky top-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
                  </div>

                  {previewContext ? (
                    <>
                      {/* Recipient Stats Card */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            previewContext.overdueCount > 0 ? "bg-red-100" :
                            previewContext.dueSoonCount > 0 ? "bg-amber-100" :
                            "bg-green-100"
                          }`}>
                            <Shield className={`w-4 h-4 ${
                              previewContext.overdueCount > 0 ? "text-red-600" :
                              previewContext.dueSoonCount > 0 ? "text-amber-600" :
                              "text-green-600"
                            }`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{previewContext.fullName}</div>
                            <div className="text-xs text-gray-500">{previewContext.email}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-gray-600">Overdue:</span>
                            <span className="font-semibold text-gray-900">{previewContext.overdueCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-gray-600">Due Soon:</span>
                            <span className="font-semibold text-gray-900">{previewContext.dueSoonCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-gray-600">Complete:</span>
                            <span className="font-semibold text-gray-900">{previewContext.completedCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-gray-900">{previewContext.assignedCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Resolved Message Preview */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-500">RESOLVED MESSAGE</span>
                        </div>
                        <div className="p-3">
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Subject:</div>
                            <div className="text-sm font-medium text-gray-900">{resolvedPreview.subject}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Body:</div>
                            <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                              {resolvedPreview.body}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      {recipients.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            onClick={() => {
                              const idx = recipients.findIndex(r => r.userId === previewRecipientId);
                              if (idx > 0) setPreviewRecipientId(recipients[idx - 1].userId);
                            }}
                            disabled={recipients.findIndex(r => r.userId === previewRecipientId) <= 0}
                            className="p-1.5 hover:bg-white rounded disabled:opacity-30"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-500">
                            {recipients.findIndex(r => r.userId === previewRecipientId) + 1} of {recipients.length}
                          </span>
                          <button
                            onClick={() => {
                              const idx = recipients.findIndex(r => r.userId === previewRecipientId);
                              if (idx < recipients.length - 1) setPreviewRecipientId(recipients[idx + 1].userId);
                            }}
                            disabled={recipients.findIndex(r => r.userId === previewRecipientId) >= recipients.length - 1}
                            className="p-1.5 hover:bg-white rounded disabled:opacity-30"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      Add recipients to see preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {recipients.length > 0 && (
                  <span>Each recipient will receive a personalized version of this message</span>
                )}
              </div>
              <div className="flex gap-3">
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
                      Copy Template
                    </>
                  )}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSend}
                  disabled={recipients.length === 0}
                >
                  <Send className="w-4 h-4" />
                  Send to {recipients.length} Recipient{recipients.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </>
  );
}
