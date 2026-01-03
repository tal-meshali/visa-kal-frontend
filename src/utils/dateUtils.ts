export const formatDate = (
  dateString: string | null,
  language: "en" | "he" = "en"
): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const locale = language === "he" ? "he-IL" : "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


