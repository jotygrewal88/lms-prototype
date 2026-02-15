// Skills V2: Grant Skill to User Modal (placeholder — full implementation in follow-up)
"use client";

import React from "react";
import Modal from "@/components/Modal";

interface GrantSkillModalProps {
  userId?: string;
  onClose: () => void;
}

export default function GrantSkillModal({ userId, onClose }: GrantSkillModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Grant Skill">
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium mb-2">Coming Soon</p>
        <p className="text-sm">
          Manual skill granting will be implemented in the next phase.
        </p>
      </div>
    </Modal>
  );
}
