import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';

export const POST = withApiHandler(async () => {
  return successResponse({ loggedOut: true, message: 'Logged out successfully.' });
});
