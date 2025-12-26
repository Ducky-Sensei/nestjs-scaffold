/**
 * API Version Configuration
 *
 * This module provides utilities for managing API versioning across the application.
 * The backend uses a versioned URL structure (e.g., /v1/auth/login, /v2/products).
 */

import { API_BASE_URL, API_VERSION, API_VERSIONED_BASE_URL } from '@/lib/constants/api';

/**
 * Available API versions
 */
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type ApiVersion = (typeof API_VERSIONS)[keyof typeof API_VERSIONS];

/**
 * Get the current API version
 * @returns Current API version (e.g., 'v1')
 */
export const getCurrentApiVersion = (): string => {
  return API_VERSION;
};

/**
 * Get the versioned base URL
 * @param version - Optional API version. Uses current version if not provided
 * @returns Versioned base URL (e.g., 'http://localhost:8000/v1')
 */
export const getVersionedBaseUrl = (version?: string): string => {
  if (version) {
    return `${API_BASE_URL}/${version}`;
  }
  return API_VERSIONED_BASE_URL;
};

/**
 * Check if a specific API version is available
 * @param version - API version to check
 * @returns True if the version is available
 */
export const isVersionAvailable = (version: string): boolean => {
  return Object.values(API_VERSIONS).includes(version as ApiVersion);
};

/**
 * Version migration guide
 *
 * When migrating from v1 to v2:
 * 1. Update VITE_API_VERSION in .env file
 * 2. Update VITE_GOOGLE_OAUTH_URL and VITE_GITHUB_OAUTH_URL if needed
 * 3. Review breaking changes in API v2 documentation
 * 4. Update any version-specific type definitions in src/types/api-versions.ts
 * 5. Test all API endpoints thoroughly
 * 6. Update MSW handlers to support both v1 and v2 for gradual migration
 */
export const VERSION_MIGRATION_GUIDE = {
  v1_to_v2: {
    steps: [
      'Update VITE_API_VERSION=v2 in .env',
      'Review v2 API documentation for breaking changes',
      'Update type definitions in src/types/api-versions.ts',
      'Test authentication flow',
      'Test all CRUD operations',
      'Update E2E tests',
    ],
    breakingChanges: [
      // Add v2 breaking changes here when available
    ],
  },
} as const;
