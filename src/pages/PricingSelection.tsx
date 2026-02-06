import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { SignedIn, SignedOut, useUser } from "../components/AuthComponents";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import { getKeyDownActivateHandler } from "../hooks/useKeyDownActivate";
import { updateApplicationPricing } from "../services/applicationService";
import { getCountryPricing, type Pricing } from "../services/pricingService";
import type { FormDataRecord, TranslatedText } from "../types/formTypes";
import "./PricingSelection.css";

interface LocationState {
  requestId?: string;
  formData?: FormDataRecord[];
  countryName?: TranslatedText;
}

const PricingSelection = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user, isLoaded: isUserLoaded } = useUser();
  const authLoading = !isUserLoaded;

  const state = location.state as LocationState | null;
  const requestId = state?.requestId;
  const formData = state?.formData;
  const countryName = state?.countryName;

  const [pricingPlans, setPricingPlans] = useState<Pricing[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "info",
    message: "",
    isOpen: false,
  });

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
        if (plans.length === 0) {
          setAlert({
            type: "error",
            message: t.pricing.noPlansAvailable,
            isOpen: true,
          });
        }
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

  // Redirect if not authenticated or missing data
  useEffect(() => {
    if (
      !authLoading &&
      (!user || !requestId || !countryId)
    ) {
      navigate("/");
    }
  }, [user, authLoading, requestId, countryId, navigate]);

  const handleSelectPricing = (pricingId: string) => {
    setSelectedPricingId(pricingId);
  };

  const handleContinue = async (): Promise<void> => {
    if (!selectedPricingId || !requestId) {
      setAlert({
        type: "error",
        message: t.pricing.pleaseSelect,
        isOpen: true,
      });
      return;
    }

    setProcessing(true);
    try {
      await updateApplicationPricing(requestId, selectedPricingId);

      // Navigate to payment page
      navigate(`/payment/${countryId}`, {
        state: {
          requestId,
          formData,
          countryName,
        },
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t.pricing.failedToUpdate,
        isOpen: true,
      });
      setProcessing(false);
    }
  };

  if (authLoading || loadingPricing) {
    return <LoadingScreen message={t.pricing.loading} />;
  }

  const selectedPlan = pricingPlans.find((p) => p.id === selectedPricingId);

  return (
    <>
      <SignedOut>
        <div className="pricing-container">
          <div className="sign-in-prompt">
            <h2 className="sign-in-title">{t.form.signInRequired}</h2>
            <p className="sign-in-message">{t.form.signInMessage}</p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="pricing-container">
          <BackButton onClick={() => navigate(-1)} />
          <div className="pricing-header">
            <h1 className="pricing-title">
              {t.pricing.title} {countryName?.[language]}
            </h1>
            <p className="pricing-subtitle">{t.pricing.subtitle}</p>
          </div>

          <div className="pricing-plans">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPricingId === plan.id}
                className={`pricing-card ${
                  selectedPricingId === plan.id ? "selected" : ""
                }`}
                onClick={() => handleSelectPricing(plan.id)}
                onKeyDown={getKeyDownActivateHandler(() =>
                  handleSelectPricing(plan.id)
                )}
              >
                <div className="pricing-card-header">
                  <h3 className="pricing-plan-name">
                    {language === "he" ? plan.name_he : plan.name_en}
                  </h3>
                  {selectedPricingId === plan.id && (
                    <span className="pricing-selected-badge">
                      {t.pricing.selected}
                    </span>
                  )}
                </div>
                <p className="pricing-plan-description">
                  {language === "he" ? plan.description_he : plan.description_en}
                </p>
                <div className="pricing-plan-prices">
                  <div className="pricing-price">
                    <span className="pricing-currency">₪</span>
                    <span className="pricing-amount">{plan.price_ils}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pricingPlans.length === 0 && (
            <div className="pricing-empty">
              <p>{t.pricing.noPlansAvailable}</p>
            </div>
          )}

          <div className="pricing-actions">
            <Button
              variant="primary"
              size="large"
              onClick={handleContinue}
              disabled={!selectedPricingId || processing}
            >
              {processing ? t.pricing.processing : t.pricing.continue}
            </Button>
          </div>

          {selectedPlan && (
            <div className="pricing-summary">
              <h3>{t.pricing.summary}</h3>
              <div className="pricing-summary-item">
                <span>{t.pricing.planName}</span>
                <span>
                {language === "he"
                  ? selectedPlan.name_he
                  : selectedPlan.name_en}
              </span>
              </div>
              <div className="pricing-summary-item">
                <span>{t.pricing.beneficiariesCount}</span>
                <span>{formData?.length ?? 0}</span>
              </div>
              <div className="pricing-summary-item">
                <span>{t.pricing.pricePerPerson}</span>
                <span>₪{selectedPlan.price_ils}</span>
              </div>
              <div className="pricing-summary-item">
                <span>{t.pricing.totalPrice}</span>
                <span className="pricing-summary-price">
                  ₪{(selectedPlan.price_ils * (formData?.length ?? 1)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </SignedIn>

      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </>
  );
};

export default PricingSelection;
