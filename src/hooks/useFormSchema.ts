import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../contexts/useLanguage";
import { useTokenReady } from "../contexts/TokenReadyContext";
import { fetchFormSchema } from "../services/formService";
import type { FormSchema } from "../types/formTypes";

export const useFormSchema = (countryId: string | undefined) => {
  const { language } = useLanguage();
  const tokenReady = useTokenReady();

  const {
    data: schema,
    isLoading,
    error,
  } = useQuery<FormSchema>({
    queryKey: ["formSchema", countryId, language],
    queryFn: () => {
      if (!countryId) {
        throw new Error("Country ID is required");
      }
      return fetchFormSchema(countryId, language);
    },
    enabled: !!countryId && tokenReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    schema,
    loading: isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
  };
};
