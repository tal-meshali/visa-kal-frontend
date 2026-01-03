import { apiGet, apiPost } from "./apiService";
import type { Application, BaseFormData } from "./requestService";

export interface CreateApplicationRequest {
  country_id: string;
  country_name: { en: string; he: string };
  form_data: BaseFormData;
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
