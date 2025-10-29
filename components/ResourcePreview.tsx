// Epic 1C: Resource Preview Component
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileText, Link as LinkIcon, FileImage, Video, ExternalLink } from "lucide-react";
import { Resource } from "@/types";
import { getHostname } from "@/lib/uploads";

interface ResourcePreviewProps {
  resource: Resource;
  size?: "small" | "medium";
}

export default function ResourcePreview({ resource, size = "small" }: ResourcePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const dimensions = size === "small" ? { width: 80, height: 80 } : { width: 200, height: 200 };
  
  console.log('[ResourcePreview] Rendering:', { 
    type: resource.type, 
    title: resource.title, 
    url: resource.url,
    hasContent: !!resource.content,
    fileName: resource.fileName
  });

  // Image preview
  if (resource.type === "image" && resource.url && !imageError) {
    return (
      <div className="relative overflow-hidden rounded border border-gray-200" style={dimensions}>
        <Image
          src={resource.url}
          alt={resource.title}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Video preview
  if (resource.type === "video" && resource.url && !videoError) {
    return (
      <div className="rounded border border-gray-200 overflow-hidden" style={{ width: size === "small" ? 140 : 300 }}>
        <video
          src={resource.url}
          controls
          muted
          playsInline
          className="w-full"
          onError={() => setVideoError(true)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // PDF preview
  if (resource.type === "pdf" && resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <FileImage className="w-8 h-8 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {resource.fileName || resource.title}
          </div>
          <div className="text-xs text-gray-500">PDF Document</div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </a>
    );
  }

  // Link preview
  if (resource.type === "link" && resource.url) {
    const hostname = getHostname(resource.url);
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <LinkIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{resource.title}</div>
          <div className="text-xs text-gray-500 truncate">{hostname}</div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </a>
    );
  }

  // Text preview
  if (resource.type === "text" && resource.content) {
    const preview = resource.content.slice(0, 120);
    const truncated = resource.content.length > 120;
    return (
      <div className="p-3 rounded border border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2 mb-2">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-gray-900">{resource.title}</div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {preview}
          {truncated && <span className="text-gray-400">...</span>}
        </p>
      </div>
    );
  }

  // Fallback - show icon based on type
  const Icon = resource.type === "video" ? Video : 
               resource.type === "image" ? FileImage :
               resource.type === "pdf" ? FileImage :
               resource.type === "link" ? LinkIcon : FileText;

  return (
    <div className="flex items-center gap-2 p-3 rounded border border-gray-200 bg-gray-50">
      <Icon className="w-6 h-6 text-gray-400" />
      <div className="text-sm text-gray-600">{resource.title}</div>
    </div>
  );
}

