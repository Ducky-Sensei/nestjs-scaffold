/**
 * Authentication Types
 * These match the backend DTOs and entities
 */

/**
 * User entity from backend
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  authProvider: string | null;
  createdAt: string;
}

/**
 * Login request DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Register request DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

/**
 * Refresh token request DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * Auth response from backend
 * Returned on login, register, and refresh
 */
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    authProvider?: string | null;
  };
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}
