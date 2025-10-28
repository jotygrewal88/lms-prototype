// Phase I AI Uplift - Unified: Notification Compose Button
"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "./Button";
import NotificationComposeModal from "./NotificationComposeModal";
import { ToneVariant } from "@/lib/notifyAI";
import { CompletionStatus, NotificationSource } from "@/types";

type RecipientMode = "managers" | "learners" | "specific";

interface NotificationComposeButtonProps {
  source: NotificationSource;
  filters?: {
    site?: string;
    department?: string;
    training?: string;
    status?: CompletionStatus | "";
    managerId?: string;
  };
  initialTone?: ToneVariant;
  defaultRecipientMode?: RecipientMode;
  label?: string;
  variant?: "primary" | "secondary";
}

export default function NotificationComposeButton({
  source,
  filters,
  initialTone = "direct",
  defaultRecipientMode = "learners",
  label = "Compose Notification",
  variant = "primary",
}: NotificationComposeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setIsModalOpen(true)}>
        <Sparkles className="w-4 h-4" />
        {label}
      </Button>

      <NotificationComposeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        initialTone={initialTone}
        initialSource={source}
        defaultRecipientMode={defaultRecipientMode}
      />
    </>
  );
}
