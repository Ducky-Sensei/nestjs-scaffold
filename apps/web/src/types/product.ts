/**
 * Product Types
 * These match the backend DTOs and entities
 */

/**
 * Product entity from backend
 */
export interface Product {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  isActive: boolean;
}

/**
 * Create product request DTO
 */
export interface CreateProductDto {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  isActive?: boolean;
}

/**
 * Update product request DTO
 * All fields are optional for partial updates
 */
export interface UpdateProductDto {
  name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  isActive?: boolean;
}
