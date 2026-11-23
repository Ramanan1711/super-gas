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
  const startDate = req.nextUrl.searchParams.get('startDate') || req.nextUrl.searchParams.get('from') || undefined;
  const endDate = req.nextUrl.searchParams.get('endDate') || req.nextUrl.searchParams.get('to') || undefined;

  const result = await OperationalActivityService.getPaginatedActivities({
    page,
    limit,
    activityType,
    search,
    period,
    startDate,
    endDate,
  });

  return successResponse(result);
});
