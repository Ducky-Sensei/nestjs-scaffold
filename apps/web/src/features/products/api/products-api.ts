import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { CreateProductDto, Product, UpdateProductDto } from '@/types/product';

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
  return response.data;
};

/**
 * Get single product by ID
 */
export const getProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.GET(id));
  return response.data;
};

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  return response.data;
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: number, data: UpdateProductDto): Promise<Product> => {
  const response = await apiClient.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  return response.data;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
};
