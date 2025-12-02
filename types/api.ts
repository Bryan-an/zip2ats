/**
 * API Response Types
 * Standardized response structure for all API endpoints
 */

/**
 * API error structure
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Successful API response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Error API response
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  /** Optional data included with error (e.g., partial results) */
  data?: unknown;
}

/**
 * Generic API response (union of success and error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  perPage: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
