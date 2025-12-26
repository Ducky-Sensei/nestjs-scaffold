/**
 * Generic API Types
 */

/**
 * Standard error response from backend
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
