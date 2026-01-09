import React from 'react'
import './FieldBase.css'

interface DateFieldProps {
  name: string
  label: { en: string; he: string }
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: { en: string; he: string }
  minDate?: string
  maxDate?: string
  language: 'en' | 'he'
  disabled?: boolean
}

const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  minDate,
  maxDate,
  language,
  disabled = false
}) => {
  // Convert "today" to actual date
  const today = new Date().toISOString().split('T')[0]
  const min = minDate === 'today' ? today : minDate
  const max = maxDate === 'today' ? today : maxDate

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label[language]}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`form-input ${error ? 'error' : ''}`}
        disabled={disabled}
        min={min}
        max={max}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default DateField

