"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";
import ChatMessageBubble from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import {
  ChevronDown,
  SquarePen,
  PanelRightClose,
  Link,
  Mic,
  Paperclip,
  ArrowUp,
  Check,
  Sparkles,
} from "lucide-react";

interface ChatAreaProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  hasOutline?: boolean;
  onSaveToDrafts?: () => void;
  isSaving?: boolean;
  mode?: "generate" | "editor";
  courseTitle?: string;
  userName?: string;
  onNewConversation?: () => void;
  onClose?: () => void;
  onCollapse?: () => void;
}

type AgentMode = "agent" | "ask";

export default function ChatArea({
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSend,
  hasOutline = false,
  onSaveToDrafts,
  isSaving = false,
  mode = "editor",
  userName,
  onCollapse,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [agentMode, setAgentMode] = useState<AgentMode>("agent");
  const [isModeOpen, setIsModeOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    if (mode === "editor") {
      textareaRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [mode]);

  // Close mode dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setIsModeOpen(false);
      }
    };
    if (isModeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModeOpen]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 120; // ~4 lines
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend();
      }
    }
  };

  const isEditorMode = mode === "editor";
  const hasInput = inputValue.trim().length > 0;
  const visibleMessages = messages.filter(
    (m) => m.role !== "system" || !m.content.startsWith("Setup context:")
  );

  // ── Generate mode (unchanged legacy) ──
  if (!isEditorMode) {
    return (
      <div className="w-80 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {visibleMessages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-200 px-3 py-2.5 bg-white flex-shrink-0">
          {hasOutline && onSaveToDrafts && (
            <div className="mb-2 flex justify-center">
              <button
                onClick={onSaveToDrafts}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isTyping}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:bg-gray-50"
            />
            <button
              onClick={onSend}
              disabled={!hasInput || isTyping}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Editor mode — UpKeep Agent design ──
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ═══ Top Bar ═══ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        {/* Mode toggle */}
        <div className="relative" ref={modeDropdownRef}>
          <button
            onClick={() => setIsModeOpen(!isModeOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-800"
          >
            {agentMode === "agent" ? "Agent" : "Ask"}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isModeOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Mode dropdown popover */}
          {isModeOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              <div className="p-1.5">
                <button
                  onClick={() => { setAgentMode("agent"); setIsModeOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    agentMode === "agent"
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">Agent</span>
                    {agentMode === "agent" && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Apply changes immediately; deletions still require confirmation
                  </p>
                </button>
                <button
                  onClick={() => { setAgentMode("ask"); setIsModeOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    agentMode === "ask"
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">Ask</span>
                    {agentMode === "ask" && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Require approval before any change is applied
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Utility icons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            title="New conversation"
          >
            <SquarePen className="w-[18px] h-[18px]" />
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              title="Hide panel"
            >
              <PanelRightClose className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* ═══ Chat Messages Area ═══ */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Empty greeting state */}
        {visibleMessages.length === 0 && !isTyping && (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Hi {userName || "there"}. How can I help?
            </h2>
          </div>
        )}

        {/* Messages */}
        {visibleMessages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ═══ Input Bar ═══ */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        {/* Textarea */}
        <div className="border border-gray-200 rounded-2xl bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={isTyping}
            rows={1}
            className="w-full px-4 pt-3 pb-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none resize-none focus:outline-none disabled:opacity-50"
            style={{ minHeight: "36px", maxHeight: "120px" }}
          />

          {/* Action icons row */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            {/* Left icons */}
            <div className="flex items-center gap-0.5">
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Attach link"
              >
                <Link className="w-[18px] h-[18px]" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Voice input"
              >
                <Mic className="w-[18px] h-[18px]" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Attach file"
              >
                <Paperclip className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={onSend}
              disabled={!hasInput || isTyping}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                hasInput && !isTyping
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
