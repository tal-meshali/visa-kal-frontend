import { apiGet, apiPost } from './apiService'

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  role?: string
  created_at: string
}

/**
 * Authenticates with Google user data
 * This endpoint doesn't require auth token
 */
export const authenticateWithGoogle = async (googleUser: any): Promise<User> => {
  return apiPost<User>('/api/auth/google', googleUser)
}

/**
 * Gets the current authenticated user
 * Token is automatically provided by apiService from localStorage
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiGet<User>('/api/auth/me')
}
