import _ from "lodash";
import type {
  FormDataRecord,
  FormSchema,
  Language,
  TypedFormField,
  ValidationResult,
} from "../types/formTypes";
import { apiGet, apiPost } from "./apiService";

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

/**
 * Validates beneficiaries list
 * Token is automatically provided by apiService from localStorage
 */
export const validateFormData = async (
  countryId: string | undefined,
  beneficiaries: FormDataRecord[],
  language: Language
): Promise<ValidationResult> => {
  if (!countryId) {
    throw new Error("Country ID is required");
  }

  return apiPost<ValidationResult>(
    `/api/validate/${countryId}?language=${language}`,
     beneficiaries.map(beneficiary => {const {passport_data, ...item} = beneficiary; return item}
     )
  );
};

/**
 * Initializes form data with default values from fields
 * Uses default_value from field if available, otherwise uses empty string
 */
export const initializeFormData = (
  fields: TypedFormField[]
): FormDataRecord => {
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
