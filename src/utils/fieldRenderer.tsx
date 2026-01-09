import React from "react";
import DateField from "../components/fields/DateField";
import DocumentField from "../components/fields/DocumentField";
import NumberField from "../components/fields/NumberField";
import PhotoField from "../components/fields/PhotoField";
import SelectField from "../components/fields/SelectField";
import StringField from "../components/fields/StringField";
import type { FormField, CommonFieldProps, ExtendedFormField } from "../types/formTypes";

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
      activeUploads={props.activeUploads}
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
  field: ExtendedFormField,
  commonProps: CommonFieldProps
) => {
  const renderer = fieldRenderers[field.field_type];
  if (!renderer) {
    return null;
  }
  return renderer(field, commonProps);
};
