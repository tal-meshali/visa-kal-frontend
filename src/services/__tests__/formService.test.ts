import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPost } from "../apiService";
import {
  fetchFormSchema,
  initializeFormData,
  validateFormData,
} from "../formService";

vi.mock("../apiService");

describe("formService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchFormSchema", () => {
    it("fetches form schema for a valid country", async () => {
      const mockSchema = {
        country_id: "morocco",
        country_name: { en: "Morocco", he: "מרוקו" },
        fields: [],
        submit_button_text: { en: "Submit", he: "שלח" },
      };

      vi.mocked(apiGet).mockResolvedValue(mockSchema);

      const result = await fetchFormSchema("morocco", "en");

      expect(apiGet).toHaveBeenCalledWith(
        "/api/form-schema/morocco?language=en"
      );
      expect(result).toEqual(mockSchema);
    });

    it("throws error when countryId is undefined", async () => {
      await expect(fetchFormSchema(undefined, "en")).rejects.toThrow(
        "Country ID is required"
      );
    });

    it("uses correct language parameter", async () => {
      const mockSchema = {
        country_id: "morocco",
        country_name: { en: "Morocco", he: "מרוקו" },
        fields: [],
        submit_button_text: { en: "Submit", he: "שלח" },
      };

      vi.mocked(apiGet).mockResolvedValue(mockSchema);

      await fetchFormSchema("morocco", "he");

      expect(apiGet).toHaveBeenCalledWith(
        "/api/form-schema/morocco?language=he"
      );
    });
  });

  describe("validateFormData", () => {
    it("validates form data successfully", async () => {
      const mockValidationResult = {
        valid: true,
        errors: [],
      };

      vi.mocked(apiPost).mockResolvedValue(mockValidationResult);

      const formData = { name: "John Doe", age: 30 };
      const result = await validateFormData("morocco", formData, "en");

      expect(apiPost).toHaveBeenCalledWith(
        "/api/validate/morocco?language=en",
        formData
      );
      expect(result).toEqual(mockValidationResult);
    });

    it("sanitizes File objects in form data", async () => {
      const mockValidationResult = {
        valid: true,
        errors: [],
      };

      vi.mocked(apiPost).mockResolvedValue(mockValidationResult);

      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const formData = { name: "John", document: file };

      await validateFormData("morocco", formData, "en");

      expect(apiPost).toHaveBeenCalledWith(
        "/api/validate/morocco?language=en",
        { name: "John", document: "test.pdf" }
      );
    });

    it("throws error when countryId is undefined", async () => {
      await expect(validateFormData(undefined, {}, "en")).rejects.toThrow(
        "Country ID is required"
      );
    });
  });

  describe("initializeFormData", () => {
    it("initializes form data with default values", () => {
      const fields: FormField[] = [
        {
          name: "field1",
          label: { en: "Field 1", he: "שדה 1" },
          field_type: "string",
          default_value: "default1",
        },
        {
          name: "field2",
          label: { en: "Field 2", he: "שדה 2" },
          field_type: "string",
          default_value: "default2",
        },
      ];

      const result = initializeFormData(fields);

      expect(result).toEqual({
        field1: "default1",
        field2: "default2",
      });
    });

    it("converts number default values to numbers", () => {
      const fields: FormField[] = [
        {
          name: "age",
          label: { en: "Age", he: "גיל" },
          field_type: "number",
          default_value: "25",
        },
      ];

      const result = initializeFormData(fields);

      expect(result).toEqual({
        age: 25,
      });
    });

    it("handles fields without default values", () => {
      const fields: FormField[] = [
        {
          name: "field1",
          label: { en: "Field 1", he: "שדה 1" },
          field_type: "string",
          default_value: "default1",
        },
        {
          name: "field2",
          label: { en: "Field 2", he: "שדה 2" },
          field_type: "string",
        },
      ];

      const result = initializeFormData(fields);

      expect(result).toEqual({
        field1: "default1",
      });
    });

    it("returns empty object for empty fields array", () => {
      const result = initializeFormData([]);
      expect(result).toEqual({});
    });
  });
});
