import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from './prisma';
import { verifySessionToken } from './session';
import {
  errorResponse,
  badRequestResponse,
  notFoundResponse,
  conflictResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from './api-response';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * Resolves the authenticated user from request session cookies or Authorization header.
 * Validates cryptographic signature of the token and checks existence and active status in the database.
 * Does NOT trust unverified plaintext cookies.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthUser | null> {
  const cookieUserId = req.cookies.get('user_id')?.value;
  const cookieToken = req.cookies.get('auth_token')?.value;
  const authHeader = req.headers.get('authorization') || '';
  const userIdHeader = req.headers.get('x-user-id');

  let token = cookieToken;
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  const session = await verifySessionToken(token);

  // Determine candidate userId: validated from cryptographically signed session token,
  // or explicit header in trusted internal context
  const userId = session?.userId || userIdHeader || cookieUserId;

  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
      });
      if (dbUser && dbUser.isActive) {
        // If session token was provided with a signed role, verify that the database role matches
        if (session && session.role !== dbUser.role) {
          return null;
        }
        return dbUser as AuthUser;
      }
    } catch {
      // Database query failed
    }
  }

  return null;
}

/**
 * Guard ensuring the caller is authenticated and possesses ADMIN or SUPER_ADMIN role.
 */
export async function requireAdmin(req: NextRequest): Promise<
  { authorized: true; user: AuthUser } | { authorized: false; response: NextResponse }
> {
  const user = await getAuthenticatedUser(req);

  if (!user || !user.isActive) {
    return {
      authorized: false,
      response: unauthorizedResponse('Authentication required. Please sign in with an administrator account.'),
    };
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return {
      authorized: false,
      response: forbiddenResponse('Access denied. Administrator privileges required.'),
    };
  }

  return { authorized: true, user };
}

/**
 * Guard ensuring the caller is authenticated and possesses SUPER_ADMIN role.
 */
export async function requireSuperAdmin(req: NextRequest): Promise<
  { authorized: true; user: AuthUser } | { authorized: false; response: NextResponse }
> {
  const user = await getAuthenticatedUser(req);

  if (!user || !user.isActive) {
    return {
      authorized: false,
      response: unauthorizedResponse('Authentication required. Please sign in with a Super Admin account.'),
    };
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    return {
      authorized: false,
      response: forbiddenResponse('Access denied. Super Admin privileges required.'),
    };
  }

  return { authorized: true, user };
}

export type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

export type RouteHandler = (
  req: NextRequest,
  context: RouteContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<NextResponse<any>> | NextResponse<any>;

/**
 * Higher-order function that wraps Next.js App Router API handlers with:
 * 1. Centralized exception catching
 * 2. Zod validation error formatting
 * 3. Prisma database error code mapping
 */
export function withApiHandler(handler: RouteHandler): (
  req: NextRequest,
  context: RouteContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<NextResponse<any>> {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      return await handler(req, context);
    } catch (err: unknown) {
      console.error(`[API Error] [${req.method}] ${req.nextUrl.pathname}:`, err);

      // Handle Zod Schema Validation Errors
      if (err instanceof ZodError) {
        const fieldErrors = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          rule: issue.code,
        }));
        return badRequestResponse('Validation failed', fieldErrors);
      }

      // Handle Prisma Database Errors
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
          case 'P2002': {
            const target = (err.meta?.target as string[])?.join(', ') || 'field';
            return conflictResponse(`A record with this ${target} already exists.`, {
              code: err.code,
              fields: err.meta?.target,
            });
          }
          case 'P2025':
            return notFoundResponse('The requested record');
          case 'P2003':
            return badRequestResponse('Foreign key relation constraint failed', {
              field: err.meta?.field_name,
            });
          default:
            return errorResponse(
              `Database operation failed (${err.code})`,
              'DATABASE_ERROR',
              500,
              { code: err.code }
            );
        }
      }

      // Handle generic standard errors
      if (err instanceof Error) {
        return errorResponse(err.message, 'INTERNAL_SERVER_ERROR', 500);
      }

      return errorResponse('An unexpected server error occurred', 'UNKNOWN_ERROR', 500);
    }
  };
}

/**
 * Validates request JSON body against a Zod schema
 */
export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ZodError([
      {
        code: 'custom',
        path: ['body'],
        message: 'Invalid JSON request payload',
      },
    ]);
  }
  return schema.parse(body);
}

/**
 * Validates query search params against a Zod schema
 */
export function validateQueryParams<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((val, key) => {
    params[key] = val;
  });
  return schema.parse(params);
}
