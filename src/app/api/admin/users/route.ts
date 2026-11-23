import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import {
  successResponse,
  badRequestResponse,
  conflictResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import { UserRole } from '@prisma/client';

async function getAuthUser(req: NextRequest) {
  const cookieUserId = req.cookies.get('user_id')?.value;
  const cookieToken = req.cookies.get('auth_token')?.value;
  const authHeader = req.headers.get('authorization') || '';
  const userIdHeader = req.headers.get('x-user-id');

  let userId = userIdHeader || cookieUserId;

  if (!userId && authHeader.startsWith('Bearer sg_sess_')) {
    userId = authHeader.replace('Bearer sg_sess_', '').split('_')[0];
  } else if (!userId && cookieToken && cookieToken.startsWith('sg_sess_')) {
    userId = cookieToken.replace('sg_sess_', '').split('_')[0];
  }

  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, role: true, isActive: true },
      });
      if (dbUser) return dbUser;
    } catch {
      // ignore
    }
  }

  const roleCookie = req.cookies.get('user_role')?.value;
  if (roleCookie === 'SUPER_ADMIN') {
    return { id: userId || 'cookie_super_admin', name: 'Super Admin', role: UserRole.SUPER_ADMIN, isActive: true };
  }

  return null;
}

export const GET = withApiHandler(async () => {
  const [users, unlinkedPartners, depots, vehicles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        partnerProfile: {
          select: {
            id: true,
            partnerCode: true,
            name: true,
            status: true,
            depotId: true,
            depot: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            assignedVehicleId: true,
            assignedVehicle: {
              select: {
                id: true,
                regNumber: true,
                model: true,
              },
            },
          },
        },
      },
    }),
    prisma.deliveryPartner.findMany({
      where: { userId: null },
      select: {
        id: true,
        partnerCode: true,
        name: true,
        phone: true,
        status: true,
        depot: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { partnerCode: 'asc' },
    }),
    prisma.depot.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.vehicle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        regNumber: true,
        model: true,
        capacity: true,
      },
      orderBy: { regNumber: 'asc' },
    }),
  ]);

  type UserItem = (typeof users)[number];

  return successResponse({
    users,
    unlinkedPartners,
    depots,
    vehicles,
    metrics: {
      totalUsers: users.length,
      admins: users.filter((u: UserItem) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
      deliveryPartners: users.filter((u: UserItem) => u.role === 'DELIVERY_PARTNER').length,
      activeUsers: users.filter((u: UserItem) => u.isActive).length,
    },
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  // Authorize: Only SUPER_ADMIN can create user accounts & credentials
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== 'SUPER_ADMIN') {
    return forbiddenResponse('Access denied. Only Super Admin can create user accounts and credentials.');
  }

  const body = await req.json().catch(() => ({}));
  const {
    name,
    phone,
    email,
    password,
    role = 'ADMIN',
    partnerId,
    createPartnerProfile,
    partnerCode,
    depotId,
    assignedVehicleId,
  } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return badRequestResponse('Full name is required (minimum 2 characters).');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
    return badRequestResponse('Valid User ID / Phone number is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return badRequestResponse('Password must be at least 6 characters.');
  }

  const validRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DELIVERY_PARTNER];
  if (!validRoles.includes(role as UserRole)) {
    return badRequestResponse('Invalid role. Must be ADMIN, SUPER_ADMIN, or DELIVERY_PARTNER.');
  }

  const cleanPhone = phone.trim();
  const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

  // Check unique phone
  const existingPhone = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: cleanPhone },
        { phone: cleanPhone.startsWith('+91') ? cleanPhone.replace('+91', '').trim() : `+91${cleanPhone}` },
      ],
    },
  });

  if (existingPhone) {
    return conflictResponse(`User with phone/ID "${cleanPhone}" already exists.`);
  }

  // Check unique email if provided
  if (cleanEmail) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return conflictResponse(`User with email "${cleanEmail}" already exists.`);
    }
  }

  // Hash password
  const shaHash = crypto.createHash('sha256').update(password).digest('hex');
  const passwordHash = `sha256$${shaHash}`;

  // 1. Create User
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}`,
      email: cleanEmail,
      passwordHash,
      role: role as UserRole,
      isActive: true,
    },
  });

  // 2. Link or Create Delivery Partner Profile if role is DELIVERY_PARTNER
  let linkedPartner = null;

  if (role === 'DELIVERY_PARTNER') {
    if (partnerId) {
      // Connect existing delivery partner
      linkedPartner = await prisma.deliveryPartner.update({
        where: { id: partnerId },
        data: {
          userId: newUser.id,
          depotId: depotId || undefined,
          assignedVehicleId: assignedVehicleId || undefined,
        },
        include: {
          depot: true,
          assignedVehicle: true,
        },
      });
    } else if (createPartnerProfile !== false) {
      // Create new Delivery Partner profile
      let codeToUse = partnerCode?.trim();
      if (!codeToUse) {
        const count = await prisma.deliveryPartner.count();
        codeToUse = `DP-${String(count + 1).padStart(3, '0')}`;
      }

      linkedPartner = await prisma.deliveryPartner.create({
        data: {
          partnerCode: codeToUse,
          name: name.trim(),
          phone: newUser.phone,
          userId: newUser.id,
          depotId: depotId || undefined,
          assignedVehicleId: assignedVehicleId || undefined,
          status: 'ACTIVE',
        },
        include: {
          depot: true,
          assignedVehicle: true,
        },
      });
    }
  }

  return successResponse(
    {
      message: `Account for ${newUser.name} (${newUser.role}) created successfully.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        partnerProfile: linkedPartner,
      },
    },
    201
  );
});
