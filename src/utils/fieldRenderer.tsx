import React from "react";
import DateField from "../components/fields/DateField";
import DocumentField from "../components/fields/DocumentField";
import NumberField from "../components/fields/NumberField";
import PhotoField from "../components/fields/PhotoField";
import SelectField from "../components/fields/SelectField";
import StringField from "../components/fields/StringField";

interface FormField {
  name: string;
  label: { en: string; he: string };
  field_type: "string" | "number" | "date" | "select" | "document" | "photo";
  required?: boolean;
  placeholder?: { en: string; he: string };
  [key: string]: any;
  default_value?: string;
}

interface CommonFieldProps {
  name: string;
  label: { en: string; he: string };
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required: boolean;
  placeholder?: { en: string; he: string };
  language: "en" | "he";
  fieldId?: string;
  beneficiaryId?: string;
  getToken?: () => Promise<string | null>;
  onUploadStateChange?: (uploadId: string, isUploading: boolean) => void;
  activeUploads?: Set<string>;
}

type FieldRenderer = (
  field: FormField,
  props: CommonFieldProps
) => React.JSX.Element | null;

const fieldRenderers: Record<string, FieldRenderer> = {
  string: (field, props) => (
    <StringField
      {...props}
      minLength={field.min_length}
      maxLength={field.max_length}
    />
  ),
  number: (field, props) => (
    <NumberField
      {...props}
      min={field.min_value}
      max={field.max_value}
      step={field.step}
    />
  ),
  date: (field, props) => (
    <DateField {...props} minDate={field.min_date} maxDate={field.max_date} />
  ),
  select: (field, props) => (
    <SelectField
      {...props}
      options={field.options || []}
      multiple={field.multiple}
    />
  ),
  document: (field, props) => (
    <DocumentField
      {...props}
      fieldId={props.fieldId || props.name}
      beneficiaryId={props.beneficiaryId || "0"}
      acceptedFormats={field.accepted_formats}
      maxSizeMB={field.max_size_mb}
      onUploadStateChange={props.onUploadStateChange}
    />
  ),
  photo: (field, props) => (
    <PhotoField
      {...props}
      fieldId={props.fieldId || props.name}
      beneficiaryId={props.beneficiaryId || "0"}
      acceptedFormats={field.accepted_formats}
      maxSizeMB={field.max_size_mb}
      onUploadStateChange={props.onUploadStateChange}
      activeUploads={props.activeUploads}
    />
  ),
};

export const renderFormField = (
  field: FormField,
  commonProps: CommonFieldProps
) => {
  const renderer = fieldRenderers[field.field_type];
  if (!renderer) {
    return null;
  }
  return renderer(field, commonProps);
};
