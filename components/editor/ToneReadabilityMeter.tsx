// Epic 1G.8: Tone & Readability Meter Component
"use client";

import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { OrgStyleGuide } from '@/types';
import { estimateReadingLevel, detectTone, simplifyText, professionalizeText, clarifyText } from '@/lib/ai/readability';

interface ToneReadabilityMeterProps {
  editor: Editor;
  orgStyleGuide?: OrgStyleGuide;
  isReadOnly?: boolean;
  onQuickAdjust?: (action: 'simplify' | 'professionalize' | 'clarify') => void;
}

export default function ToneReadabilityMeter({
  editor,
  orgStyleGuide,
  isReadOnly = false,
  onQuickAdjust,
}: ToneReadabilityMeterProps) {
  const [toneStatus, setToneStatus] = useState<{ match: boolean; detected: string }>({ match: true, detected: 'plain' });
  const [readingLevel, setReadingLevel] = useState<'basic' | 'standard' | 'technical'>('standard');
  const [showPopover, setShowPopover] = useState<'tone' | 'reading' | null>(null);

  // Debounced update function
  useEffect(() => {
    if (!editor) return;

    let timeoutId: NodeJS.Timeout;

    const updateMetrics = () => {
      const html = editor.getHTML();
      
      // Update reading level
      const detectedReading = estimateReadingLevel(html);
      setReadingLevel(detectedReading);

      // Update tone
      if (orgStyleGuide?.tone) {
        const toneResult = detectTone(html, orgStyleGuide.tone);
        setToneStatus({
          match: toneResult.match,
          detected: toneResult.detected,
        });
      } else {
        setToneStatus({ match: true, detected: 'plain' });
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateMetrics, 500);
    };

    // Initial update
    updateMetrics();

    // Listen to editor updates
    editor.on('update', debouncedUpdate);
    editor.on('selectionUpdate', debouncedUpdate);

    return () => {
      clearTimeout(timeoutId);
      editor.off('update', debouncedUpdate);
      editor.off('selectionUpdate', debouncedUpdate);
    };
  }, [editor, orgStyleGuide]);

  const handleQuickAdjust = (action: 'simplify' | 'professionalize' | 'clarify') => {
    if (isReadOnly || !onQuickAdjust) return;
    onQuickAdjust(action);
    setShowPopover(null);
  };

  const readingLevelLabel = readingLevel.charAt(0).toUpperCase() + readingLevel.slice(1);
  const readingLevelWarning = orgStyleGuide?.readingLevelTarget && 
    readingLevel !== orgStyleGuide.readingLevelTarget;

  return (
    <div className="flex items-center gap-2 ml-auto">
      {/* Tone Chip */}
      <div className="relative">
        <button
          onClick={() => setShowPopover(showPopover === 'tone' ? null : 'tone')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            toneStatus.match
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
          title={toneStatus.match ? 'Tone matches style guide' : 'Tone mismatch detected'}
          disabled={isReadOnly}
        >
          {toneStatus.match ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          <span>Tone: {toneStatus.match ? 'OK' : 'Off-brand'}</span>
        </button>

        {/* Tone Popover */}
        {showPopover === 'tone' && !isReadOnly && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Quick Adjust Tone
              </div>
              <button
                onClick={() => handleQuickAdjust('professionalize')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Professionalize
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reading Level Chip */}
      <div className="relative">
        <button
          onClick={() => setShowPopover(showPopover === 'reading' ? null : 'reading')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            readingLevelWarning
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
          title={readingLevelWarning ? `Reading level (${readingLevel}) doesn't match target (${orgStyleGuide?.readingLevelTarget})` : `Reading level: ${readingLevel}`}
          disabled={isReadOnly}
        >
          {readingLevelWarning ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>Reading: {readingLevelLabel}</span>
        </button>

        {/* Reading Popover */}
        {showPopover === 'reading' && !isReadOnly && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Quick Adjust Reading
              </div>
              <button
                onClick={() => handleQuickAdjust('simplify')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 mb-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simplify
              </button>
              <button
                onClick={() => handleQuickAdjust('clarify')}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Clarify
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showPopover && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPopover(null)}
        />
      )}
    </div>
  );
}

