import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '@/lib/prisma';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  if (!segments || segments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filename = segments[segments.length - 1];
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  // 1. Try serving from local filesystem if available (e.g. localhost or committed files)
  try {
    const localFilePath = path.join(process.cwd(), 'public', 'uploads', ...segments);
    const fileBuffer = await fs.readFile(localFilePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // File not on local filesystem (common in serverless / Vercel)
  }

  // 2. Try looking up in database by claim receiptUrl containing this filename
  try {
    const claim = await prisma.expenseClaim.findFirst({
      where: {
        receiptUrl: { contains: filename },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (claim?.receiptUrl && claim.receiptUrl.startsWith('data:')) {
      const match = claim.receiptUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const dataBuffer = Buffer.from(match[2], 'base64');
        return new NextResponse(dataBuffer, {
          status: 200,
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }
  } catch (err) {
    console.warn('Could not serve upload from DB fallback:', err);
  }

  return new NextResponse('File Not Found', { status: 404 });
}
