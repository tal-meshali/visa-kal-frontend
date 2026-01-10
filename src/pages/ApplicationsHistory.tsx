import { SignedIn, SignedOut } from "../components/AuthComponents";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApplicationCard } from "../components/ApplicationCard";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";
import { getUserApplications } from "../services/applicationService";
import type { Application } from "../services/requestService";
import "./ApplicationsHistory.css";

const ApplicationsHistory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    data: applications = [],
    isLoading: loading,
    error,
  } = useQuery<Application[], Error>({
    queryKey: ["applications"],
    queryFn: getUserApplications,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return (
    <>
      <SignedOut>
        <div className="applications-container">
          <div className="error-message-history">
            {t.applications.signInToView}
          </div>
          <BackButton />
        </div>
      </SignedOut>
      <SignedIn>
        {loading ? (
          <LoadingScreen message={t.form.loading} />
        ) : error ? (
          <div className="applications-container">
            <div className="error-message-history">
              {error instanceof Error
                ? error.message
                : "Failed to load applications"}
            </div>
            <BackButton />
          </div>
        ) : (
          <div className="applications-container">
            <div className="applications-header">
              <BackButton />
              <h1 className="applications-title">{t.applications.title}</h1>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <p>{t.applications.noApplications}</p>
                <Button variant="primary" onClick={() => navigate("/")}>
                  {t.applications.startNew}
                </Button>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    variant="compact"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </SignedIn>
    </>
  );
};

export default ApplicationsHistory;
