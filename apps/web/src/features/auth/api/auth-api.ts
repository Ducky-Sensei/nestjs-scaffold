import { apiClient, storeTokens } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { AuthResponseDto, LoginDto, RefreshTokenDto, RegisterDto, User } from '@/types/auth';

/**
 * Login with email and password
 */
export const login = async (credentials: LoginDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, credentials);

  storeTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, data);

  storeTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshTokenData: RefreshTokenDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>(
    API_ENDPOINTS.AUTH.REFRESH,
    refreshTokenData,
  );

  storeTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
};

/**
 * Logout (revoke refresh token)
 */
export const logout = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  return response.data;
};
