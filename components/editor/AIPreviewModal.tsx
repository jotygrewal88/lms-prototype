"use client";

import { X, Check } from 'lucide-react';
import Button from '../Button';

interface AIPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  originalContent: string;
  aiContent: string;
  actionType: 'rewrite' | 'expand' | 'simplify';
  isLoading?: boolean;
}

export default function AIPreviewModal({
  isOpen,
  onClose,
  onAccept,
  originalContent,
  aiContent,
  actionType,
  isLoading = false,
}: AIPreviewModalProps) {
  if (!isOpen) return null;

  const actionLabels = {
    rewrite: 'Rewrite',
    expand: 'Expand',
    simplify: 'Simplify',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              AI {actionLabels[actionType]} Preview
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Review the AI-generated content before accepting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Original</h3>
              <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div dangerouslySetInnerHTML={{ __html: originalContent }} />
              </div>
            </div>

            {/* AI Result */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Result</h3>
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div dangerouslySetInnerHTML={{ __html: aiContent }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onAccept}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept & Replace
          </Button>
        </div>
      </div>
    </div>
  );
}








