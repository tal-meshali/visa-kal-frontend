import { apiDelete, apiPostFormData } from "./apiService";

export interface UploadFileResponse {
  url: string;
  field_name: string;
  beneficiary_id: string;
  filename: string;
}

export const uploadFileToBucket = async (
  file: File,
  fieldName: string,
  beneficiaryId: string
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const url = `/api/upload-file?field_name=${encodeURIComponent(
    fieldName
  )}&beneficiary_id=${encodeURIComponent(beneficiaryId)}`;
  return apiPostFormData<UploadFileResponse>(url, formData);
};

export const deleteFileFromBucket = async (fileUrl: string): Promise<void> => {
  await apiDelete(`/api/delete-file?file_url=${encodeURIComponent(fileUrl)}`);
};
