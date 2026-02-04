import { useLanguage } from "../contexts/useLanguage";
import { Link } from "react-router-dom";
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
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.monitor.title}</h2>
            <p className="section-subtitle">{t.monitor.subtitle}</p>
          </div>
          <div className="monitor-actions">
            <Link to="/applications" className="monitor-link-applications">
              {t.applications.viewMyApplications}
            </Link>
          </div>
        </div>
      </SignedIn>
    </section>
  );
};
