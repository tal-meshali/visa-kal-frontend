import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "../components/Alert";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import { fetchCountries } from "../services/countryService";
import { getCountryPricing, type Pricing } from "../services/pricingService";
import "./CountryPage.css";

const CountryPage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [pricingPlans, setPricingPlans] = useState<Pricing[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "info",
    message: "",
    isOpen: false,
  });

  // Fetch countries to get country info
  const {
    data: countriesData,
    isLoading: loadingCountries,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 5 * 60 * 1000,
  });

  const allCountries = [
    ...(countriesData?.available || []),
    ...(countriesData?.coming_soon || []),
  ];
  const country = allCountries.find((c) => c.id === countryId);

  // Load pricing plans
  useEffect(() => {
    const loadPricing = async () => {
      if (!countryId) {
        return;
      }

      setLoadingPricing(true);
      try {
        const plans = await getCountryPricing(countryId);
        setPricingPlans(plans);
      } catch (error) {
        setAlert({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : t.pricing.failedToLoad,
          isOpen: true,
        });
      } finally {
        setLoadingPricing(false);
      }
    };

    loadPricing();
  }, [countryId, t]);

  // Redirect if country not found
  useEffect(() => {
    if (!loadingCountries && !country && countryId) {
      navigate("/", { replace: true });
    }
  }, [country, loadingCountries, countryId, navigate]);

  const handleStartApplication = () => {
    navigate(`/apply/${countryId}`);
  };

  if (loadingCountries || loadingPricing) {
    return <LoadingScreen message={t.common.loading} />;
  }

  if (!country) {
    return null;
  }

  const descriptions = t.countries.descriptions as Record<string, { en: string; he: string }> | undefined;
  const countryDescription =
    (country.id && descriptions?.[country.id]) ||
    (countryId && descriptions?.[countryId]) ||
    {
      en: "Apply for your electronic visa to this destination.",
      he: "הגש בקשה לויזה אלקטרונית ליעד זה.",
    };

  return (
    <div className="country-page">
      <div className="country-page-container">
        <BackButton onClick={() => navigate("/")} />
        
        <div className="country-page-header">
          <div className="country-page-flag">
            <img src={country.flag_svg_link} alt={country.name[language]} />
          </div>
          <h1 className="country-page-title">{country.name[language]}</h1>
        </div>

        <div className="country-page-content">
          <section className="country-description-section">
            <h2 className="country-section-title">
              {t.countries.visaProcess.title}
            </h2>
            <div className="country-description">
              {countryDescription[language]}
            </div>
          </section>

          <section className="country-pricing-section">
            <h2 className="country-section-title">
              {t.countries.pricing.title}
            </h2>
            {pricingPlans.length === 0 ? (
              <p className="country-pricing-empty">
                {t.pricing.noPlansAvailable}
              </p>
            ) : (
              <div className="country-pricing-list">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className="country-pricing-item">
                    <h3 className="country-pricing-item-title">
                      {language === "he"
                        ? plan.name_he
                        : plan.name_en} - ₪{plan.price_ils}
                    </h3>
                    <p className="country-pricing-item-description">
                      {language === "he"
                        ? plan.description_he
                        : plan.description_en}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {country.enabled && (
            <div className="country-page-actions">
              <Button
                variant="primary"
                size="large"
                onClick={handleStartApplication}
              >
                {t.countries.startApplication}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
};

export default CountryPage;
