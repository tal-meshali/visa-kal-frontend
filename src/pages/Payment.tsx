import {
  SignedIn,
  SignedOut,
  useUser,
} from "../components/AuthComponents";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import { createApplication } from "../services/applicationService";
import "./Payment.css";

import type {
  FormDataInput,
  FormDataRecord,
  TranslatedText,
} from "../types/formTypes";

interface LocationState {
  formData?: FormDataInput & { beneficiaries: FormDataRecord[] };
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
  const formData = state?.formData;
  const countryName = state?.countryName;

  // Redirect if no form data or not authenticated
  useEffect(() => {
    if (!authLoading && (!user || !formData || !countryId)) {
      navigate("/");
    }
  }, [user, authLoading, formData, countryId, navigate]);

  const handlePayment = async (): Promise<void> => {
    if (!user || !formData || !countryId || !countryName) {
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Step 1: Validating application (20%)
      setProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Creating application in backend (40%)
      setProgress(40);
      // Get agent_id from localStorage if it exists
      const agentId = localStorage.getItem("agent_id");
      // Convert FormDataInput to FormDataRecord for API
      // If it's a single record, use it directly; if it has beneficiaries, use the first one
      const formDataRecord =
        formData && "beneficiaries" in formData
          ? formData.beneficiaries[0] || {}
          : formData || {};
      await createApplication({
        country_id: countryId,
        country_name: countryName,
        form_data: formDataRecord,
        agent_id: agentId || undefined,
      });

      // Delete agent_id from localStorage after successful submission
      if (agentId) {
        localStorage.removeItem("agent_id");
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

  if (authLoading) {
    return <LoadingScreen message={t.common.loading} />;
  }

  if (!formData || !countryId || !countryName) {
    return null;
  }

  return (
    <>
      <SignedOut>
        <div className="payment-container">
          <div className="error-message-history">
            {t.payment.signInToComplete}
          </div>
          <BackButton />
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
              <BackButton path={`/apply/${countryId}`} />
              <h1 className="payment-title">{t.payment.title}</h1>
            </div>

            <div className="payment-summary">
              <h2 className="summary-title">{t.payment.summary}</h2>
              <div className="summary-item">
                <span className="summary-label">{t.payment.country}</span>
                <span className="summary-value">{countryName[language]}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t.payment.beneficiaries}</span>
                <span className="summary-value">
                  {formData && "beneficiaries" in formData
                    ? formData.beneficiaries.length
                    : 1}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">{t.payment.totalAmount}</span>
                <span className="summary-value summary-amount">
                  {language === "en"
                    ? `$${
                        (formData && "beneficiaries" in formData
                          ? formData.beneficiaries.length
                          : 1) * 50
                      }.00`
                    : `₪${
                        (formData && "beneficiaries" in formData
                          ? formData.beneficiaries.length
                          : 1) * 180
                      }.00`}
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
