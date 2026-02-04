import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useList } from "react-use";
import { Alert } from "../components/Alert";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from "../components/AuthComponents";
import { BackButton } from "../components/BackButton";
import { BeneficiaryForm } from "../components/BeneficiaryForm";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import PassportDataModal from "../components/PassportDataModal";
import { useLanguage } from "../contexts/useLanguage";
import { useFormSchema } from "../hooks/useFormSchema";
import { useFormValidation } from "../hooks/useFormValidation";
import {
  createApplication,
  getApplication,
} from "../services/applicationService";
import { initializeFormData } from "../services/formService";
import type {
  FormDataRecord,
  FormFieldValue,
  FormSchema,
} from "../types/formTypes";
import "./ApplicationForm.css";

const ApplicationForm = () => {
  const { t } = useLanguage();
  return (
    <>
      <SignedOut>
        <div className="form-container">
          <div className="sign-in-prompt">
            <h2 className="sign-in-title">{t.form.signInRequired}</h2>
            <p className="sign-in-message">{t.form.signInMessage}</p>
            <SignInButton>
              <Button variant="primary" size="large">
                {t.form.signIn}
              </Button>
            </SignInButton>
            <BackButton className="sign-in-back-button" />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <ApplicationFormSignedIn />
      </SignedIn>
    </>
  );
};

const ApplicationFormSignedIn = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const { t } = useLanguage();
  const { schema, loading, error: schemaError } = useFormSchema(countryId);

  // Show loading while checking auth or loading schema
  if (loading || (!schema && !schemaError)) {
    return <LoadingScreen message={t.form.loading} />;
  }

  return schemaError ? (
    <div className="form-container">
      <div className="error-message-form">{t.form.failedToLoad}</div>
      <BackButton />
    </div>
  ) : !schema ? (
    <div className="form-container">
      <div className="error-message-form">{t.form.notFound}</div>
    </div>
  ) : (
    <ApplicationFormComponent schema={schema} />
  );
};

const ApplicationFormComponent = ({ schema }: { schema: FormSchema }) => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isLoaded: isUserLoaded } = useUser();
  const authLoading = !isUserLoaded;
  const { getErrors, submitting, validate, clearFieldError } =
    useFormValidation();

  // Check if requestId is provided in location state
  const locationState = location.state as { requestId?: string } | null;
  const requestId = locationState?.requestId;
  const [loadingRequest, setLoadingRequest] = useState(!!requestId);

  // Manage multiple beneficiaries
  const [
    beneficiaries,
    {
      push: pushBeneficiary,
      updateAt: updateAtBeneficiaries,
      removeAt: removeBeneficiary,
      set: setBeneficiaries,
    },
  ] = useList<FormDataRecord>([initializeFormData(schema.fields)]);

  // Track the last loaded requestId to prevent duplicate fetches
  const lastLoadedRequestIdRef = useRef<string | null>(null);

  // Load form data from request if requestId is provided
  useEffect(() => {
    const loadRequestData = async () => {
      if (requestId && user && isUserLoaded) {
        // Prevent fetching the same requestId multiple times
        if (lastLoadedRequestIdRef.current === requestId) {
          setLoadingRequest(false);
          return;
        }

        try {
          lastLoadedRequestIdRef.current = requestId;
          const application = await getApplication(requestId);
          // Extract form data from beneficiaries
          const beneficiariesFormData = application.beneficiaries.map(
            (beneficiary) => beneficiary.form_data
          );
          if (beneficiariesFormData.length > 0) {
            setBeneficiaries(beneficiariesFormData);
          }
        } catch (error) {
          console.error("Failed to load request data:", error);
          // Continue with empty form if loading fails
          lastLoadedRequestIdRef.current = null;
        } finally {
          setLoadingRequest(false);
        }
      } else if (!requestId) {
        lastLoadedRequestIdRef.current = null;
        setLoadingRequest(false);
      }
    };

    loadRequestData();
  }, [requestId, user, isUserLoaded, setBeneficiaries]);

  // Use ref to track latest beneficiaries state to prevent race conditions
  const beneficiariesRef = useRef(beneficiaries);
  useEffect(() => {
    beneficiariesRef.current = beneficiaries;
  }, [beneficiaries]);

  const [activeBeneficiaryIndex, setActiveBeneficiaryIndex] = useState(0);
  // Track which fields should be auto-copied to new beneficiaries
  const [autoCopyFields, setAutoCopyFields] = useState<Set<string>>(
    new Set(
      schema.fields
        .filter((field) => field.auto_copy)
        .map((field) => field.name)
    )
  );
  // Track active uploads to disable submit button
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  // Queue of beneficiary indices needing passport data modal (one modal at a time)
  const [pendingPassportModals, setPendingPassportModals] = useState<
    number[]
  >([]);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "info",
    message: "",
    isOpen: false,
  });

  // Show sign-in prompt if not authenticated (don't redirect immediately)
  useEffect(() => {
    if (!authLoading && !user) {
      (() =>
        setAlert({
          type: "info",
          message: t.form.signInMessage,
          isOpen: true,
        }))();
    }
  }, [user, authLoading, language, t.form.signInMessage]);

  // Show loading while loading request data
  if (loadingRequest) {
    return <LoadingScreen message={t.form.loading} />;
  }

  const handleFieldChange = (
    beneficiaryIndex: number,
    fieldName: string,
    value: FormFieldValue
  ): void => {
    updateAtBeneficiaries(beneficiaryIndex, {
      ...beneficiariesRef.current[beneficiaryIndex],
      [fieldName]: value,
    });

    // Clear error for this field
    clearFieldError(beneficiaryIndex, fieldName);
  };

  const handleCopyFromPrevious = (
    beneficiaryIndex: number,
    fieldName: string,
    previousValue: FormFieldValue
  ): void => {
    if (beneficiaryIndex > 0) {
      handleFieldChange(beneficiaryIndex, fieldName, previousValue);
    }
  };

  const handleAutoCopyToggle = (fieldName: string, checked: boolean): void => {
    setAutoCopyFields((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fieldName);
      } else {
        newSet.delete(fieldName);
      }
      return newSet;
    });
  };

  const handleAddBeneficiary = (): void => {
    if (schema) {
      const newBeneficiary = initializeFormData(schema.fields);

      // Copy values from the first beneficiary for auto-copy enabled fields
      if (beneficiaries.length > 0 && autoCopyFields.size > 0) {
        const firstBeneficiary = beneficiaries[0];
        autoCopyFields.forEach((fieldName) => {
          if (
            firstBeneficiary[fieldName] !== undefined &&
            firstBeneficiary[fieldName] !== ""
          ) {
            newBeneficiary[fieldName] = firstBeneficiary[fieldName];
          }
        });
      }

      pushBeneficiary(newBeneficiary);
      setActiveBeneficiaryIndex(beneficiaries.length);
    }
  };

  const handleRemoveBeneficiary = (index: number): void => {
    if (beneficiaries.length > 1) {
      removeBeneficiary(index);
      if (activeBeneficiaryIndex >= beneficiaries.length - 1) {
        setActiveBeneficiaryIndex(Math.max(0, activeBeneficiaryIndex - 1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Prepare form data for validation (always as list of beneficiaries)
    const validationData = beneficiaries;

    const isValid = await validate(countryId, validationData, language);

    if (!isValid) {
      setAlert({
        type: "error",
        message: t.form.submitError,
        isOpen: true,
      });
      return;
    }

    // Create request with pending_payment status (only if not already created)
    if (schema && countryId) {
      try {
        if (requestId) {
          // Request already exists, just navigate to pricing selection
          navigate(`/pricing/${countryId}`, {
            state: {
              requestId,
              formData: validationData,
              countryName: schema.country_name,
            },
          });
        } else {
          // Create new request
          const agentId = localStorage.getItem("agent_id");

          const request = await createApplication({
            country_id: countryId,
            beneficiaries: validationData,
            agent_id: agentId || undefined,
          });

          // Navigate to pricing selection page with request ID
          navigate(`/pricing/${countryId}`, {
            state: {
              requestId: request.id,
              formData: validationData,
              countryName: schema.country_name,
            },
          });
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: error instanceof Error ? error.message : t.form.submitError,
          isOpen: true,
        });
      }
    }
  };

  const closeAlert = (): void => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUploadStateChange = (
    uploadId: string,
    isUploading: boolean
  ): void => {
    setActiveUploads((prev) => {
      const newSet = new Set(prev);
      if (isUploading) {
        newSet.add(uploadId);
      } else {
        newSet.delete(uploadId);
      }
      return newSet;
    });
  };

  const handlePassportUploadComplete = useCallback((beneficiaryIndex: number) => {
    setPendingPassportModals((prev) => [...prev, beneficiaryIndex]);
  }, []);

  const handlePassportModalClose = useCallback(() => {
    setPendingPassportModals((prev) => prev.slice(1));
  }, []);

  const currentPassportModalBeneficiary =
    pendingPassportModals.length > 0 ? pendingPassportModals[0] : null;

  return (
    <>
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        duration={4000}
      />
      {currentPassportModalBeneficiary !== null && (
        <PassportDataModal
          isOpen
          onClose={handlePassportModalClose}
          beneficiaryId={currentPassportModalBeneficiary.toString()}
          requestId={requestId}
        />
      )}
      <div className="form-container">
        <div className="form-header">
          <BackButton />
          <div className="form-header-controls">
            {user && (
              <div className="form-user-profile">
                <img
                  src={
                    user.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.fullName ||
                        user.primaryEmailAddress?.emailAddress ||
                        "User"
                    )}`
                  }
                  alt={user.fullName || "User"}
                  className="form-user-avatar"
                  title={
                    user.fullName ||
                    user.primaryEmailAddress?.emailAddress ||
                    "User"
                  }
                />
                <span className="form-user-name">
                  {user.fullName ||
                    user.primaryEmailAddress?.emailAddress ||
                    "User"}
                </span>
              </div>
            )}
            <button
              className="lang-toggle lang-toggle-flag"
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              aria-label={language === "en" ? t.common.hebrew : t.common.english}
              title={language === "en" ? t.common.hebrew : t.common.english}
            >
              <img
                src={language === "en" ? "/flags/il.svg" : "/flags/gb.svg"}
                alt=""
                width={24}
                height={18}
                className="lang-flag-img"
              />
            </button>
          </div>
        </div>

        <div className="form-content">
          <h1 className="form-title">
            {t.form.title}{schema.country_name[language]}
          </h1>
          <p className="form-description">{t.form.description}</p>

          <form onSubmit={handleSubmit} className="application-form">
            {/* Beneficiaries Tabs */}
            {beneficiaries.length > 1 && (
              <div className="beneficiaries-tabs">
                {beneficiaries.map((_, index) => (
                  <div
                    key={index}
                    className={`beneficiary-tab ${
                      activeBeneficiaryIndex === index ? "active" : ""
                    }`}
                    onClick={() => setActiveBeneficiaryIndex(index)}
                  >
                    {t.form.beneficiary} {index + 1}
                    {beneficiaries.length > 1 && (
                      <button
                        type="button"
                        className="remove-beneficiary-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBeneficiary(index);
                        }}
                        title={t.form.removeBeneficiary}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Beneficiary Forms - render all to keep PhotoFields mounted during uploads */}
            {schema &&
              beneficiaries.map((beneficiaryData, index) => (
                <div
                  key={index}
                  className={`beneficiary-section ${
                    index !== activeBeneficiaryIndex
                      ? "beneficiary-section-hidden"
                      : ""
                  }`}
                >
                  {beneficiaries.length > 1 && (
                    <h3 className="beneficiary-title">
                      {t.form.beneficiary} {index + 1}
                    </h3>
                  )}
                  <BeneficiaryForm
                    beneficiaryIndex={index}
                    showAutoCopyCheckbox={index === 0}
                    fields={schema.fields}
                    formData={beneficiaryData || {}}
                    errors={getErrors(index, language)}
                    language={language}
                    onFieldChange={(fieldName, value) =>
                      handleFieldChange(index, fieldName, value)
                    }
                    onCopyFromPrevious={(fieldName, previousValue) =>
                      handleCopyFromPrevious(index, fieldName, previousValue)
                    }
                    previousBeneficiaryData={
                      index > 0 ? beneficiaries[index - 1] : undefined
                    }
                    totalBeneficiaries={beneficiaries.length}
                    autoCopyFields={autoCopyFields}
                    onAutoCopyToggle={handleAutoCopyToggle}
                    onUploadStateChange={handleUploadStateChange}
                    onPassportUploadComplete={handlePassportUploadComplete}
                    requestId={requestId}
                  />
                </div>
              ))}

            {/* Add Beneficiary Button */}
            <div className="add-beneficiary-section">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddBeneficiary}
              >
                + {t.form.addBeneficiary}
              </Button>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                disabled={submitting || activeUploads.size > 0}
              >
                {submitting
                  ? t.form.submitting
                  : activeUploads.size > 0
                  ? t.form.uploadingFiles
                  : schema?.submit_button_text[language]}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplicationForm;
