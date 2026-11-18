import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse } from '@/lib/api-response';

export const GET = withApiHandler(async () => {
  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { partnerCode: 'asc' },
    include: {
      assignedVehicle: {
        include: {
          stocks: true,
        },
      },
      depot: true,
      documents: true,
      trips: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        include: {
          tasks: true,
        },
      },
    },
  });

  type PartnerWithRelations = (typeof partners)[number];
  const formattedPartners = partners.map((p: PartnerWithRelations) => {
    let filledCylinders = 0;
    let emptyCylinders = 0;
    if (p.assignedVehicle?.stocks) {
      for (const s of p.assignedVehicle.stocks) {
        filledCylinders += s.filledCount || 0;
        emptyCylinders += s.emptyCount || 0;
      }
    }

    const todayTrip = p.trips?.[0];
    const todayDeliveries = todayTrip?.tasks?.length || 0;

    return {
      id: p.id,
      code: p.partnerCode,
      name: p.name,
      phone: p.phone,
      altPhone: p.altPhone,
      address: p.address,
      bloodGroup: p.bloodGroup,
      status: p.status,
      joiningDate: p.joiningDate,
      vehicle: p.assignedVehicle
        ? {
            id: p.assignedVehicle.id,
            regNumber: p.assignedVehicle.regNumber,
            model: p.assignedVehicle.model,
          }
        : null,
      filledCylinders,
      emptyCylinders,
      todayDeliveries,
      documentsCount: p.documents?.length || 0,
      documents: p.documents || [],
    };
  });

  return successResponse({
    partners: formattedPartners,
    count: formattedPartners.length,
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();

  if (!body.name || !body.phone) {
    return badRequestResponse('Driver name and phone number are required.');
  }

  // Generate partnerCode if not provided
  let partnerCode = body.partnerCode?.trim();
  if (!partnerCode) {
    const count = await prisma.deliveryPartner.count();
    partnerCode = `DP-${String(count + 1).padStart(3, '0')}`;
  }

  // Check uniqueness of partnerCode and phone
  const existingCode = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });
  if (existingCode) {
    const count = await prisma.deliveryPartner.count();
    partnerCode = `DP-${String(count + 2).padStart(3, '0')}`;
  }

  const existingPhone = await prisma.deliveryPartner.findUnique({
    where: { phone: body.phone.trim() },
  });
  if (existingPhone) {
    return badRequestResponse(`A partner with phone number ${body.phone} already exists.`);
  }

  // Find default depot if none provided
  let depotId = body.depotId;
  if (!depotId) {
    const defaultDepot = await prisma.depot.findFirst();
    depotId = defaultDepot?.id;
  }

  const newPartner = await prisma.deliveryPartner.create({
    data: {
      partnerCode,
      name: body.name.trim(),
      phone: body.phone.trim(),
      altPhone: body.altPhone ? body.altPhone.trim() : null,
      address: body.address ? body.address.trim() : null,
      bloodGroup: body.bloodGroup || null,
      status: body.status || 'ACTIVE',
      depotId: depotId || null,
      assignedVehicleId: body.assignedVehicleId || null,
    },
    include: {
      assignedVehicle: true,
      depot: true,
    },
  });

  return successResponse(
    {
      message: `Partner ${newPartner.name} (${newPartner.partnerCode}) created successfully.`,
      partner: newPartner,
    },
    201
  );
});
