// Epic 1C: Upload helper utilities
import { ResourceType } from "@/types";

/**
 * Sanitize filename to remove dangerous characters
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .slice(0, 200); // Limit length
}

/**
 * Generate unique upload path with timestamp and UUID
 */
export function makeUploadPath(originalName: string): { fsPath: string; publicUrl: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = crypto.randomUUID();
  const sanitized = sanitizeFileName(originalName);
  
  const fileName = `${uuid}-${sanitized}`;
  const relativePath = `uploads/${year}/${month}/${fileName}`;
  
  return {
    fsPath: `public/${relativePath}`,
    publicUrl: `/${relativePath}`,
  };
}

/**
 * Check if URL is a local upload path
 */
export function isUploadUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('/uploads/');
}

/**
 * Get accepted MIME types for a resource type
 */
export function getAcceptedMimeTypes(type: ResourceType): string[] {
  switch (type) {
    case 'image':
      return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    case 'video':
      return ['video/mp4', 'video/webm', 'video/quicktime'];
    case 'pdf':
      return ['application/pdf'];
    default:
      return [];
  }
}

/**
 * Get file accept attribute for input
 */
export function getFileAccept(type: ResourceType): string {
  switch (type) {
    case 'image':
      return 'image/jpeg,image/png,image/gif,image/webp';
    case 'video':
      return 'video/mp4,video/webm,video/quicktime';
    case 'pdf':
      return 'application/pdf';
    default:
      return '';
  }
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string, resourceType: ResourceType): boolean {
  const accepted = getAcceptedMimeTypes(resourceType);
  return accepted.includes(mimeType);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get hostname from URL
 */
export function getHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

