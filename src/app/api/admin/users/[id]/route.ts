import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireAdmin, requireSuperAdmin } from '@/lib/api-middleware';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import { UserRole } from '@prisma/client';

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

    // Role check: Only ADMIN or SUPER_ADMIN can modify user accounts
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    if (auth.user.role !== UserRole.SUPER_ADMIN && user.role === UserRole.SUPER_ADMIN) {
      return forbiddenResponse('Access denied. Only Super Admin can modify Super Admin accounts.');
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
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { partnerProfile: true },
    });

    if (!user) {
      return notFoundResponse('User');
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
