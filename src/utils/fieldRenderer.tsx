import React from "react";
import DateFieldComponent from "../components/fields/DateField";
import DocumentFieldComponent from "../components/fields/DocumentField";
import NumberFieldComponent from "../components/fields/NumberField";
import PhotoFieldComponent from "../components/fields/PhotoField";
import SelectFieldComponent from "../components/fields/SelectField";
import StringFieldComponent from "../components/fields/StringField";
import type {
  TypedFormField,
  StringField,
  NumberField,
  DateField,
  SelectField,
  DocumentField,
  PhotoField,
  CommonFieldProps,
  FormField,
} from "../types/formTypes";

/**
 * Type guard to check if field is a StringField
 */
function isStringField(field: TypedFormField | FormField): field is StringField {
  return field.field_type === "string";
}

/**
 * Type guard to check if field is a NumberField
 */
function isNumberField(field: TypedFormField | FormField): field is NumberField {
  return field.field_type === "number";
}

/**
 * Type guard to check if field is a DateField
 */
function isDateField(field: TypedFormField | FormField): field is DateField {
  return field.field_type === "date";
}

/**
 * Type guard to check if field is a SelectField
 */
function isSelectField(field: TypedFormField | FormField): field is SelectField {
  return field.field_type === "select";
}

/**
 * Type guard to check if field is a DocumentField
 */
function isDocumentField(field: TypedFormField | FormField): field is DocumentField {
  return field.field_type === "document";
}

/**
 * Type guard to check if field is a PhotoField
 */
function isPhotoField(field: TypedFormField | FormField): field is PhotoField {
  return field.field_type === "photo";
}

export const renderFormField = (
  field: TypedFormField | FormField,
  commonProps: CommonFieldProps
): React.JSX.Element | null => {
  const key = `${commonProps.beneficiaryId}__${field.name}`;
  if (isStringField(field)) {
    return (
      <StringFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as string}
        onChange={(value) => commonProps.onChange(value)}
        minLength={field.min_length}
        maxLength={field.max_length}
      />
    );
  }

  if (isNumberField(field)) {
    return (
      <NumberFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as number | string}
        onChange={(value) => commonProps.onChange(value)}
        min={field.min_value}
        max={field.max_value}
        step={field.step}
      />
    );
  }

  if (isDateField(field)) {
    return (
      <DateFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as string}
        onChange={(value) => commonProps.onChange(value)}
        minDate={field.min_date}
        maxDate={field.max_date}
      />
    );
  }

  if (isSelectField(field)) {
    return (
      <SelectFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as string}
        onChange={(value) => commonProps.onChange(value)}
        options={field.options || []}
        multiple={field.multiple}
      />
    );
  }

  if (isDocumentField(field)) {
    return (
      <DocumentFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as string | null}
        onChange={(value) => commonProps.onChange(value ?? "")}
        fieldId={commonProps.fieldId || commonProps.name}
        beneficiaryId={commonProps.beneficiaryId || "0"}
        acceptedFormats={field.accepted_formats}
        maxSizeMB={field.max_size_mb}
        onUploadStateChange={commonProps.onUploadStateChange}
        activeUploads={commonProps.activeUploads}
      />
    );
  }

  if (isPhotoField(field)) {
    return (
      <PhotoFieldComponent
        {...commonProps}
        key={key}
        value={commonProps.value as string | null}
        onChange={(value) => commonProps.onChange(value ?? "")}
        fieldId={commonProps.fieldId || commonProps.name}
        beneficiaryId={commonProps.beneficiaryId || "0"}
        acceptedFormats={field.accepted_formats}
        maxSizeMB={field.max_size_mb}
        onUploadStateChange={commonProps.onUploadStateChange}
        requestId={commonProps.requestId}
      />
    );
  }

  return null;
};
