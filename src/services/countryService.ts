import axios from "axios";
import type { TranslatedText } from "../types/formTypes";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Country {
  id: string;
  name: TranslatedText;
  flag_svg_link: string;
  enabled: boolean;
}

export interface CountriesResponse {
  available: Country[];
  coming_soon: Country[];
}

/**
 * Fetches all countries from the API
 * This is an unauthenticated request
 */
export const fetchCountries = async (): Promise<CountriesResponse> => {
  const response = await axios.get<CountriesResponse>(
    `${API_BASE_URL}/api/countries`
  );
  return response.data;
};
