import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../contexts/useLanguage";
import {
  getUserRequestsWithBeneficiaries,
  type Application,
  type Beneficiary,
} from "../services/requestService";
import { ApplicationCard } from "./ApplicationCard";
import { SignedIn, SignedOut } from "./AuthComponents";
import "./RequestsMonitor.css";

export const RequestsMonitor = () => {
  const { t } = useLanguage();

  return (
    <section className="requests-monitor" id="monitor">
      <SignedOut>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.monitor.title}</h2>
            <p className="section-subtitle">{t.monitor.signInToView}</p>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <RequestsMonitorSignedIn />
      </SignedIn>
    </section>
  );
};

const RequestsMonitorSignedIn = () => {
  const { t, language } = useLanguage();
  const {
    data: requests = [],
    isLoading: loading,
    error: queryError,
    refetch: loadRequests,
  } = useQuery<Application[]>({
    queryKey: ["requestsWithBeneficiaries"],
    queryFn: getUserRequestsWithBeneficiaries,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
      ? String(queryError)
      : null;

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, { en: string; he: string }> = {
      pending_payment: { en: "Pending Payment", he: "ממתין לתשלום" },
      pending_approval: { en: "Pending Approval", he: "ממתין לאישור" },
      approved: { en: "Approved", he: "אושר" },
      rejected: { en: "Rejected", he: "נדחה" },
      pending: { en: "Pending", he: "ממתין" },
    };
    const label = statusLabels[status] || { en: status, he: status };
    return label[language];
  };

  const getBeneficiaryName = (formData: Beneficiary["form_data"]): string => {
    // Try to find name fields in common formats
    if (formData.passport_data) {
      return `${formData.passport_data.first_name} ${formData.passport_data.last_name}`;
    }
    return t.monitor.beneficiary;
  };

  return (
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">{t.monitor.title}</h2>
        <p className="section-subtitle">{t.monitor.subtitle}</p>
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>{t.monitor.loading}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={() => loadRequests()}>
            {t.monitor.retry}
          </button>
        </div>
      )}

      {!error && !loading && requests.length === 0 && (
        <div className="empty-state">
          <p>{t.monitor.noRequests}</p>
        </div>
      )}

      {!error && requests.length > 0 && (
        <div className="requests-list">
          {requests.map((request) => (
            <ApplicationCard
              key={request.id}
              application={request}
              variant="detailed"
              getBeneficiaryName={getBeneficiaryName}
              getStatusLabel={getStatusLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
