"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AIInput } from "@/types";
import { Sparkles, Upload, X, FileText, File, CheckCircle2 } from "lucide-react";
import { validateFileType, validateFileSize, formatFileSize, getFileTypeLabel } from "@/lib/ai/parseDocument";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (input: AIInput, file?: File) => Promise<void>;
  initialPrompt?: string;
}

export default function AIGenerateModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  initialPrompt = "" 
}: AIGenerateModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'prompt' | 'file'>('prompt');
  
  // Prompt mode state
  const [prompt, setPrompt] = useState(initialPrompt);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [audienceLevel, setAudienceLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [tone, setTone] = useState<"Practical" | "Concise" | "Compliance">("Practical");
  const [targetDuration, setTargetDuration] = useState<number>(45);
  
  // File mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContext, setFileContext] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Common state
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (activeTab === 'prompt' && prompt.trim().length < 8) return;
    if (activeTab === 'file' && !selectedFile) return;
    
    setIsGenerating(true);
    try {
      const input: AIInput = {
        prompt: activeTab === 'prompt' ? prompt.trim() : fileContext.trim(),
        audienceLevel,
        tone,
        targetDurationMins: targetDuration,
      };
      
      await onGenerate(input, selectedFile || undefined);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setFileError(null);
    
    // Validate file type
    if (!validateFileType(file)) {
      setFileError("Only PDF, DOCX, and TXT files are supported");
      return;
    }
    
    // Validate file size
    if (!validateFileSize(file, 5)) {
      setFileError("File size exceeds 5MB limit");
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
      // Reset state on close
      setActiveTab('prompt');
      setSelectedFile(null);
      setFileContext("");
      setFileError(null);
    }
  };

  const canGenerate = activeTab === 'prompt' 
    ? prompt.trim().length >= 8 
    : selectedFile !== null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="large">
      <div className="space-y-6 p-6">
        {/* Header with sparkle icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Course with AI</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {activeTab === 'prompt' 
                ? "Describe your training topic and we'll create a draft course"
                : "Upload a document and we'll convert it into a training course"
              }
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('prompt')}
            disabled={isGenerating}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'prompt'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            From Prompt
          </button>
          <button
            onClick={() => setActiveTab('file')}
            disabled={isGenerating}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            From File
          </button>
        </div>

        {/* Prompt Tab Content */}
        {activeTab === 'prompt' && (
          <>
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your training topic *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create OSHA ladder safety training for warehouse workers"
                rows={4}
                disabled={isGenerating}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              {prompt.trim().length > 0 && prompt.trim().length < 8 && (
                <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <span>⚠️</span>
                  Please enter at least 8 characters
                </p>
              )}
              {prompt.trim().length >= 8 && (
                <p className="text-sm text-gray-500 mt-1.5">
                  {prompt.trim().length} characters
                </p>
              )}
            </div>

            {/* Advanced Options */}
            <details className="border-t pt-4">
              <summary 
                className="cursor-pointer text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
                Advanced Options (optional)
              </summary>
              <div className="mt-4 space-y-4">
                {/* Audience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Level
                  </label>
                  <select
                    value={audienceLevel}
                    onChange={(e) => setAudienceLevel(e.target.value as any)}
                    disabled={isGenerating}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50"
                  >
                    <option value="Beginner">Beginner - New to the topic</option>
                    <option value="Intermediate">Intermediate - Some experience</option>
                    <option value="Advanced">Advanced - Expert level</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    disabled={isGenerating}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50"
                  >
                    <option value="Practical">Practical - Hands-on and actionable</option>
                    <option value="Concise">Concise - Brief and to the point</option>
                    <option value="Compliance">Compliance - Regulatory focused</option>
                  </select>
                </div>

                {/* Target Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value) || 45)}
                    min="15"
                    max="180"
                    step="15"
                    disabled={isGenerating}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Suggested duration for the course (15-180 minutes)
                  </p>
                </div>
              </div>
            </details>

            {/* Info Note */}
            {!isGenerating && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-purple-900">
                <strong>💡 Tip:</strong> Be specific about your training needs. Mention the audience, key topics, and any specific standards or requirements.
              </div>
            )}
          </>
        )}

        {/* File Tab Content */}
        {activeTab === 'file' && (
          <>
            {/* File Upload Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document *
              </label>
              
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, or TXT (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileInputChange}
                    disabled={isGenerating}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {selectedFile.name.endsWith('.pdf') ? (
                        <File className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-500">{getFileTypeLabel(selectedFile)}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Ready to upload</span>
                      </div>
                    </div>
                    <button
                      onClick={handleClearFile}
                      disabled={isGenerating}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  {fileError}
                </p>
              )}
            </div>

            {/* Optional Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (optional)
              </label>
              <textarea
                value={fileContext}
                onChange={(e) => setFileContext(e.target.value)}
                placeholder="e.g., Focus on warehouse environments, emphasize PPE requirements"
                rows={3}
                disabled={isGenerating}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Provide additional guidance to customize the generated course
              </p>
            </div>

            {/* Info Note */}
            {!isGenerating && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                <strong>📄 Note:</strong> Upload an SOP, JHA, policy document, or training material. The AI will extract key information and structure it into a comprehensive course.
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {activeTab === 'file' ? 'Processing...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Course
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
