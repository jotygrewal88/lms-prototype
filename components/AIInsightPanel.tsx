"use client";

import { AIPreviewInsights } from "@/types";
import { Sparkles, FileText, AlertTriangle, Target } from "lucide-react";
import Card from "./Card";

interface AIInsightPanelProps {
  insights: AIPreviewInsights;
}

export default function AIInsightPanel({ insights }: AIInsightPanelProps) {
  const confidencePercent = Math.round((insights.confidence || 0) * 100);
  const confidenceColor = 
    confidencePercent >= 80 ? 'bg-green-500' :
    confidencePercent >= 60 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <div className="w-80 space-y-4 sticky top-6">
      {/* AI Source Card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Generation</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-600">Source</p>
                <p className="font-medium text-gray-900">
                  {insights.source.origin === 'file' 
                    ? `📄 ${insights.source.filename}`
                    : '✨ AI Prompt'
                  }
                </p>
                {insights.source.prompt && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    "{insights.source.prompt}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Confidence Card */}
      <Card>
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">AI Confidence</h3>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Content Quality</span>
              <span className="text-sm font-medium text-gray-900">{confidencePercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${confidenceColor} h-2 rounded-full transition-all`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on content structure, completeness, and source quality
            </p>
          </div>
        </div>
      </Card>

      {/* Extracted Topics Card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Extracted Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.extractedTopics.map((topic, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Detected Hazards Card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Detected Hazards</h3>
          </div>
          <ul className="space-y-2">
            {insights.detectedHazards.map((hazard, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-amber-600 mt-0.5">•</span>
                <span className="text-gray-700">{hazard}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Info Note */}
      <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
        <p className="text-xs text-purple-900">
          <strong>💡 Tip:</strong> Use section actions (Regenerate, Simplify, Expand) to refine content before accepting.
        </p>
      </div>
    </div>
  );
}

