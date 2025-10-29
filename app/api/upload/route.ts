// Epic 1C: File upload API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { makeUploadPath, isValidFileType } from '@/lib/uploads';
import { ResourceType } from '@/types';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(request: NextRequest) {
  console.log('[Upload API] Received upload request');
  
  try {
    const formData = await request.formData();
    console.log('[Upload API] FormData entries:', Array.from(formData.entries()).map(([k, v]) => 
      k === 'file' ? [k, v instanceof File ? `File: ${v.name}` : v] : [k, v]
    ));
    
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as ResourceType | null;

    if (!file) {
      console.log('[Upload API] Error: No file provided');
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      console.log('[Upload API] Error: No type provided');
      return NextResponse.json(
        { ok: false, error: 'Resource type required' },
        { status: 400 }
      );
    }

    console.log('[Upload API] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      resourceType: type
    });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('[Upload API] Error: File too large');
      return NextResponse.json(
        { ok: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 413 }
      );
    }

    // Validate MIME type
    if (!isValidFileType(file.type, type)) {
      console.log('[Upload API] Error: Invalid file type');
      return NextResponse.json(
        { ok: false, error: `Invalid file type "${file.type}" for resource type "${type}"` },
        { status: 400 }
      );
    }

    // Generate upload path
    const { fsPath, publicUrl } = makeUploadPath(file.name);
    console.log('[Upload API] Generated paths:', { fsPath, publicUrl });
    
    // Ensure directory exists
    const dir = path.dirname(fsPath);
    if (!existsSync(dir)) {
      console.log('[Upload API] Creating directory:', dir);
      await mkdir(dir, { recursive: true });
    }

    // Write file to disk
    console.log('[Upload API] Writing file to disk...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(fsPath, buffer);
    console.log('[Upload API] File written successfully');

    // Return success with metadata
    const response = {
      ok: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
    console.log('[Upload API] Returning success:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('[Upload API] Upload error:', error);
    return NextResponse.json(
      { ok: false, error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

