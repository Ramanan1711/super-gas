import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

export const GET = withApiHandler(async () => {
  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { partnerCode: 'asc' },
    include: {
      assignedVehicle: {
        include: {
          inventory: {
            include: {
              product: true,
            },
          },
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
    const filledTypes: string[] = [];
    if (p.assignedVehicle?.inventory) {
      for (const s of p.assignedVehicle.inventory) {
        filledCylinders += s.filledCount || 0;
        emptyCylinders += s.emptyCount || 0;
        if (s.filledCount > 0 && s.product?.label) {
          filledTypes.push(s.product.label);
        }
      }
    }
    const cylinderTypeLabel = filledTypes.length > 0 ? filledTypes.join(', ') : 'Standard LPG Cylinders';

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
      cylinderTypeLabel,
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

  const cleanName = body.name.trim();
  const cleanPhone = body.phone.trim();
  const cleanEmail =
    body.email && typeof body.email === 'string' && body.email.trim()
      ? body.email.trim().toLowerCase()
      : null;

  // Generate partnerCode if not provided (start after existing beats DP-001..DP-005)
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

  // Check uniqueness of partnerCode
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

  // Check uniqueness of phone in DeliveryPartner
  const existingPartnerPhone = await prisma.deliveryPartner.findUnique({
    where: { phone: cleanPhone },
  });
  if (existingPartnerPhone) {
    return badRequestResponse(`A delivery partner with phone number ${cleanPhone} already exists.`);
  }

  // Find default depot if none provided
  let depotId = body.depotId;
  if (!depotId) {
    const defaultDepot = await prisma.depot.findFirst();
    depotId = defaultDepot?.id;
  }

  // Password for driver user account (default to 'supergas123' if not provided)
  const rawPassword =
    body.password && typeof body.password === 'string' && body.password.length >= 6
      ? body.password
      : 'supergas123';
  const shaHash = crypto.createHash('sha256').update(rawPassword).digest('hex');
  const passwordHash = `sha256$${shaHash}`;

  // Execute in transaction: find or create User, then create DeliveryPartner linked to User
  const result = await prisma.$transaction(async (tx) => {
    // Check if a User already exists with this phone
    let user = await tx.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: cleanPhone.startsWith('+91') ? cleanPhone.replace('+91', '').trim() : `+91${cleanPhone}` },
        ],
      },
      include: {
        partnerProfile: true,
      },
    });

    if (user) {
      if (user.partnerProfile) {
        throw new Error(
          `User with phone ${cleanPhone} is already linked to partner ${user.partnerProfile.partnerCode}.`
        );
      }
      // Ensure role is DELIVERY_PARTNER and active
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          role: UserRole.DELIVERY_PARTNER,
          isActive: true,
          passwordHash,
        },
        include: {
          partnerProfile: true,
        },
      });
    } else {
      // Create new User
      user = await tx.user.create({
        data: {
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash,
          role: UserRole.DELIVERY_PARTNER,
          isActive: true,
        },
        include: {
          partnerProfile: true,
        },
      });
    }

    // Create DeliveryPartner linked to user
    const newPartner = await tx.deliveryPartner.create({
      data: {
        partnerCode,
        name: cleanName,
        phone: cleanPhone,
        altPhone: body.altPhone ? body.altPhone.trim() : null,
        address: body.address ? body.address.trim() : null,
        bloodGroup: body.bloodGroup || null,
        status: body.status || 'ACTIVE',
        userId: user.id,
        depotId: depotId || null,
        assignedVehicleId: body.assignedVehicleId || null,
      },
      include: {
        assignedVehicle: true,
        depot: true,
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return { newPartner, user, initialPassword: rawPassword };
  });

  return successResponse(
    {
      message: `Partner ${result.newPartner.name} (${result.newPartner.partnerCode}) created successfully with active login credentials.`,
      partner: result.newPartner,
      credentials: {
        phone: result.user.phone,
        defaultPassword: result.initialPassword,
        role: result.user.role,
      },
    },
    201
  );
});
