/**
 * Centralized form type definitions
 * All form-related types should be defined here to avoid duplication
 */

/**
 * Supported field types in forms
 */
export type FieldType = "string" | "number" | "date" | "select" | "document" | "photo";

/**
 * Language preference
 */
export type Language = "en" | "he";

/**
 * Translated text object
 */
export interface TranslatedText {
  en: string;
  he: string;
}

/**
 * Base form field value types
 */
export type FormFieldValue = string | number | boolean | File;

/**
 * Form data structure - maps field names to their values
 * Note: Named FormDataRecord to avoid conflict with browser FormData API
 */
export type FormDataRecord = Record<string, FormFieldValue>;

/**
 * Extended form field with all possible properties
 * Uses index signature for flexibility with field-specific properties
 */
export interface FormField {
  name: string;
  label: TranslatedText;
  field_type: FieldType;
  required?: boolean;
  placeholder?: TranslatedText;
  auto_copy?: boolean;
  default_value?: string;
  // Field-specific properties (using index signature for flexibility)
  [key: string]: string | number | boolean | string[] | TranslatedText | undefined;
}

/**
 * String field specific properties
 */
export interface StringFieldProperties {
  min_length?: number;
  max_length?: number;
}

/**
 * Number field specific properties
 */
export interface NumberFieldProperties {
  min_value?: number;
  max_value?: number;
  step?: number;
}

/**
 * Date field specific properties
 */
export interface DateFieldProperties {
  min_date?: string;
  max_date?: string;
}

/**
 * Select field specific properties
 */
export interface SelectFieldProperties {
  options?: string[];
  multiple?: boolean;
}

/**
 * Document/Photo field specific properties
 */
export interface FileFieldProperties {
  accepted_formats?: string[];
  max_size_mb?: number;
}

/**
 * Complete form field with type-specific properties
 */
export type ExtendedFormField = FormField &
  Partial<StringFieldProperties> &
  Partial<NumberFieldProperties> &
  Partial<DateFieldProperties> &
  Partial<SelectFieldProperties> &
  Partial<FileFieldProperties>;

/**
 * Form schema structure
 */
export interface FormSchema {
  country_id: string;
  country_name: TranslatedText;
  fields: FormField[];
  submit_button_text: TranslatedText;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: TranslatedText;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: FormDataRecord | { beneficiaries: FormDataRecord[] };
}

/**
 * Form data for single or multiple beneficiaries
 */
export type FormDataInput = FormDataRecord | { beneficiaries: FormDataRecord[] };

/**
 * Common props for all form field components
 */
export interface CommonFieldProps {
  name: string;
  label: TranslatedText;
  value: FormFieldValue;
  onChange: (value: FormFieldValue) => void;
  error?: string;
  required: boolean;
  placeholder?: TranslatedText;
  language: Language;
  fieldId?: string;
  beneficiaryId?: string;
  getToken?: () => Promise<string | null>;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
  activeUploads?: Set<string>;
}

/**
 * Beneficiary form component props
 */
export interface BeneficiaryFormProps {
  beneficiaryIndex: number;
  fields: FormField[];
  formData: FormDataRecord;
  errors: Record<string, string>;
  language: Language;
  onFieldChange: (fieldName: string, value: FormFieldValue) => void;
  onCopyFromPrevious: (fieldName: string, previousValue: FormFieldValue) => void;
  previousBeneficiaryData?: FormDataRecord;
  totalBeneficiaries: number;
  autoCopyFields: Set<string>;
  onAutoCopyToggle: (fieldName: string, checked: boolean) => void;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
  activeUploads?: Set<string>;
}

