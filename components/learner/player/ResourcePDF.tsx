// Phase II 1H.5: Resource PDF Component
// Inline PDF viewer using <iframe> with blob URL and scroll depth tracking

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import { Resource } from "@/types";
import { bumpLessonTelemetry } from "@/lib/store";
import { PLAYER_CONFIG } from "@/lib/playerConfig";

interface ResourcePDFProps {
  resource: Resource;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function ResourcePDF({ resource, courseId, lessonId, userId }: ResourcePDFProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastScrollDepthRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load PDF as blob URL for iframe
  useEffect(() => {
    if (!resource.url) return;

    const loadPdf = async () => {
      try {
        setLoadError(false);
        const response = await fetch(resource.url!);
        
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoadError(true);
        // Fallback: use original URL directly
        setPdfUrl(resource.url!);
      }
    };

    loadPdf();

    return () => {
      // Cleanup blob URL on unmount
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resource.url, retryCount]);

  const calculateScrollDepth = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return 0;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) return 0;

      const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
      const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
      const clientHeight = iframeDoc.documentElement.clientHeight || iframe.clientHeight;

      if (scrollHeight <= clientHeight) {
        return 1.0;
      }

      const scrollableHeight = scrollHeight - clientHeight;
      const scrolled = scrollTop / scrollableHeight;
      return Math.min(1.0, Math.max(0, scrolled));
    } catch (error) {
      // Cross-origin or other iframe access issues
      // If PDF is from different origin, we can't track scroll depth
      return 0;
    }
  }, []);

  const updateScrollDepth = useCallback(() => {
    const scrollDepth = calculateScrollDepth();
    
    // Only update if depth increased significantly
    if (scrollDepth > lastScrollDepthRef.current + 0.05 || scrollDepth >= 0.9) {
      lastScrollDepthRef.current = scrollDepth;
      bumpLessonTelemetry({
        courseId,
        lessonId,
        userId,
        scrollDepth,
      });
    }
  }, [courseId, lessonId, userId, calculateScrollDepth]);

  useEffect(() => {
    if (!pdfUrl || loadError) return;

    // Set up periodic scroll check
    checkIntervalRef.current = setInterval(updateScrollDepth, PLAYER_CONFIG.SCROLL_CHECK_INTERVAL_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [pdfUrl, loadError, updateScrollDepth]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoadError(false);
  };

  if (!resource.url) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">No PDF URL available.</p>
      </div>
    );
  }

  if (loadError && retryCount >= 3) {
    // After 3 retries, show fallback
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{resource.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Unable to load PDF inline. Please open it externally.
            </p>
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open PDF in New Tab
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
        <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
          {resource.fileName && (
            <p className="text-sm text-gray-600 truncate">{resource.fileName}</p>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfUrl && !loadError ? (
        <div className="relative" style={{ height: '600px' }}>
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={resource.title}
            onError={() => setLoadError(true)}
          />
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="mb-4">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto" />
          </div>
          <p className="text-gray-700 mb-4">Failed to load PDF inline.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <div className="mt-4">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open PDF in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


