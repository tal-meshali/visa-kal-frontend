import React, { useCallback, useEffect, useState } from "react";
import { useKeyDownActivate } from "../hooks/useKeyDownActivate";
import { useLanguage } from "../contexts/useLanguage";
import { apiGet, apiPost } from "../services/apiService";
import { initializeFormData } from "../services/formService";
import type {
  FormDataRecord,
  FormFieldValue,
  FormSchema,
} from "../types/formTypes";
import { BeneficiaryForm } from "./BeneficiaryForm";
import { Button } from "./Button";
import "./PassportDataModal.css";

interface PassportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryId: string;
  requestId?: string;
  onSave?: () => void;
}

interface ValidationErrorResponse {
  message: { en: string; he: string };
  code?: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: {
        errors?: Record<string, ValidationErrorResponse>[];
      };
    };
  };
}

const PassportDataModal: React.FC<PassportDataModalProps> = ({
  isOpen,
  onClose,
  beneficiaryId,
  requestId,
  onSave,
}) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<FormDataRecord>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleOverlayKeyDown = useKeyDownActivate(onClose);

  const loadPassportSchema = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        beneficiary_id: beneficiaryId,
        language: language,
      });
      if (requestId) {
        params.append("request_id", requestId);
      }
      const schemaData = await apiGet<FormSchema>(
        `/api/passport-form-schema?${params.toString()}`
      );
      setSchema(schemaData);
      // Initialize form data with default values from schema
      const initialData = initializeFormData(schemaData.fields);
      setFormData(initialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.passport.loadError);
    } finally {
      setLoading(false);
    }
  }, [beneficiaryId, requestId, language, t.passport.loadError]);

  useEffect(() => {
    if (isOpen && beneficiaryId) {
      loadPassportSchema();
    }
  }, [isOpen, beneficiaryId, loadPassportSchema]);


  const handleFieldChange = (fieldName: string, value: FormFieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setErrors({});

    try {
      // Validate first
      const params = new URLSearchParams({
        language: language,
      });
      const validationResult = await apiPost<{
        valid: boolean;
        errors: Array<{ field: string; message: { en: string; he: string } }>;
      }>(`/api/validate-passport-data?${params.toString()}`, formData);

      if (!validationResult.valid) {
        // Convert validation errors to form errors
        const formErrors: Record<string, string> = {};
        validationResult.errors.forEach((err) => {
          formErrors[err.field] = err.message[language] || err.message.en;
        });
        setErrors(formErrors);
        return;
      }

      // Save if validation passes
      const saveParams = new URLSearchParams({
        beneficiary_id: beneficiaryId,
        language: language,
      });
      if (requestId) {
        saveParams.append("request_id", requestId);
      }
      await apiPost(`/api/passport-data?${saveParams.toString()}`, formData);
      onSave?.();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.response?.data?.detail?.errors && apiError.response.data.detail.errors.length > 0) {
        // Handle validation errors from backend
        // errors is a list of dicts, one per beneficiary. Since we validate a single passport, use errors[0]
        const formErrors: Record<string, string> = {};
        const beneficiaryErrors = apiError.response.data.detail.errors[0];
        for (const [fieldName, error] of Object.entries(beneficiaryErrors)) {
          formErrors[fieldName] = error.message[language] || error.message.en;
        }
        setErrors(formErrors);
      } else {
        setError(err instanceof Error ? err.message : t.passport.saveError);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="passport-modal-overlay"
      role="button"
      tabIndex={0}
      aria-label="Close"
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- modal content must stop propagation */}
      <div
        className="passport-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="passport-modal-header">
          <h2 className="passport-modal-title">{t.passport.title}</h2>
          <button
            className="passport-modal-close"
            onClick={onClose}
            aria-label={t.passport.cancel}
          >
            ×
          </button>
        </div>
        <div className="passport-modal-content">
          <p className="passport-modal-description">{t.passport.description}</p>
          {loading ? (
            <div className="passport-modal-loading">{t.passport.loading}</div>
          ) : schema ? (
            <BeneficiaryForm
              beneficiaryIndex={0}
              fields={schema.fields}
              formData={formData}
              errors={errors}
              language={language}
              onFieldChange={handleFieldChange}
              onCopyFromPrevious={() => {}}
              previousBeneficiaryData={undefined}
              totalBeneficiaries={1}
              autoCopyFields={new Set()}
              onAutoCopyToggle={() => {}}
              showAutoCopyCheckbox={false}
            />
          ) : null}
          {error && <div className="passport-modal-error">{error}</div>}
        </div>
        <div className="passport-modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.passport.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? t.passport.saving : t.passport.save}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PassportDataModal;
