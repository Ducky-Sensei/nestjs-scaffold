import { apiClient, getErrorMessage } from '@/lib/api/client';
import type { CustomerTheme, Theme } from '@/types/theme';

/**
 * Theme API endpoints
 */
export const THEME_ENDPOINTS = {
  GET_CUSTOMER_THEME: (customerId: string) => `/themes/customer/${customerId}`,
  GET_THEME_BY_ID: (themeId: string) => `/themes/${themeId}`,
  LIST_THEMES: '/themes',
} as const;

/**
 * Fetch a customer's theme configuration
 */
export async function getCustomerTheme(customerId: string): Promise<CustomerTheme> {
  try {
    const response = await apiClient.get<CustomerTheme>(
      THEME_ENDPOINTS.GET_CUSTOMER_THEME(customerId),
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch customer theme: ${getErrorMessage(error)}`);
  }
}

/**
 * Fetch a theme by ID
 */
export async function getThemeById(themeId: string): Promise<Theme> {
  try {
    const response = await apiClient.get<Theme>(THEME_ENDPOINTS.GET_THEME_BY_ID(themeId));
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch theme: ${getErrorMessage(error)}`);
  }
}

/**
 * Fetch all available themes
 */
export async function listThemes(): Promise<Theme[]> {
  try {
    const response = await apiClient.get<Theme[]>(THEME_ENDPOINTS.LIST_THEMES);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch themes: ${getErrorMessage(error)}`);
  }
}
