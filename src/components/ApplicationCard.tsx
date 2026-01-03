import { getStatusColor } from "../config/statusConfig";
import { useLanguage } from "../contexts/LanguageContext";
import type { Application, Beneficiary } from "../services/requestService";
import { formatDate } from "../utils/dateUtils";
import "./ApplicationCard.css";

interface ApplicationCardProps {
  application: Application;
  variant?: "compact" | "detailed";
  getBeneficiaryName?: (formData: Beneficiary["form_data"]) => string;
  getStatusLabel?: (status: string) => string;
}

export const ApplicationCard = ({
  application,
  variant = "compact",
  getBeneficiaryName,
  getStatusLabel,
}: ApplicationCardProps) => {
  const { language, t } = useLanguage();
  
  // Use monitor translations for detailed variant, applications for compact
  const translations = variant === "detailed" ? t.monitor : t.applications;

  const getStatusTableFunc = getStatusLabel ?? ((status: string) => status);

  const countryDisplay =
    variant === "detailed"
      ? `${translations.requestFor} ${application.country_name[language]}`
      : application.country_name[language];

  const submittedDateText =
    variant === "detailed"
      ? `${translations.submittedAt}: ${
          application.submitted_at
            ? formatDate(application.submitted_at, language)
            : translations.notSubmitted
        }`
      : `${translations.submitted}: ${
          application.submitted_at
            ? formatDate(application.submitted_at, language)
            : translations.notSubmitted
        }`;

  return (
    <div className="application-card" data-variant={variant}>
      <div className="application-card-header">
        <div className="application-card-header-left">
          <h3 className="application-card-country">{countryDisplay}</h3>
          {application.is_client_request && (
            <div className="application-card-client-info">
              <span className="client-request-badge">
                {translations.clientRequest}
              </span>
              {application.client_email && (
                <span className="client-email">
                  {variant === "detailed"
                    ? application.client_email
                    : `${translations.clientEmail}: ${application.client_email}`}
                </span>
              )}
            </div>
          )}
        </div>
        <span
          className="application-card-status"
          style={{ backgroundColor: getStatusColor(application.status) }}
        >
          {getStatusTableFunc(application.status)}
        </span>
      </div>
      <div className="application-card-details">
        <p className="application-card-date">{submittedDateText}</p>

        {variant === "compact" ? (
          <div className="application-card-data">
            <p className="beneficiaries-count">
              {translations.beneficiariesCount}{" "}
              {application.beneficiaries?.length || 0}
            </p>
            {application.beneficiaries &&
              application.beneficiaries.length > 0 && (
                <div className="beneficiaries-preview">
                  {application.beneficiaries
                    .slice(0, 2)
                    .map((beneficiary, idx) => (
                      <div
                        key={beneficiary.id || idx}
                        className="beneficiary-preview"
                      >
                        {`${translations.beneficiary} ${idx + 1}`}
                      </div>
                    ))}
                  {application.beneficiaries.length > 2 && (
                    <div className="beneficiary-preview">
                      +{application.beneficiaries.length - 2}{" "}
                      {translations.more}
                    </div>
                  )}
                </div>
              )}
          </div>
        ) : (
          <div className="beneficiaries-section">
            <h4 className="beneficiaries-title">
              {translations.beneficiaries} ({application.beneficiaries.length})
            </h4>
            <div className="beneficiaries-list">
              {application.beneficiaries.map((beneficiary) => {
                const beneficiaryName = getBeneficiaryName
                  ? getBeneficiaryName(beneficiary.form_data)
                  : translations.beneficiary;
                return (
                  <div key={beneficiary.id} className="beneficiary-item">
                    <div className="beneficiary-info">
                      <span className="beneficiary-name">
                        {beneficiaryName}
                      </span>
                      <span
                        className="beneficiary-status"
                        style={{
                          backgroundColor: getStatusColor(beneficiary.status),
                        }}
                      >
                        {getStatusTableFunc(beneficiary.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
