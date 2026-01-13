import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (isOpen && beneficiaryId) {
      loadPassportSchema();
    }
  }, [isOpen, beneficiaryId, requestId]);

  const loadPassportSchema = async () => {
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
  };

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
    } catch (err: any) {
      if (err.response?.data?.detail?.errors) {
        // Handle validation errors from backend
        const formErrors: Record<string, string> = {};
        err.response.data.detail.errors.forEach((error: any) => {
          formErrors[error.field] = error.message[language] || error.message.en;
        });
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
    <div className="passport-modal-overlay" onClick={onClose}>
      <div className="passport-modal" onClick={(e) => e.stopPropagation()}>
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
