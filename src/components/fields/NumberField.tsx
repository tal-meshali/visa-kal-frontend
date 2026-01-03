import React from 'react'
import './FieldBase.css'

interface NumberFieldProps {
  name: string
  label: { en: string; he: string }
  value: number | string
  onChange: (value: number | string) => void
  error?: string
  required?: boolean
  placeholder?: { en: string; he: string }
  min?: number
  max?: number
  step?: number
  language: 'en' | 'he'
  disabled?: boolean
}

const NumberField: React.FC<NumberFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  min,
  max,
  step,
  language,
  disabled = false
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label[language]}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder={placeholder?.[language]}
        className={`form-input ${error ? 'error' : ''}`}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default NumberField

