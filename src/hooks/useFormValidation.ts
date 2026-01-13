import _ from "lodash";
import { useState } from "react";
import { useAsyncFn } from "react-use";
import { validateFormData } from "../services/formService";
import type {
  FormDataRecord,
  Language,
  ValidationError,
} from "../types/formTypes";

export const useFormValidation = () => {
  // Store full error objects with both languages
  const [errorObjects, setErrorObjects] = useState<
    Record<string, { en: string; he: string }>
  >({});

  const [validateState, executeValidate] = useAsyncFn(
    async (
      countryId: string | undefined,
      beneficiaries: FormDataRecord[],
      language: Language
    ): Promise<boolean> => {
      if (!countryId) {
        return false;
      }

      // Validate server-side (for checks like OCR validation)
      const result = await validateFormData(countryId, beneficiaries, language);

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
    beneficiaries: FormDataRecord[],
    language: Language
  ): Promise<boolean> => {
    try {
      return await executeValidate(countryId, beneficiaries, language);
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
  const getErrors = (language: Language): Record<string, string> => {
    return _.mapValues(errorObjects, (message) => message[language]);
  };

  return {
    getErrors,
    submitting: validateState.loading,
    validate,
    clearFieldError,
  };
};
