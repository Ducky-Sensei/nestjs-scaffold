/**
 * API Version-Specific Types
 *
 * This module contains type definitions that are specific to different API versions.
 * When the backend introduces breaking changes in a new API version, add the new
 * types here under the appropriate namespace.
 */

/**
 * API v1 Types
 * Current stable version
 */
export namespace ApiV1 {
  /**
   * V1-specific configuration
   */
  export interface Config {
    version: 'v1';
    baseUrl: string;
    features: {
      oauth: boolean;
      healthChecks: boolean;
      products: boolean;
    };
  }

  /**
   * V1 API Response metadata
   */
  export interface ResponseMetadata {
    timestamp: string;
    version: 'v1';
  }
}

/**
 * API v2 Types
 * Future version - add breaking changes here when v2 is released
 */
export namespace ApiV2 {
  /**
   * V2-specific configuration
   */
  export interface Config {
    version: 'v2';
    baseUrl: string;
    features: {
      oauth: boolean;
      healthChecks: boolean;
      products: boolean;
      // Add new v2 features here
      advancedSearch?: boolean;
      realTimeUpdates?: boolean;
    };
  }

  /**
   * V2 API Response metadata
   * Example: v2 might include request ID and rate limit info
   */
  export interface ResponseMetadata {
    timestamp: string;
    version: 'v2';
    requestId: string;
    rateLimit?: {
      limit: number;
      remaining: number;
      reset: number;
    };
  }

  // Add v2-specific types here as they become available
  // Example:
  // export interface ProductV2 extends ApiV1.Product {
  //   // New fields in v2
  //   category: string;
  //   tags: string[];
  // }
}

/**
 * Type guard to check API version
 */
export function isApiV1Config(config: ApiV1.Config | ApiV2.Config): config is ApiV1.Config {
  return config.version === 'v1';
}

/**
 * Type guard to check API version
 */
export function isApiV2Config(config: ApiV1.Config | ApiV2.Config): config is ApiV2.Config {
  return config.version === 'v2';
}

/**
 * Union type for all API versions
 */
export type ApiConfig = ApiV1.Config | ApiV2.Config;

/**
 * Version migration notes:
 *
 * When migrating from v1 to v2:
 * 1. Check for breaking changes in the v2 namespace
 * 2. Update your API calls to use v2 types
 * 3. Handle any new required fields or changed field types
 * 4. Test thoroughly with the v2 backend
 *
 * Example migration:
 * ```typescript
 * // Before (v1)
 * const product: Product = await getProduct(id);
 *
 * // After (v2)
 * const product: ApiV2.ProductV2 = await getProduct(id);
 * // Handle new fields like category and tags
 * ```
 */
