import { useLanguage } from '../contexts/LanguageContext'
import { renderFormField } from '../utils/fieldRenderer'

interface FormField {
  name: string
  label: { en: string; he: string }
  field_type: 'string' | 'number' | 'date' | 'select' | 'document' | 'photo'
  required?: boolean
  placeholder?: { en: string; he: string }
  [key: string]: any
}

interface BeneficiaryFormProps {
  beneficiaryIndex: number
  fields: FormField[]
  formData: Record<string, any>
  errors: Record<string, string>
  language: 'en' | 'he'
  onFieldChange: (fieldName: string, value: any) => void
  onCopyFromPrevious: (fieldName: string, previousValue: any) => void
  previousBeneficiaryData?: Record<string, any>
  totalBeneficiaries: number
  autoCopyFields: Set<string>
  onAutoCopyToggle: (fieldName: string, checked: boolean) => void
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void
  activeUploads?: Set<string>
}

export const BeneficiaryForm = ({
  beneficiaryIndex,
  fields,
  formData,
  errors,
  language,
  onFieldChange,
  onCopyFromPrevious,
  previousBeneficiaryData,
  totalBeneficiaries,
  autoCopyFields,
  onAutoCopyToggle,
  onUploadStateChange,
  activeUploads
}: BeneficiaryFormProps) => {
  const { t } = useLanguage()
  const canCopyFromPrevious = previousBeneficiaryData !== undefined && beneficiaryIndex > 0
  const isFirstBeneficiary = beneficiaryIndex === 0

  const renderField = (field: FormField) => {
    const fieldErrorKey = totalBeneficiaries > 1 
      ? `beneficiaries[${beneficiaryIndex}].${field.name}`
      : field.name
    const error = errors[fieldErrorKey] || errors[field.name] || ''

    const commonProps = {
      name: field.name,
      label: field.label,
      value: formData[field.name] || '',
      onChange: (value: any) => onFieldChange(field.name, value),
      error,
      required: field.required || false,
      placeholder: field.placeholder,
      language,
    }

    const previousValue = previousBeneficiaryData?.[field.name]
    const isAutoCopyEnabled = autoCopyFields.has(field.name)
    const showAutoCopyCheckbox = isFirstBeneficiary && field.field_type !== 'document' && field.field_type !== 'photo'
    const isFileField = field.field_type === 'document' || field.field_type === 'photo'
    const showCopyButton = canCopyFromPrevious && !isFileField && previousValue !== undefined && previousValue !== ''

    return (
      <div key={field.name} className="beneficiary-field-wrapper">
        <div className="field-header-row">
          {showAutoCopyCheckbox && (
            <label className="auto-copy-checkbox-label">
              <input
                type="checkbox"
                className="auto-copy-checkbox"
                checked={isAutoCopyEnabled}
                onChange={(e) => onAutoCopyToggle(field.name, e.target.checked)}
                title={t.form.autoCopyTooltip}
              />
              <span className="auto-copy-label-text">
                {t.form.autoCopy}
              </span>
            </label>
          )}
          {showCopyButton && (
            <button
              type="button"
              className="copy-field-button"
              onClick={() => onCopyFromPrevious(field.name, previousValue)}
              title={t.form.copyTooltip}
            >
              {t.form.copy}
            </button>
          )}
        </div>
        {renderFormField(field, { 
          ...commonProps, 
          fieldId: totalBeneficiaries > 1 ? `${field.name}-beneficiary-${beneficiaryIndex}` : field.name,
          beneficiaryId: beneficiaryIndex.toString(),
          onUploadStateChange,
          activeUploads
        })}
      </div>
    )
  }

  return (
    <div className="beneficiary-form">
      {fields.map((field) => renderField(field))}
    </div>
  )
}

