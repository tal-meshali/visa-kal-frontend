import { useLanguage } from "../contexts/useLanguage";
import { Button } from "./Button";
import "./CTASection.css";

export const CTASection = () => {
  const { t } = useLanguage();
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">{t.cta.title}</h2>
          <p className="cta-description">{t.cta.description}</p>
          <Button variant="primary" size="large">
            {t.cta.button}
          </Button>
        </div>
      </div>
    </section>
  );
};
