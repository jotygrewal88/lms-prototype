// Epic 1C: File delete API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'URL required' },
        { status: 400 }
      );
    }

    // Validate URL is within /uploads/
    if (!url.startsWith('/uploads/')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid upload URL' },
        { status: 400 }
      );
    }

    // Convert public URL to filesystem path
    const fsPath = path.join(process.cwd(), 'public', url);

    // Check if file exists
    if (!existsSync(fsPath)) {
      return NextResponse.json(
        { ok: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete file
    await unlink(fsPath);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { ok: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}

