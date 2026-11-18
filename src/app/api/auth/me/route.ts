import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  // Extract user ID from header or default to Suresh Babu (DP-003) active session
  const authHeader = req.headers.get('authorization') || '';
  const userIdHeader = req.headers.get('x-user-id');

  let user = null;

  if (userIdHeader) {
    user = await prisma.user.findUnique({
      where: { id: userIdHeader },
      include: {
        partnerProfile: {
          include: {
            depot: true,
            assignedVehicle: true,
          },
        },
      },
    });
  } else if (authHeader.startsWith('Bearer sg_sess_')) {
    const parts = authHeader.replace('Bearer sg_sess_', '').split('_');
    const userId = parts[0];
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
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
  }

  // Fallback to active driver profile (Suresh Babu)
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
