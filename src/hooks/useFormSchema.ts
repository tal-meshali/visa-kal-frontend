import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../contexts/useLanguage";
import { fetchFormSchema, type FormSchema } from "../services/formService";

export const useFormSchema = (countryId: string | undefined) => {
  const { language } = useLanguage();

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
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    schema,
    loading: isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
  };
};
