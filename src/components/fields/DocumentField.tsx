import React, { useState } from "react";
import { useLanguage } from "../../contexts/useLanguage";
import {
  deleteFileFromS3,
  uploadFileToS3,
} from "../../services/fileUploadService";
import "./FieldBase.css";

interface DocumentFieldProps {
  name: string;
  label: { en: string; he: string };
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: { en: string; he: string };
  acceptedFormats?: string[];
  maxSizeMB?: number;
  language: "en" | "he";
  disabled?: boolean;
  fieldId?: string;
  beneficiaryId?: string;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
}

const DocumentField: React.FC<DocumentFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  acceptedFormats = ["pdf"],
  maxSizeMB,
  language,
  disabled = false,
  fieldId,
  beneficiaryId = "0",
  onUploadStateChange,
}) => {
  const { t } = useLanguage();
  const inputId = fieldId || name;
  const uploadId = `${fieldId || name}-${beneficiaryId}`;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Don't remove existing document if user cancels file selection
    if (!file) {
      // Reset the input so the same file can be selected again
      e.target.value = "";
      return;
    }

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension || "")) {
      setUploadError(t.fileUpload.invalidFileFormat);
      return;
    }

    // Validate file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`${t.fileUpload.fileSizeExceeds}${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    onUploadStateChange?.(uploadId, true);

    try {
      const result = await uploadFileToS3(file, name, beneficiaryId);
      onChange(result.url);
      setUploadError(null);
      setUploading(false);
      onUploadStateChange?.(uploadId, false);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t.fileUpload.uploadFailed
      );
      onChange(null);
      setUploading(false);
      onUploadStateChange?.(uploadId, false);
    }
  };

  const handleRemove = async () => {
    if (!value) {
      return;
    }

    try {
      await deleteFileFromS3(value);
      onChange(null);
      setUploadError(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t.fileUpload.deleteFailed
      );
    }
  };

  // Extract filename from S3 URL if value is a URL
  const displayFilename = value
    ? value.split("/").pop()?.split("_").slice(1).join("_") || null
    : null;

  const acceptString = acceptedFormats.map((f) => `.${f}`).join(",");

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label[language]}
        {required && <span className="required">*</span>}
      </label>
      <div className="file-upload-wrapper">
        <input
          type="file"
          id={inputId}
          name={name}
          accept={acceptString}
          onChange={handleFileChange}
          className="file-input"
          disabled={disabled}
        />
        <label
          htmlFor={inputId}
          className={`file-label ${error || uploadError ? "error" : ""} ${
            uploading ? "uploading" : ""
          }`}
        >
          {uploading ? (
            <span className="file-placeholder">{t.fileUpload.uploading}</span>
          ) : value ? (
            <span className="file-name">{displayFilename}</span>
          ) : (
            <span className="file-placeholder">
              {placeholder?.[language] || "Click to upload document"}
            </span>
          )}
          <span className="file-button">
            {uploading ? t.fileUpload.uploading : t.fileUpload.chooseFile}
          </span>
        </label>
        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="file-remove-button"
            disabled={disabled}
            aria-label={t.fileUpload.removeFile}
          >
            {t.fileUpload.remove}
          </button>
        )}
      </div>
      {maxSizeMB && (
        <span className="file-hint">
          {t.fileUpload.maxSize || "Max size"}: {maxSizeMB}MB
        </span>
      )}
      {error && <span className="error-message">{error}</span>}
      {uploadError && <span className="error-message">{uploadError}</span>}
    </div>
  );
};

export default DocumentField;
