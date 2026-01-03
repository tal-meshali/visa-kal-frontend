import React from 'react'
import './FieldBase.css'

interface SelectOption {
  value: string
  label: { en: string; he: string }
}

interface SelectFieldProps {
  name: string
  label: { en: string; he: string }
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: { en: string; he: string }
  options: SelectOption[]
  multiple?: boolean
  language: 'en' | 'he'
  disabled?: boolean
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options,
  multiple = false,
  language,
  disabled = false
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label[language]}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`form-select ${error ? 'error' : ''}`}
        disabled={disabled}
        multiple={multiple}
      >
        <option value="">{placeholder?.[language] || 'Select an option...'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label[language]}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default SelectField

