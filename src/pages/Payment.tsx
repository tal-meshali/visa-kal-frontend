import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadedFormData, setLoadedFormData] = useState<FormDataRecord[] | null>(
    null
  );
  const [loadedCountryName, setLoadedCountryName] =
    useState<TranslatedText | null>(null);

  // Load form data from request if requestId exists
  useEffect(() => {
    const loadRequestData = async () => {
      if (requestId && user && !formData) {
        setLoadingRequest(true);
        try {
          const application = await getApplication(requestId);
          // Extract form data from beneficiaries
          const beneficiariesFormData = application.beneficiaries.map(
            (beneficiary) => beneficiary.form_data
          );
          setLoadedFormData(beneficiariesFormData);
          setLoadedCountryName(application.country_name);
        } catch (error) {
          setAlert({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to load application data",
            isOpen: true,
          });
          // Redirect back if loading fails
          navigate(`/apply/${countryId}`);
        } finally {
          setLoadingRequest(false);
        }
      }
    };

    loadRequestData();
  }, [requestId, user, formData, countryId, navigate]);

  // Use loaded data if available, otherwise use state data
  const finalFormData = loadedFormData || formData;
  const finalCountryName = loadedCountryName || countryName;

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

  if (authLoading || loadingRequest) {
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
                onClick={() =>
                  navigate(`/apply/${countryId}`, {
                    state: requestId ? { requestId } : undefined,
                  })
                }
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
                  {language === "en"
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
