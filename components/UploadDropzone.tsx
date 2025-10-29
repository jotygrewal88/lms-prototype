// Epic 1D: Upload dropzone with drag-and-drop support
"use client";

import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface UploadDropzoneProps {
  accept: string;
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
}

export default function UploadDropzone({
  accept,
  onFiles,
  multiple = false,
  disabled = false,
  maxFiles,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;

    let processedFiles = files;
    
    // Limit number of files if maxFiles is set
    if (maxFiles && files.length > maxFiles) {
      processedFiles = files.slice(0, maxFiles);
      alert(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} will be processed.`);
    }
    
    onFiles(processedFiles);
    
    // Reset input value to allow same file selection again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
      />
      
      <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
      
      <div className="text-sm text-gray-600">
        <span className="font-medium text-indigo-600">Click to upload</span>
        {' '}or drag and drop
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        {multiple ? `Select ${maxFiles ? `up to ${maxFiles}` : 'multiple'} files` : 'Select a file'}
      </div>
    </div>
  );
}

