/**
 * API Configuration Constants
 */

// Vite environment variables
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string | undefined) || defaultValue;
  }
  return defaultValue;
};

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000');
export const API_VERSION = getEnvVar('VITE_API_VERSION', 'v1');
export const API_VERSIONED_BASE_URL = `${API_BASE_URL}/${API_VERSION}`;

export const GOOGLE_OAUTH_URL = getEnvVar(
  'VITE_GOOGLE_OAUTH_URL',
  `${API_VERSIONED_BASE_URL}/auth/google`,
);
export const GITHUB_OAUTH_URL = getEnvVar(
  'VITE_GITHUB_OAUTH_URL',
  `${API_VERSIONED_BASE_URL}/auth/github`,
);

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
  },
  PRODUCTS: {
    LIST: '/products',
    GET: (id: number) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
  },
  HEALTH: {
    COMBINED: '/health',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;
