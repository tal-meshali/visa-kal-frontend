import { apiGet } from "./apiService";

export type BaseFormData = Record<string, string | number | boolean | File>;

export interface Beneficiary {
  id: string;
  form_data: BaseFormData & { passport_data?: BaseFormData };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  is_client_request?: boolean;
  client_email?: string | null;
  id: string;
  user_id: string;
  country_id: string;
  country_name: { en: string; he: string };
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  beneficiaries: Beneficiary[];
}

/**
 * Gets user requests with beneficiaries (now uses /api/applications)
 * Token is automatically provided by apiService from localStorage
 */
export const getUserRequestsWithBeneficiaries = async (): Promise<
  Application[]
> => {
  return apiGet<Application[]>("/api/applications");
};
