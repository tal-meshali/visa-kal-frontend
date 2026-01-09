import _, { mapValues } from "lodash";
import { apiGet, apiPost } from "./apiService";
import type {
  FormField,
  FormSchema,
  ValidationError,
  ValidationResult,
  FormDataInput,
  Language,
  FormDataRecord,
} from "../types/formTypes";

// Re-export types for backward compatibility
export type { FormField, FormSchema, ValidationError, ValidationResult };

// Dictionary config for language preference - replaces if/else chains
const getLanguageParam = (language: Language): string => {
  const languageParams: Record<Language, string> = {
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
  language: Language = "en"
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
  data: FormDataInput
): FormDataInput => {
  if ('beneficiaries' in data && Array.isArray(data.beneficiaries)) {
    return {
      beneficiaries: data.beneficiaries.map((beneficiary: FormDataRecord) =>
        mapValues(beneficiary, (value) =>
          value instanceof File ? value.name : value
        )
      ),
    };
  }
  return mapValues(data as FormDataRecord, (value) =>
    value instanceof File ? value.name : value
  );
};


/**
 * Validates form data
 * Token is automatically provided by apiService from localStorage
 */
export const validateFormData = async (
  countryId: string | undefined,
  formData: FormDataInput,
  language: Language
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
export const initializeFormData = (fields: FormField[]): FormDataRecord => {
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
    {} as FormDataRecord
  );
};
