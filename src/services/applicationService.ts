import { apiGet, apiPost, apiPatch } from "./apiService";
import type { Application } from "./requestService";
import type { FormDataRecord, TranslatedText } from "../types/formTypes";

export interface CreateApplicationRequest {
  country_id: string;
  country_name: TranslatedText;
  beneficiaries: FormDataRecord[];
  agent_id?: string;
}
/**
 * Creates a new application
 * Token is automatically provided by apiService from localStorage
 */
export const createApplication = async (
  application: CreateApplicationRequest
): Promise<Application> => {
  return apiPost<Application>("/api/applications", application);
};

/**
 * Gets all applications for the current user
 * Token is automatically provided by apiService from localStorage
 */
export const getUserApplications = async (): Promise<Application[]> => {
  return apiGet<Application[]>("/api/applications");
};

/**
 * Gets a specific application by ID
 * Token is automatically provided by apiService from localStorage
 */
export const getApplication = async (
  applicationId: string
): Promise<Application> => {
  return apiGet<Application>(`/api/applications/${applicationId}`);
};

/**
 * Updates the status of an application
 * Token is automatically provided by apiService from localStorage
 */
export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: string
): Promise<Application> => {
  return apiPatch<Application>(`/api/applications/${applicationId}/status`, {
    status: newStatus,
  });
};
