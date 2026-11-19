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
          inventory: true,
        },
      },
      depot: true,
      documents: true,
      trips: {
        where: {
          shiftDate: {
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
    if (p.assignedVehicle?.inventory) {
      for (const s of p.assignedVehicle.inventory) {
        filledCylinders += s.filledCount || 0;
        emptyCylinders += s.emptyCount || 0;
      }
    }

    const todayTrip = p.trips?.[0];
    const todayDeliveries = todayTrip?.tasks?.length || 0;

    // Calculate unique customers count assigned/served by this partner
    const customerIdSet = new Set<string>();
    for (const trip of p.trips || []) {
      for (const task of trip.tasks || []) {
        if (task.customerId) customerIdSet.add(task.customerId);
      }
    }

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
      customersCount: customerIdSet.size,
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

  // Generate partnerCode if not provided (start after existing 5 beats DP-001..DP-005)
  let partnerCode = body.partnerCode?.trim();
  if (!partnerCode) {
    const allPartners = await prisma.deliveryPartner.findMany({
      select: { partnerCode: true },
    });
    let maxNum = 5;
    for (const p of allPartners) {
      const match = p.partnerCode?.match(/DP-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    partnerCode = `DP-${String(maxNum + 1).padStart(3, '0')}`;
  }

  // Check uniqueness of partnerCode and phone
  const existingCode = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });
  if (existingCode) {
    const allPartners = await prisma.deliveryPartner.findMany({
      select: { partnerCode: true },
    });
    let maxNum = 5;
    for (const p of allPartners) {
      const match = p.partnerCode?.match(/DP-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    partnerCode = `DP-${String(maxNum + 2).padStart(3, '0')}`;
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
