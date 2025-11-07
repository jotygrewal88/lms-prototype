// Phase II — 1N.3: Library utility functions
import { LibraryItemFileType, LibraryItemSource } from "@/types";

/**
 * Infer file type from file extension
 */
export function inferFileTypeFromExtension(filename: string): LibraryItemFileType {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  if (ext === 'pdf') return 'pdf';
  if (ext === 'ppt') return 'ppt';
  if (ext === 'pptx') return 'pptx';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  
  // Video types
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  
  return 'other';
}

/**
 * Auto-detect source from URL hostname
 */
export function detectSourceFromUrl(url: string): LibraryItemSource {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('loom.com')) return 'loom';
    if (hostname.includes('microsoft.com') || hostname.includes('teams.microsoft.com')) return 'teams';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('vimeo.com')) return 'vimeo';
    if (hostname.includes('sharepoint.com')) return 'sharepoint';
    if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com')) return 'drive';
    
    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v') || null;
    }
  } catch {
    // Try regex fallback
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('vimeo.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || null;
    }
  } catch {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Generate embed URL for video sources
 */
export function getVideoEmbedUrl(url: string, source: LibraryItemSource): string | null {
  if (source === 'youtube') {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  
  if (source === 'vimeo') {
    const videoId = extractVimeoVideoId(url);
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }
  
  if (source === 'loom') {
    // Loom embed: typically https://www.loom.com/embed/{id}
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('loom.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const id = pathParts[pathParts.length - 1];
          return `https://www.loom.com/embed/${id}`;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  }
  
  return null;
}

/**
 * Compute checksum for duplicate detection
 * Simple hash: filename (lowercase) + '_' + fileSize
 */
export function computeChecksum(filename: string, fileSize: number): string {
  return `${filename.toLowerCase()}_${fileSize}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

