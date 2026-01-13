import _ from "lodash";
import { useState } from "react";
import { useAsyncFn } from "react-use";
import { validateFormData } from "../services/formService";
import type {
  FormDataRecord,
  Language,
} from "../types/formTypes";

/**
 * Errors organized by beneficiary index
 * Key: beneficiary index (number), Value: Record of field name -> translated message
 */
type BeneficiaryErrors = Record<number, Record<string, { en: string; he: string }>>;

export const useFormValidation = () => {
  // Store errors organized by beneficiary index
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<BeneficiaryErrors>({});

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
        // result.errors is already a list of dictionaries, one per beneficiary
        // Convert to our internal format: Record<beneficiaryIndex, Record<fieldName, message>>
        const errorsByBeneficiary: BeneficiaryErrors = {};
        
        for (let index = 0; index < result.errors.length; index++) {
          const beneficiaryErrorDict = result.errors[index];
          if (Object.keys(beneficiaryErrorDict).length > 0) {
            errorsByBeneficiary[index] = {};
            for (const [fieldName, error] of Object.entries(beneficiaryErrorDict)) {
              errorsByBeneficiary[index][fieldName] = error.message;
            }
          }
        }
        
        setBeneficiaryErrors(errorsByBeneficiary);
        return false;
      }

      setBeneficiaryErrors({});
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

  const clearFieldError = (beneficiaryIndex: number, fieldName: string): void => {
    setBeneficiaryErrors((prev) => {
      const updated = { ...prev };
      if (updated[beneficiaryIndex] && updated[beneficiaryIndex][fieldName]) {
        updated[beneficiaryIndex] = { ...updated[beneficiaryIndex] };
        delete updated[beneficiaryIndex][fieldName];
        
        // Remove beneficiary entry if no errors left
        if (Object.keys(updated[beneficiaryIndex]).length === 0) {
          delete updated[beneficiaryIndex];
        }
      }
      return updated;
    });
  };

  /**
   * Get translated errors for a specific beneficiary
   */
  const getErrors = (beneficiaryIndex: number, language: Language): Record<string, string> => {
    const errors = beneficiaryErrors[beneficiaryIndex] || {};
    return _.mapValues(errors, (message) => message[language]);
  };

  return {
    getErrors,
    submitting: validateState.loading,
    validate,
    clearFieldError,
  };
};
