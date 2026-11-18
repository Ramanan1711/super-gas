import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations/auth.schema';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
    include: {
      depot: true,
      assignedVehicle: true,
      documents: {
        select: {
          id: true,
          type: true,
          title: true,
          docNumber: true,
          status: true,
          validUntil: true,
        },
      },
    },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  return successResponse(partner);
});

export const PATCH = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, updateProfileSchema);
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  const updatedPartner = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.altPhone !== undefined ? { altPhone: body.altPhone } : {}),
      ...(body.address ? { address: body.address } : {}),
      ...(body.bloodGroup ? { bloodGroup: body.bloodGroup } : {}),
    },
    include: {
      depot: true,
      assignedVehicle: true,
    },
  });

  return successResponse(updatedPartner);
});
