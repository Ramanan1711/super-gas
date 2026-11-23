import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse } from '@/lib/api-response';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
]);

export const POST = withApiHandler(async (req: NextRequest) => {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return badRequestResponse('Content-Type must be multipart/form-data');
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string)?.trim().toLowerCase() || 'general';

  if (!file) {
    return badRequestResponse("No file uploaded. Please provide a file in the 'file' field.");
  }

  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return badRequestResponse(
      `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of 10 MB.`
    );
  }

  if (file.size === 0) {
    return badRequestResponse('Uploaded file is empty (0 bytes).');
  }

  // 2. Validate MIME type
  const mimeType = file.type.toLowerCase();
  const allowedExtension = ALLOWED_MIME_TYPES.get(mimeType);

  if (!allowedExtension) {
    return badRequestResponse(
      `Unsupported file type '${file.type}'. Allowed types: JPG, PNG, WEBP, and PDF.`
    );
  }

  // 3. Determine file extension and sanitize
  const originalName = file.name || `upload${allowedExtension}`;
  const extFromName = path.extname(originalName).toLowerCase();
  const finalExt = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(extFromName)
    ? extFromName
    : allowedExtension;

  // 4. Generate unique, collision-proof filename
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const safeBaseName = path
    .basename(originalName, extFromName)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 30);
  const uniqueFilename = `${safeBaseName}_${timestamp}_${randomSuffix}${finalExt}`;

  // 5. Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  const targetSubfolder = ['receipts', 'documents', 'kyc', 'general'].includes(folder)
    ? folder
    : 'general';

  // 6. Write file directly to public/uploads disk storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', targetSubfolder);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, uniqueFilename);
  await fs.writeFile(filePath, buffer);

  // Clean relative path URL for database storage to prevent PostgreSQL text column bloat
  const fileUrl = `/uploads/${targetSubfolder}/${uniqueFilename}`;

  return successResponse(
    {
      url: fileUrl,
      fileUrl,
      filename: uniqueFilename,
      originalName,
      mimeType,
      size: file.size,
      folder: targetSubfolder,
      uploadedAt: new Date().toISOString(),
    },
    201
  );
});
