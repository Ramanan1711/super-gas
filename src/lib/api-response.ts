import { NextResponse } from 'next/server';

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  pagination?: ApiPagination;
  timestamp: string;
}

/**
 * Creates a standardized successful JSON response
 */
export function successResponse<T>(
  data: T,
  statusCode = 200,
  pagination?: ApiPagination,
  headers?: HeadersInit
): NextResponse<ApiResponsePayload<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(pagination ? { pagination } : {}),
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers,
    }
  );
}

/**
 * Creates a standardized error JSON response
 */
export function errorResponse(
  message: string,
  code = 'INTERNAL_SERVER_ERROR',
  statusCode = 500,
  details?: unknown,
  headers?: HeadersInit
): NextResponse<ApiResponsePayload<null>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers,
    }
  );
}

/**
 * Standard 400 Bad Request error
 */
export function badRequestResponse(
  message = 'Invalid request parameters',
  details?: unknown
) {
  return errorResponse(message, 'BAD_REQUEST', 400, details);
}

/**
 * Standard 401 Unauthorized error
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

/**
 * Standard 403 Forbidden error
 */
export function forbiddenResponse(message = 'Insufficient permissions') {
  return errorResponse(message, 'FORBIDDEN', 403);
}

/**
 * Standard 404 Not Found error
 */
export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}

/**
 * Standard 409 Conflict error
 */
export function conflictResponse(message: string, details?: unknown) {
  return errorResponse(message, 'CONFLICT', 409, details);
}
