import _, { mapValues } from "lodash";
import { apiGet, apiPost } from "./apiService";
import type { BaseFormData } from "./requestService";

export interface FormField {
  name: string;
  label: { en: string; he: string };
  field_type: "string" | "number" | "date" | "select" | "document" | "photo";
  required?: boolean;
  placeholder?: { en: string; he: string };
  auto_copy?: boolean;
  default_value?: string;
}

export interface FormSchema {
  country_id: string;
  country_name: { en: string; he: string };
  fields: FormField[];
  submit_button_text: { en: string; he: string };
}

// Dictionary config for language preference - replaces if/else chains
const getLanguageParam = (language: "en" | "he"): string => {
  const languageParams: Record<"en" | "he", string> = {
    en: "en",
    he: "he",
  };
  return languageParams[language] || "en";
};

/**
 * Fetches form schema for a country
 * Token is automatically provided by apiService from localStorage
 */
export const fetchFormSchema = async (
  countryId: string | undefined,
  language: "en" | "he" = "en"
): Promise<FormSchema> => {
  if (!countryId) {
    throw new Error("Country ID is required");
  }

  const langParam = getLanguageParam(language);
  return apiGet<FormSchema>(
    `/api/form-schema/${countryId}?language=${langParam}`
  );
};

const sanitizeFormData = (
  data: BaseFormData | { beneficiaries: BaseFormData[] }
): BaseFormData | { beneficiaries: BaseFormData[] } => {
  if ('beneficiaries' in data) {
    return {
      beneficiaries: data.beneficiaries.map((beneficiary) =>
        mapValues(beneficiary, (value) =>
          value instanceof File ? value.name : value
        )
      ),
    };
  }
  return mapValues(data, (value) =>
    value instanceof File ? value.name : value
  );
};

export type ValidationError = {
  field: string;
  message: { en: string; he: string };
};

export interface ValidationResult {
  valid: boolean;
  errors: Array<ValidationError>;
}

/**
 * Validates form data
 * Token is automatically provided by apiService from localStorage
 */
export const validateFormData = async (
  countryId: string | undefined,
  formData: BaseFormData | { beneficiaries: BaseFormData[] },
  language: "en" | "he"
): Promise<ValidationResult> => {
  if (!countryId) {
    throw new Error("Country ID is required");
  }

  const validationData = sanitizeFormData(formData);
  return apiPost<ValidationResult>(
    `/api/validate/${countryId}?language=${language}`,
    validationData
  );
};

/**
 * Initializes form data with default values from fields
 * Uses default_value from field if available, otherwise uses empty string
 */
export const initializeFormData = (fields: FormField[]): BaseFormData => {
  return _.reduce(
    fields,
    (acc, field) => {
      // Use default_value if provided, otherwise use empty string
      // For number fields, default_value might be a number string
      if (field.default_value !== undefined && field.default_value !== null) {
        if (field.field_type === "number") {
          // Convert to number if not empty, otherwise keep as empty string
          acc[field.name] = +field.default_value;
        } else {
          acc[field.name] = field.default_value;
        }
      }
      return acc;
    },
    {} as BaseFormData
  );
};
