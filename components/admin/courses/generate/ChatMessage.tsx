"use client";

import type { ChatMessage as ChatMessageType } from "@/types";
import { markdownToHtml } from "@/lib/markdownToHtml";
import CourseOutlineCard from "./CourseOutlineCard";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 max-w-lg text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-100" : "bg-purple-100"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-blue-600" />
        ) : (
          <Bot className="w-4 h-4 text-purple-600" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] ${
          isUser
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3"
            : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none text-gray-800 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_p]:text-sm [&_li]:text-sm [&_strong]:text-gray-900 [&_details]:mt-3 [&_details]:border [&_details]:border-gray-200 [&_details]:rounded-lg [&_details]:bg-white/60 [&_summary]:px-3 [&_summary]:py-2 [&_summary]:text-xs [&_summary]:font-semibold [&_summary]:text-gray-700 [&_summary]:cursor-pointer [&_summary]:select-none [&_summary]:hover:bg-gray-50 [&_summary]:rounded-lg [&_details[open]>summary]:rounded-b-none [&_details[open]>summary]:border-b [&_details[open]>summary]:border-gray-200 [&_table]:text-xs [&_table]:w-full [&_table]:mx-0 [&_td]:px-3 [&_td]:py-1.5 [&_td]:border-0 [&_td:first-child]:font-medium [&_td:first-child]:text-gray-500 [&_td:first-child]:w-[140px] [&_details_table]:my-0 [&_details>table]:px-1 [&_details>table]:py-1"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(message.content),
            }}
          />
        )}

        {/* Attached outline */}
        {message.attachedOutline && message.attachedOutline.length > 0 && (
          <CourseOutlineCard lessons={message.attachedOutline} />
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-200" : "text-gray-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
