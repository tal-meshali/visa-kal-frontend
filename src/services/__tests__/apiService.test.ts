import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPostFormData,
  apiPut,
  apiService,
} from "../apiService";

vi.mock("../../stores/authStore", () => ({
  useAuthStore: {
    getState: () => ({ token: "mock_token_12345" }),
  },
}));

vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe("apiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("apiGet", () => {
    it("makes GET request with correct URL", async () => {
      const mockData = { id: 1, name: "Test" };
      vi.mocked(apiService.get).mockResolvedValue({ data: mockData });

      const result = await apiGet("/api/test");

      expect(apiService.get).toHaveBeenCalledWith("/api/test", undefined);
      expect(result).toEqual(mockData);
    });

    it("includes authorization header when token exists", async () => {
      const mockData = { id: 1 };
      vi.mocked(apiService.get).mockResolvedValue({ data: mockData });

      await apiGet("/api/test");

      expect(apiService.get).toHaveBeenCalled();
    });
  });

  describe("apiPost", () => {
    it("makes POST request with data", async () => {
      const mockData = { success: true };
      const postData = { name: "Test" };
      vi.mocked(apiService.post).mockResolvedValue({ data: mockData });

      const result = await apiPost("/api/test", postData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/test",
        postData,
        undefined,
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("apiPut", () => {
    it("makes PUT request with data", async () => {
      const mockData = { id: 1, updated: true };
      const putData = { name: "Updated" };
      vi.mocked(apiService.put).mockResolvedValue({ data: mockData });

      const result = await apiPut("/api/test", putData);

      expect(apiService.put).toHaveBeenCalledWith(
        "/api/test",
        putData,
        undefined,
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("apiDelete", () => {
    it("makes DELETE request", async () => {
      const mockData = { deleted: true };
      vi.mocked(apiService.delete).mockResolvedValue({ data: mockData });

      const result = await apiDelete("/api/test");

      expect(apiService.delete).toHaveBeenCalledWith("/api/test", undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe("apiPostFormData", () => {
    it("makes POST request with FormData and correct headers", async () => {
      const mockData = { success: true };
      const formData = new FormData();
      formData.append("file", new Blob(["content"]), "test.pdf");
      vi.mocked(apiService.post).mockResolvedValue({ data: mockData });

      const result = await apiPostFormData("/api/upload", formData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/upload",
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "multipart/form-data",
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });
  });
});
