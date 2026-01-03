import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { getTokenFromStorage } from "../utils/tokenManager";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Gets the Clerk token from localStorage
 * Token is automatically synced by useClerkTokenSync hook
 */
const getStoredToken = (): string | null => {
  return getTokenFromStorage();
};

/**
 * Creates an axios instance with automatic token injection from localStorage
 * The token is synced from Clerk via useClerkTokenSync hook
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Request interceptor to add auth token from localStorage
  instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;

        // Handle 401 Unauthorized - token might be invalid
        // if (status === 401) {
        //   localStorage.removeItem(CLERK_TOKEN_KEY);
        // }

        const errorMessage =
          data?.detail || data?.message || error.message || "An error occurred";
        return Promise.reject(new Error(errorMessage));
      }

      if (error.request) {
        return Promise.reject(
          new Error(
            `Cannot connect to backend at ${API_BASE_URL}. Is the server running?`
          )
        );
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiService = createApiInstance();

/**
 * GET request helper
 */
export const apiGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiService.get<T>(url, config);
  return response.data;
};

/**
 * POST request helper
 */
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiService.post<T>(url, data, config);
  return response.data;
};

/**
 * PUT request helper
 */
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiService.put<T>(url, data, config);
  return response.data;
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiService.patch<T>(url, data, config);
  return response.data;
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiService.delete<T>(url, config);
  return response.data;
};

/**
 * POST FormData helper for file uploads
 * Automatically sets Content-Type to multipart/form-data
 */
export const apiPostFormData = async <T = any>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> => {
  const token = getStoredToken();
  console.log({ token });
  const response = await apiService.post<T>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return response.data;
};
