import "./CTASection.css";
import { Button } from "./Button";

interface CTASectionProps {
  translations: {
    cta: {
      title: string;
      description: string;
      button: string;
    };
  };
}

export const CTASection = ({
  translations,
}: CTASectionProps) => {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">{translations.cta.title}</h2>
          <p className="cta-description">{translations.cta.description}</p>
          <Button variant="primary" size="large">
            {translations.cta.button}
          </Button>
        </div>
      </div>
    </section>
  );
};
