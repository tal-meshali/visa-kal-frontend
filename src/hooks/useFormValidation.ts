import _ from "lodash";
import { useState } from "react";
import { useAsyncFn } from "react-use";
import {
  validateFormData,
  type ValidationError,
} from "../services/formService";
import type { BaseFormData } from "../services/requestService";

export const useFormValidation = () => {
  // Store full error objects with both languages
  const [errorObjects, setErrorObjects] = useState<
    Record<string, { en: string; he: string }>
  >({});

  const [validateState, executeValidate] = useAsyncFn(
    async (
      countryId: string | undefined,
      formData: BaseFormData,
      language: "en" | "he"
    ): Promise<boolean> => {
      if (!countryId) {
        return false;
      }

      // Validate server-side (for checks like OCR validation)
      const result = await validateFormData(countryId, formData, language);

      if (!result.valid) {
        const newErrors = _.keyBy(
          result.errors,
          (error: ValidationError) => error.field
        );
        setErrorObjects(
          _.mapValues(newErrors, (error: ValidationError) => error.message)
        );
        return false;
      }

      setErrorObjects({});
      return true;
    },
    []
  );

  const validate = async (
    countryId: string | undefined,
    formData: BaseFormData | { beneficiaries: BaseFormData[] },
    language: "en" | "he"
  ): Promise<boolean> => {
    try {
      return await executeValidate(countryId, formData, language);
    } catch (err) {
      console.error("Error validating form on server:", err);
      return false;
    }
  };

  const clearFieldError = (fieldName: string): void => {
    if (errorObjects[fieldName]) {
      setErrorObjects((prev) => _.omit(prev, fieldName));
    }
  };

  // Get translated errors for current language
  const getErrors = (language: "en" | "he"): Record<string, string> => {
    return _.mapValues(errorObjects, (message) => message[language]);
  };

  return {
    getErrors,
    submitting: validateState.loading,
    validate,
    clearFieldError,
  };
};
