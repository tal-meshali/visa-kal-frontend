import type { FormDataRecord, TranslatedText } from "../types/formTypes";
import { apiGet } from "./apiService";

export interface Beneficiary {
  id: string;
  form_data: FormDataRecord & { passport_data?: FormDataRecord };
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
  country_name: TranslatedText;
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
