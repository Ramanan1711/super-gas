import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { verifySessionToken } from '@/lib/session';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization') || '';
  const userIdHeader = req.headers.get('x-user-id');
  const cookieUserId = req.cookies.get('user_id')?.value;
  const cookieToken = req.cookies.get('auth_token')?.value;

  let token = cookieToken;
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  const session = await verifySessionToken(token);
  const targetUserId = session?.userId || userIdHeader || cookieUserId;

  let user = null;

  if (targetUserId) {
    user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        partnerProfile: {
          include: {
            depot: true,
            assignedVehicle: true,
          },
        },
      },
    });
  }

  // Fallback to active driver profile (e.g. Varun or Suresh) if no user found
  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: 'DELIVERY_PARTNER' },
      include: {
        partnerProfile: {
          include: {
            depot: true,
            assignedVehicle: true,
          },
        },
      },
    });
  }

  if (!user) {
    return notFoundResponse('User profile');
  }

  return successResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    partnerProfile: user.partnerProfile
      ? {
          id: user.partnerProfile.id,
          partnerCode: user.partnerProfile.partnerCode,
          name: user.partnerProfile.name,
          phone: user.partnerProfile.phone,
          altPhone: user.partnerProfile.altPhone,
          address: user.partnerProfile.address,
          bloodGroup: user.partnerProfile.bloodGroup,
          status: user.partnerProfile.status,
          depot: user.partnerProfile.depot,
          assignedVehicle: user.partnerProfile.assignedVehicle,
        }
      : null,
  });
});
