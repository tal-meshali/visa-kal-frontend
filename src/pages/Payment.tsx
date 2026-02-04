import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "../components/Alert";
import { SignedIn, SignedOut, useUser } from "../components/AuthComponents";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import {
  getApplication,
  updateApplicationStatus,
} from "../services/applicationService";
import {
  executePayment,
  getPaymentConfig,
  type PaymentCurrency,
} from "../services/paymentService";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const { user, isLoaded: isUserLoaded } = useUser();
  const authLoading = !isUserLoaded;
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [redirectingToPayMe, setRedirectingToPayMe] = useState(false);
  const [currency, setCurrency] = useState<PaymentCurrency>("ils");
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

  const paymentStatus = searchParams.get("status");

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentConfig"],
    queryFn: getPaymentConfig,
    staleTime: 5 * 60 * 1000,
  });
  const paymeAvailable = paymentConfig?.payme_available ?? false;

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

  // Handle return from PayMe: status=success
  useEffect(() => {
    if (!requestId || !user || paymentStatus !== "success") {
      return;
    }
    const applySuccess = async (): Promise<void> => {
      try {
        await updateApplicationStatus(requestId, "payment_received");
        setAlert({ type: "success", message: t.payment.success, isOpen: true });
        setSearchParams((prev) => {
          prev.delete("status");
          return prev;
        });
        setTimeout(() => navigate("/applications"), 2000);
      } catch {
        setAlert({ type: "error", message: t.payment.error, isOpen: true });
      }
    };
    applySuccess();
  }, [paymentStatus, requestId, user, navigate, setSearchParams, t]);

  // Handle return from PayMe: status=cancel
  useEffect(() => {
    if (paymentStatus !== "cancel") {
      return;
    }
    setAlert({
      type: "info",
      message: t.payment.paymentCanceled,
      isOpen: true,
    });
    setSearchParams((prev) => {
      prev.delete("status");
      return prev;
    });
  }, [paymentStatus, setSearchParams, t]);

  const handlePayment = async (): Promise<void> => {
    if (!user || !finalFormData || !countryId || !finalCountryName) {
      return;
    }

    setProcessing(true);
    setProgress(20);

    const result = await executePayment({
      requestId,
      countryId,
      finalFormData,
      finalCountryName,
      selectedPricing,
      paymeAvailable,
      language,
      currency,
    });

    if (result.outcome === "redirect") {
      setProgress(70);
      setRedirectingToPayMe(true);
      window.location.href = result.paymentUrl;
      return;
    }

    if (result.outcome === "not_configured") {
      setAlert({
        type: "error",
        message: t.payment.paymentNotConfigured,
        isOpen: true,
      });
      setProcessing(false);
      setProgress(0);
      return;
    }

    if (result.outcome === "error") {
      setAlert({
        type: "error",
        message: t.payment.error,
        isOpen: true,
      });
      setProcessing(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    setAlert({
      type: "success",
      message: t.payment.success,
      isOpen: true,
    });
    setTimeout(() => navigate("/applications"), 2000);
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
        {(processing || redirectingToPayMe) && (
          <LoadingScreen
            message={
              redirectingToPayMe
                ? t.payment.redirectingToPayment
                : t.payment.processing
            }
            progress={redirectingToPayMe ? 70 : progress}
          />
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
              <div className="currency-selector">
                <span className="summary-label">{t.payment.currency}</span>
                <div className="currency-options">
                  <label className="currency-option">
                    <input
                      type="radio"
                      name="payment-currency"
                      value="usd"
                      checked={currency === "usd"}
                      onChange={() => setCurrency("usd")}
                      disabled={processing || redirectingToPayMe}
                    />
                    <span>{t.payment.payInUsd}</span>
                  </label>
                  <label className="currency-option">
                    <input
                      type="radio"
                      name="payment-currency"
                      value="ils"
                      checked={currency === "ils"}
                      onChange={() => setCurrency("ils")}
                      disabled={processing || redirectingToPayMe}
                    />
                    <span>{t.payment.payInIls}</span>
                  </label>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t.payment.totalAmount}</span>
                <span className="summary-value summary-amount">
                  {selectedPricing
                    ? currency === "usd"
                      ? `$${(selectedPricing.price_usd * finalFormData.length).toFixed(2)}`
                      : `₪${(selectedPricing.price_ils * finalFormData.length).toFixed(2)}`
                    : currency === "usd"
                    ? `$${finalFormData.length * 50}.00`
                    : `₪${finalFormData.length * 180}.00`}
                </span>
              </div>
            </div>

            {!paymeAvailable && (
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
            )}

            <div className="payment-actions">
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handlePayment}
                disabled={processing || redirectingToPayMe}
                className="payment-button"
              >
                {processing || redirectingToPayMe
                  ? t.payment.processingButton
                  : paymeAvailable
                    ? t.payment.payWithPayMe
                    : t.payment.complete}
              </Button>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default Payment;
