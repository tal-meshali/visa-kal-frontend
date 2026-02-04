import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "../components/Alert";
import { SignedIn, SignedOut, useUser } from "../components/AuthComponents";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import {
  createApplication,
  getApplication,
  updateApplicationStatus,
} from "../services/applicationService";
import { getCountryPricing } from "../services/pricingService";
import type { Application } from "../services/requestService";
import "./Payment.css";

import type { FormDataRecord, TranslatedText } from "../types/formTypes";

interface LocationState {
  requestId?: string;
  formData?: FormDataRecord[];
  countryName?: TranslatedText;
}

const Payment = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user, isLoaded: isUserLoaded } = useUser();
  const authLoading = !isUserLoaded;
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "info",
    message: "",
    isOpen: false,
  });

  const state = location.state as LocationState | null;
  const requestId = state?.requestId;
  const formData = state?.formData;
  const countryName = state?.countryName;

  // Query to load application data when formData is not provided
  const {
    data: applicationData,
    isLoading: loadingRequest,
    error: applicationError,
  } = useQuery<Application>({
    queryKey: ["application", requestId],
    queryFn: () => getApplication(requestId!),
    enabled: !!requestId && !!user && !formData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract form data and country name from application
  const loadedFormData = useMemo<FormDataRecord[] | null>(() => {
    if (applicationData?.beneficiaries) {
      return applicationData.beneficiaries.map(
        (beneficiary) => beneficiary.form_data
      );
    }
    return null;
  }, [applicationData]);

  const loadedCountryName = applicationData?.country_name || null;

  // Query to load pricing plans for the country
  const {
    data: pricingPlans,
    isLoading: loadingPricingPlans,
  } = useQuery({
    queryKey: ["pricing", countryId],
    queryFn: () => getCountryPricing(countryId!),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query to load application data when we need pricing_id (when formData exists)
  const {
    data: applicationForPricing,
    isLoading: loadingApplicationForPricing,
  } = useQuery<Application, Error, string | null | undefined>({
    queryKey: ["application", requestId, "pricing"],
    queryFn: () => getApplication(requestId!),
    enabled: !!requestId && !!user && !!formData && !!countryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: Application) => data.pricing_id,
  });

  // Find selected pricing based on pricing_id from application
  const selectedPricing = useMemo(() => {
    const pricingId =
      applicationData?.pricing_id || applicationForPricing || null;
    if (pricingId && pricingPlans) {
      return pricingPlans.find((p) => p.id === pricingId) || null;
    }
    return null;
  }, [applicationData?.pricing_id, applicationForPricing, pricingPlans]);

  const loadingPricing =
    loadingPricingPlans || loadingApplicationForPricing;

  // Use loaded data if available, otherwise use state data
  const finalFormData = loadedFormData || formData;
  const finalCountryName = loadedCountryName || countryName;

  useEffect(() => {
    if (applicationError && countryId) {
      navigate(`/apply/${countryId}`);
    }
  }, [applicationError, countryId, navigate]);

  // Redirect if no form data or not authenticated
  useEffect(() => {
    if (
      !authLoading &&
      !loadingRequest &&
      (!user || !finalFormData || !countryId)
    ) {
      navigate("/");
    }
  }, [
    user,
    authLoading,
    loadingRequest,
    finalFormData,
    countryId,
    navigate,
  ]);

  const handlePayment = async (): Promise<void> => {
    if (!user || !finalFormData || !countryId || !finalCountryName) {
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Step 1: Validating application (20%)
      setProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Update request status or create application (40%)
      setProgress(40);
      if (requestId) {
        // Update existing request status to payment_received
        await updateApplicationStatus(requestId, "payment_received");
      } else {
        // Fallback: Create new application (for backward compatibility)
        const agentId = localStorage.getItem("agent_id");
        await createApplication({
          country_id: countryId,
          beneficiaries: finalFormData,
          agent_id: agentId || undefined,
        });

        // Delete agent_id from localStorage after successful submission
        if (agentId) {
          localStorage.removeItem("agent_id");
        }
      }

      // Step 3: Processing payment (70%)
      setProgress(70);
      // In a real app, you would integrate with a payment provider here
      // For now, we'll simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Finalizing (100%)
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAlert({
        type: "success",
        message: t.payment.success,
        isOpen: true,
      });

      // Redirect to applications page after a delay
      setTimeout(() => {
        navigate("/applications");
      }, 2000);
    } catch {
      setAlert({
        type: "error",
        message: t.payment.error,
        isOpen: true,
      });
      setProcessing(false);
      setProgress(0);
    }
  };

  const closeAlert = (): void => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  if (authLoading || loadingRequest || loadingPricing) {
    return <LoadingScreen message={t.common.loading} />;
  }

  if (!finalFormData || !countryId || !finalCountryName) {
    return null;
  }

  return (
    <>
      <SignedOut>
        <div className="payment-container">
          <div className="error-message-history">
            {t.payment.signInToComplete}
          </div>
          <Button variant="back" onClick={() => navigate("/")}>
            ← {t.form.back}
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        {processing && (
          <LoadingScreen message={t.payment.processing} progress={progress} />
        )}
        <Alert
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={closeAlert}
          duration={4000}
        />
        <div className="payment-container">
          <div className="payment-content">
            <div className="payment-header">
              <Button
                variant="back"
                onClick={() => {
                  navigate(`/apply/${countryId}`, {
                    state: requestId ? { requestId } : undefined,
                  });
                }}
              >
                ← {t.form.back}
              </Button>
              <h1 className="payment-title">{t.payment.title}</h1>
            </div>

            <div className="payment-summary">
              <h2 className="summary-title">{t.payment.summary}</h2>
              <div className="summary-item">
                <span className="summary-label">{t.payment.country}</span>
                <span className="summary-value">{finalCountryName[language]}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t.payment.beneficiaries}</span>
                <span className="summary-value">{finalFormData.length}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">{t.payment.totalAmount}</span>
                <span className="summary-value summary-amount">
                  {selectedPricing
                    ? language === "en"
                      ? `$${(selectedPricing.price_usd * finalFormData.length).toFixed(2)}`
                      : `₪${(selectedPricing.price_ils * finalFormData.length).toFixed(2)}`
                    : language === "en"
                    ? `$${finalFormData.length * 50}.00`
                    : `₪${finalFormData.length * 180}.00`}
                </span>
              </div>
            </div>

            <div className="payment-methods">
              <h2 className="methods-title">{t.payment.method}</h2>
              <div className="payment-method-card">
                <div className="method-header">
                  <input
                    type="radio"
                    id="credit-card"
                    name="payment-method"
                    defaultChecked
                    className="method-radio"
                  />
                  <label htmlFor="credit-card" className="method-label">
                    {t.payment.creditCard}
                  </label>
                </div>
                <div className="method-details">
                  <div className="payment-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder={t.payment.cardNumber}
                        className="payment-input"
                        disabled={processing}
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder={t.payment.cardholderName}
                        className="payment-input"
                        disabled={processing}
                      />
                    </div>
                    <div className="form-row form-row-split">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="payment-input"
                        disabled={processing}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="payment-input"
                        disabled={processing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-actions">
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handlePayment}
                disabled={processing}
                className="payment-button"
              >
                {processing ? t.payment.processingButton : t.payment.complete}
              </Button>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default Payment;
