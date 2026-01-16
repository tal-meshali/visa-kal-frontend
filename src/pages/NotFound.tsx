import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { useLanguage } from "../contexts/useLanguage";
import "./NotFound.css";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">{t.notFound.title}</h2>
        <p className="not-found-description">{t.notFound.description}</p>
        <Link to="/">
          <Button variant="primary" size="large">
            {t.notFound.backToHome}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
