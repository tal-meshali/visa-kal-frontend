import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../contexts/useLanguage";
import {
  deleteFileFromS3,
  uploadFileToS3,
} from "../../services/fileUploadService";
import "./FieldBase.css";

interface PhotoFieldProps {
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
  activeUploads?: Set<string>;
}

const PhotoField: React.FC<PhotoFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  acceptedFormats = ["jpg", "jpeg", "png", "webp"],
  maxSizeMB,
  language,
  disabled = false,
  fieldId,
  beneficiaryId = "0",
  onUploadStateChange,
  activeUploads,
}) => {
  const { t } = useLanguage();
  const inputId = fieldId || name;
  const uploadId = `${fieldId || name}-${beneficiaryId}`;
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

  // Check if there's an active upload for this field when component mounts or props change
  useEffect(() => {
    if (activeUploads && activeUploads.has(uploadId)) {
      setUploading(true);
      isUploadingRef.current = true;
    } else {
      // Clear uploading state if there's no active upload for this specific field/beneficiary
      setUploading(false);
      isUploadingRef.current = false;
    }
  }, [activeUploads, uploadId]);

  useEffect(() => {
    // If value is set and we were uploading, the upload completed
    if (value && isUploadingRef.current) {
      setUploading(false);
      isUploadingRef.current = false;
    }

    if (value) {
      // If value is a URL (S3 URL), use it directly
      if (value.startsWith("http://") || value.startsWith("https://")) {
        setPreview(value);
        // Extract filename from URL
        const filename =
          value.split("/").pop()?.split("_").slice(1).join("_") || null;
        setUploadedFilename(filename);
      } else {
        // Legacy: if it's a File object (shouldn't happen but handle it)
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        // This shouldn't happen with new implementation
        setPreview(null);
        setUploadedFilename(null);
      }
      // Clear error when value changes (new file uploaded successfully)
      setUploadError(null);
    } else if (!isUploadingRef.current) {
      // Only clear preview and filename if not currently uploading
      setPreview(null);
      setUploadedFilename(null);
    }
  }, [value, fieldId, beneficiaryId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Don't remove existing photo if user cancels file selection
    if (!file) {
      // Reset the input so the same file can be selected again
      e.target.value = "";
      return;
    }

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension || "")) {
      setUploadError(t.fileUpload.invalidImageFormat);
      return;
    }

    // Validate file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`${t.fileUpload.fileSizeExceeds}${maxSizeMB}MB`);
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    isUploadingRef.current = true;
    setUploadError(null);
    onUploadStateChange?.(uploadId, true);

    try {
      const result = await uploadFileToS3(file, name, beneficiaryId);
      onChange(result.url);
      setUploadedFilename(result.filename);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t.fileUpload.uploadFailed
      );
      onChange(null);
      setPreview(null);
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
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
      setUploadedFilename(null);
      setPreview(null);
      setUploadError(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t.fileUpload.deleteFailed
      );
    }
  };

  // Extract filename from S3 URL if value is a URL
  const displayFilename =
    uploadedFilename ||
    (value ? value.split("/").pop()?.split("_").slice(1).join("_") : null);

  const acceptString = acceptedFormats
    .map((f) => `image/${f === "jpg" ? "jpeg" : f}`)
    .join(",");

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
          ) : preview ? (
            <div className="photo-preview">
              <img src={preview} alt="Preview" className="photo-preview-img" />
              {displayFilename && (
                <span className="file-name">{displayFilename}</span>
              )}
            </div>
          ) : (
            <span className="file-placeholder">
              {placeholder?.[language] || "Click to upload photo"}
            </span>
          )}
          <span className="file-button">
            {uploading ? t.fileUpload.uploading : t.fileUpload.choosePhoto}
          </span>
        </label>
        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="file-remove-button"
            disabled={disabled}
            aria-label={t.fileUpload.removePhoto}
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

export default PhotoField;
