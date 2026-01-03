import React from "react";
import "./FieldBase.css";

interface StringFieldProps {
  name: string;
  label: { en: string; he: string };
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: { en: string; he: string };
  minLength?: number;
  maxLength?: number;
  language: "en" | "he";
  disabled?: boolean;
  defaultValue?: string;
}

const StringField: React.FC<StringFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  minLength,
  maxLength,
  language,
  disabled = false,
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label[language]}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder?.[language]}
        className={`form-input ${error ? "error" : ""}`}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default StringField;
