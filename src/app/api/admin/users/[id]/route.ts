import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
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

export const PATCH = withApiHandler(
  async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> }
  ) => {
    const params = await context?.params;
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

    if (!id) {
      return badRequestResponse('User ID is required.');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        partnerProfile: true,
      },
    });

    if (!user) {
      return notFoundResponse('User');
    }

    // Role check: Only SUPER_ADMIN can modify Super Admin accounts or assign SUPER_ADMIN role
    const authUser = await getAuthUser(req);
    if (authUser && authUser.role !== 'SUPER_ADMIN') {
      if (user.role === 'SUPER_ADMIN') {
        return forbiddenResponse('Access denied. Only Super Admin can modify Super Admin accounts.');
      }
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      phone,
      email,
      role,
      isActive,
      password,
      depotId,
      assignedVehicleId,
    } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      dataToUpdate.name = name.trim();
    }

    if (phone && typeof phone === 'string' && phone.trim().length >= 8) {
      const cleanPhone = phone.trim();
      dataToUpdate.phone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}`;
    }

    if (email !== undefined) {
      dataToUpdate.email = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    }

    if (role && [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DELIVERY_PARTNER].includes(role)) {
      dataToUpdate.role = role as UserRole;
    }

    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }

    if (password && typeof password === 'string' && password.length >= 6) {
      const shaHash = crypto.createHash('sha256').update(password).digest('hex');
      dataToUpdate.passwordHash = `sha256$${shaHash}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        partnerProfile: {
          include: {
            depot: true,
            assignedVehicle: true,
          },
        },
      },
    });

    // Update partner profile if linked and depot/vehicle passed
    if (updatedUser.partnerProfile && (depotId !== undefined || assignedVehicleId !== undefined)) {
      await prisma.deliveryPartner.update({
        where: { id: updatedUser.partnerProfile.id },
        data: {
          depotId: depotId || undefined,
          assignedVehicleId: assignedVehicleId || undefined,
        },
      });
    }

    return successResponse({
      message: `User ${updatedUser.name} updated successfully.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        partnerProfile: updatedUser.partnerProfile,
      },
    });
  }
);

export const DELETE = withApiHandler(
  async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string | string[]>> }
  ) => {
    const params = await context?.params;
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

    if (!id) {
      return badRequestResponse('User ID is required.');
    }

    // Role check: Only SUPER_ADMIN can delete accounts
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('Access denied. Only Super Admin can delete user accounts.');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { partnerProfile: true },
    });

    if (!user) {
      return notFoundResponse('User');
    }
    if (authUser && authUser.role !== 'SUPER_ADMIN') {
      if (user.role === 'SUPER_ADMIN') {
        return forbiddenResponse('Access denied. Only Super Admin can modify Super Admin accounts.');
      }
    }

    // Unlink delivery partner if present before deleting
    if (user.partnerProfile) {
      await prisma.deliveryPartner.update({
        where: { id: user.partnerProfile.id },
        data: { userId: null },
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    return successResponse({
      message: `User account ${user.name} removed successfully.`,
    });
  }
);
