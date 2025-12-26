import { describe, expect, it } from 'vitest';
import { API_ENDPOINTS } from './api';

describe('API constants', () => {
  describe('API_ENDPOINTS', () => {
    describe('AUTH endpoints', () => {
      it('should have correct login endpoint', () => {
        expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      });

      it('should have correct register endpoint', () => {
        expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/auth/register');
      });

      it('should have correct refresh endpoint', () => {
        expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/auth/refresh');
      });

      it('should have correct logout endpoint', () => {
        expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
      });

      it('should have correct me endpoint', () => {
        expect(API_ENDPOINTS.AUTH.ME).toBe('/auth/me');
      });

      it('should have correct OAuth endpoints', () => {
        expect(API_ENDPOINTS.AUTH.GOOGLE).toBe('/auth/google');
        expect(API_ENDPOINTS.AUTH.GITHUB).toBe('/auth/github');
      });
    });

    describe('PRODUCTS endpoints', () => {
      it('should have correct list endpoint', () => {
        expect(API_ENDPOINTS.PRODUCTS.LIST).toBe('/products');
      });

      it('should generate correct get endpoint with id', () => {
        expect(API_ENDPOINTS.PRODUCTS.GET(123)).toBe('/products/123');
        expect(API_ENDPOINTS.PRODUCTS.GET(1)).toBe('/products/1');
      });

      it('should have correct create endpoint', () => {
        expect(API_ENDPOINTS.PRODUCTS.CREATE).toBe('/products');
      });

      it('should generate correct update endpoint with id', () => {
        expect(API_ENDPOINTS.PRODUCTS.UPDATE(123)).toBe('/products/123');
        expect(API_ENDPOINTS.PRODUCTS.UPDATE(456)).toBe('/products/456');
      });

      it('should generate correct delete endpoint with id', () => {
        expect(API_ENDPOINTS.PRODUCTS.DELETE(123)).toBe('/products/123');
        expect(API_ENDPOINTS.PRODUCTS.DELETE(789)).toBe('/products/789');
      });
    });

    describe('HEALTH endpoints', () => {
      it('should have correct combined health endpoint', () => {
        expect(API_ENDPOINTS.HEALTH.COMBINED).toBe('/health');
      });

      it('should have correct ready endpoint', () => {
        expect(API_ENDPOINTS.HEALTH.READY).toBe('/health/ready');
      });

      it('should have correct live endpoint', () => {
        expect(API_ENDPOINTS.HEALTH.LIVE).toBe('/health/live');
      });
    });
  });
});
