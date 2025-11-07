"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import { Stamp, ChevronRight } from "lucide-react";

interface SkillPassportPlaceholderProps {
  skillCount?: number;
}

export default function SkillPassportPlaceholder({ skillCount = 0 }: SkillPassportPlaceholderProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/learner/profile");
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 border-blue-200 hover:border-blue-400"
      onClick={handleClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Stamp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Skill Passport
              </h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        
        {skillCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{skillCount}</span>
              <span className="text-sm text-gray-500">total skills</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

