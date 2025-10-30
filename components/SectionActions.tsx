"use client";

import { useState } from "react";
import { RotateCcw, Minimize2, Maximize2, Undo2, Sparkles } from "lucide-react";

interface SectionActionsProps {
  sectionIndex: number;
  onRegenerate: () => Promise<void>;
  onSimplify: () => Promise<void>;
  onExpand: () => Promise<void>;
  onUndo: () => void;
  canUndo: boolean;
  isAIGenerated: boolean;
}

export default function SectionActions({
  sectionIndex,
  onRegenerate,
  onSimplify,
  onExpand,
  onUndo,
  canUndo,
  isAIGenerated
}: SectionActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setIsProcessing(true);
    setProcessingAction(action);
    try {
      await fn();
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
      {/* AI Badge */}
      {isAIGenerated && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded">
          <Sparkles className="w-3 h-3" />
          AI
        </span>
      )}

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAction('regenerate', onRegenerate)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate this section"
        >
          {isProcessing && processingAction === 'regenerate' ? (
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <RotateCcw className="w-3 h-3" />
          )}
          Regenerate
        </button>

        <button
          onClick={() => handleAction('simplify', onSimplify)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Simplify to plain language"
        >
          {isProcessing && processingAction === 'simplify' ? (
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Minimize2 className="w-3 h-3" />
          )}
          Simplify
        </button>

        <button
          onClick={() => handleAction('expand', onExpand)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Expand with more detail"
        >
          {isProcessing && processingAction === 'expand' ? (
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Maximize2 className="w-3 h-3" />
          )}
          Expand
        </button>

        {canUndo && (
          <button
            onClick={onUndo}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2 border-l border-gray-200 pl-3"
            title="Undo last change"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

