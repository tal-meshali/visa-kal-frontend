/**
 * Centralized form type definitions
 * All form-related types should be defined here to avoid duplication
 */

/**
 * Supported field types in forms
 */
export type FieldType =
  | "string"
  | "number"
  | "date"
  | "select"
  | "document"
  | "photo";

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
export type FormFieldValue = string | number | boolean | File | null;

/**
 * Form data structure - maps field names to their values
 * Note: Named FormDataRecord to avoid conflict with browser FormData API
 */
export type FormDataRecord = Record<string, FormFieldValue>;

/**
 * Base form field interface - generic over value type
 * @template TValue The type of value this field holds (used for type inference in specific field types)
 */
export interface BaseFormField<
  _TValue extends FormFieldValue = FormFieldValue
> {
  name: string;
  label: TranslatedText;
  field_type: FieldType;
  required?: boolean;
  placeholder?: TranslatedText;
  auto_copy?: boolean;
  default_value?: _TValue;
}

/**
 * String field type
 */
export interface StringField extends BaseFormField<string> {
  field_type: "string";
  min_length?: number;
  max_length?: number;
}

/**
 * Number field type
 */
export interface NumberField extends BaseFormField<number> {
  field_type: "number";
  min_value?: number;
  max_value?: number;
  step?: number;
}

/**
 * Date field type
 */
export interface DateField extends BaseFormField<string> {
  field_type: "date";
  min_date?: string;
  max_date?: string;
}

/**
 * Select field option
 */
export interface SelectOption {
  value: string;
  label: TranslatedText;
}

/**
 * Select field type
 */
export interface SelectField extends BaseFormField<string> {
  field_type: "select";
  options?: SelectOption[];
  multiple?: boolean;
}

/**
 * Document field type
 */
export interface DocumentField extends BaseFormField<string | null> {
  field_type: "document";
  accepted_formats?: string[];
  max_size_mb?: number;
}

/**
 * Photo field type
 */
export interface PhotoField extends BaseFormField<string | null> {
  field_type: "photo";
  accepted_formats?: string[];
  max_size_mb?: number;
}

/**
 * Union type for all specific field types
 */
export type TypedFormField =
  | StringField
  | NumberField
  | DateField
  | SelectField
  | DocumentField
  | PhotoField;

/**
 * Form schema structure
 */
export interface FormSchema {
  country_id: string;
  country_name: TranslatedText;
  fields: TypedFormField[];
  submit_button_text: TranslatedText;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  message: TranslatedText;
  code?: string;
}

/**
 * Validation result structure
 * errors is a list of dictionaries, one per beneficiary
 * Each dictionary maps field names to ValidationError objects
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, ValidationError>[];
  data?: { beneficiaries: FormDataRecord[] };
}

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
  requestId?: string;
  getToken?: () => Promise<string | null>;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
  activeUploads?: Set<string>;
}

/**
 * Beneficiary form component props
 */
export interface BeneficiaryFormProps {
  beneficiaryIndex: number;
  fields: TypedFormField[];
  formData: FormDataRecord;
  errors: Record<string, string>;
  language: Language;
  onFieldChange: (fieldName: string, value: FormFieldValue) => void;
  onCopyFromPrevious: (
    fieldName: string,
    previousValue: FormFieldValue
  ) => void;
  previousBeneficiaryData?: FormDataRecord;
  totalBeneficiaries: number;
  autoCopyFields: Set<string>;
  onAutoCopyToggle: (fieldName: string, checked: boolean) => void;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
  showAutoCopyCheckbox: boolean
}
