import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Creates an axios instance with automatic token injection.
 * Token is resolved at request time via getTokenForRequest (supports already-logged-in users).
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response) {
        const data = error.response.data as {
          detail?: string;
          message?: string;
        };

        const errorMessage =
          data?.detail || data?.message || error.message || "An error occurred";
        return Promise.reject(new Error(errorMessage));
      }

      if (error.request) {
        return Promise.reject(
          new Error(
            `Cannot connect to backend at ${API_BASE_URL}. Is the server running?`,
          ),
        );
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export const apiService = createApiInstance();

/**
 * GET request helper
 */
export const apiGet = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.get<T>(url, config);
  return response.data;
};

/**
 * POST request helper
 */
export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.post<T>(url, data, config);
  return response.data;
};

/**
 * PUT request helper
 */
export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.put<T>(url, data, config);
  return response.data;
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.patch<T>(url, data, config);
  return response.data;
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.delete<T>(url, config);
  return response.data;
};

/**
 * POST FormData helper for file uploads
 * Automatically sets Content-Type to multipart/form-data
 */
export const apiPostFormData = async <T = unknown>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await apiService.post<T>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
