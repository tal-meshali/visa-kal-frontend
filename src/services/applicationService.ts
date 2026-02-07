import type { FormDataRecord } from "../types/formTypes";
import { apiGet, apiPatch, apiPost } from "./apiService";
import type { Application } from "./requestService";

export interface CreateApplicationRequest {
  country_id: string;
  beneficiaries: FormDataRecord[];
  agent_id?: string;
}

export const createApplication = async (
  application: CreateApplicationRequest,
): Promise<Application> => {
  return apiPost<Application>("/api/applications", application);
};

export const getUserApplications = async (): Promise<Application[]> => {
  return apiGet<Application[]>("/api/applications");
};

export const getApplication = async (
  applicationId: string,
): Promise<Application> => {
  return apiGet<Application>(`/api/applications/${applicationId}`);
};

export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: string,
): Promise<Application> => {
  return apiPatch<Application>(`/api/applications/${applicationId}/status`, {
    status: newStatus,
  });
};

export const updateApplicationPricing = async (
  applicationId: string,
  pricingId: string,
): Promise<Application> => {
  return apiPatch<Application>(`/api/applications/${applicationId}/pricing`, {
    pricing_id: pricingId,
  });
};
