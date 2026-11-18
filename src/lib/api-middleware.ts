import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { Prisma } from '@prisma/client';
import {
  errorResponse,
  badRequestResponse,
  notFoundResponse,
  conflictResponse,
} from './api-response';

export type RouteHandler<T = unknown> = (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => Promise<NextResponse<T>> | NextResponse<T>;

/**
 * Higher-order function that wraps Next.js App Router API handlers with:
 * 1. Centralized exception catching
 * 2. Zod validation error formatting
 * 3. Prisma database error code mapping
 */
export function withApiHandler<T>(handler: RouteHandler<T>): RouteHandler {
  return async (req: NextRequest, context) => {
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
