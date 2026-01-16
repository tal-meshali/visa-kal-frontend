import { apiGet, apiPost, apiPut, apiDelete } from "./apiService";

export interface Pricing {
  id: string;
  country_id: string;
  price_usd: number;
  price_ils: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePricingRequest {
  country_id: string;
  price_usd: number;
  price_ils: number;
  name: string;
  description: string;
}

export interface UpdatePricingRequest {
  country_id?: string;
  price_usd?: number;
  price_ils?: number;
  name?: string;
  description?: string;
}

/**
 * Gets all pricing plans for a specific country
 * This is an unauthenticated request
 */
export const getCountryPricing = async (countryId: string): Promise<Pricing[]> => {
  return apiGet<Pricing[]>(`/api/pricing/country/${countryId}`);
};

/**
 * Gets all pricing plans (admin only)
 */
export const getAllPricing = async (): Promise<Pricing[]> => {
  return apiGet<Pricing[]>("/api/pricing");
};

/**
 * Creates a new pricing plan (admin only)
 */
export const createPricing = async (
  pricing: CreatePricingRequest
): Promise<Pricing> => {
  return apiPost<Pricing>("/api/pricing", pricing);
};

/**
 * Updates a pricing plan (admin only)
 */
export const updatePricing = async (
  pricingId: string,
  pricing: UpdatePricingRequest
): Promise<Pricing> => {
  return apiPut<Pricing>(`/api/pricing/${pricingId}`, pricing);
};

/**
 * Deletes a pricing plan (admin only)
 */
export const deletePricing = async (pricingId: string): Promise<void> => {
  return apiDelete(`/api/pricing/${pricingId}`);
};
