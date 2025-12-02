/**
 * API Response Helpers
 * Utility functions for creating standardized API responses
 */

import { NextResponse } from "next/server";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/api";

/**
 * Create a success response object
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error response object
 */
export function createErrorResponse(
  code: string,
  message: string,
  data?: unknown
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: { code, message },
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
}

/**
 * Create a paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}

/**
 * Return a successful JSON response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 */
export function jsonSuccess<T>(
  data: T,
  status: number = HttpStatus.OK
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(createSuccessResponse(data), { status });
}

/**
 * Return an error JSON response
 *
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code
 * @param data - Optional data to include with error
 */
export function jsonError(
  code: string,
  message: string,
  status: number,
  data?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(createErrorResponse(code, message, data), {
    status,
  });
}

/**
 * Return a paginated JSON response
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 */
export function jsonPaginated<T>(
  data: T[],
  pagination: PaginationMeta
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(createPaginatedResponse(data, pagination));
}

/**
 * Common HTTP status codes for convenience
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
