import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse } from '@/lib/api-response';
import { getSealedLiveAlertsQuery } from '@/lib/realtime';

export const GET = withApiHandler(async () => {
  // Ensure the table exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS live_dispatch_alerts (
      id text PRIMARY KEY,
      title text NOT NULL,
      severity text NOT NULL DEFAULT 'INFO',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const sealed = await getSealedLiveAlertsQuery();

  return successResponse({
    sealedQuery: sealed,
    realtimeUrl: process.env.NEON_REALTIME_URL,
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { title, severity = 'INFO' } = body;

  if (!title || typeof title !== 'string') {
    return badRequestResponse('Title is required');
  }

  const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await prisma.$executeRawUnsafe(
    `INSERT INTO live_dispatch_alerts (id, title, severity, created_at) VALUES ($1, $2, $3, now())`,
    id,
    title,
    severity
  );

  return successResponse(
    {
      message: 'Alert dispatched successfully',
      alert: { id, title, severity },
    },
    201
  );
});
