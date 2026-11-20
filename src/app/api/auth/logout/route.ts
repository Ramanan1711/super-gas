import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';

export const POST = withApiHandler(async () => {
  const res = successResponse({ loggedOut: true, message: 'Logged out successfully.' });
  res.cookies.delete('auth_token');
  res.cookies.delete('user_role');
  res.cookies.delete('user_id');
  res.cookies.delete('user_name');
  res.cookies.delete('partner_code');
  return res;
});
