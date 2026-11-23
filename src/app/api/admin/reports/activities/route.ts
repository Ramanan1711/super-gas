import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { OperationalActivityService } from '@/services/operational-activity.service';

export const GET = withApiHandler(async (req: NextRequest) => {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5', 10);
  const activityType = req.nextUrl.searchParams.get('type') || req.nextUrl.searchParams.get('activityType') || 'all';
  const search = req.nextUrl.searchParams.get('search') || '';
  const period = req.nextUrl.searchParams.get('period') || '';

  const result = await OperationalActivityService.getPaginatedActivities({
    page,
    limit,
    activityType,
    search,
    period,
  });

  return successResponse(result);
});
