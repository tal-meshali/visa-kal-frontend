import { apiPostFormData, apiDelete } from './apiService'

export interface UploadFileResponse {
  url: string
  field_name: string
  beneficiary_id: string
  filename: string
}

/**
 * Uploads a file to S3
 * Token is automatically provided by apiService from localStorage
 */
export const uploadFileToS3 = async (
  file: File,
  fieldName: string,
  beneficiaryId: string
): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const url = `/api/upload-file?field_name=${encodeURIComponent(fieldName)}&beneficiary_id=${encodeURIComponent(beneficiaryId)}`
  return apiPostFormData<UploadFileResponse>(url, formData)
}

/**
 * Deletes a file from S3
 * Token is automatically provided by apiService from localStorage
 */
export const deleteFileFromS3 = async (
  s3Url: string
): Promise<void> => {
  await apiDelete(`/api/delete-file?s3_url=${encodeURIComponent(s3Url)}`)
}


