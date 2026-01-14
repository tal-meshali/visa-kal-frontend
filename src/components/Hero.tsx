import { useLanguage } from "../contexts/useLanguage";
import { Button } from "./Button";
import "./Hero.css";

export const Hero = () => {
  const { t } = useLanguage();
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <span>{t.hero.badge}</span>
        </div>
        <h1 className="hero-title">
          {t.hero.title}{" "}
          <span className="gradient-text">{t.hero.titleHighlight}</span>
        </h1>
        <p className="hero-description">{t.hero.description}</p>
        <div className="hero-buttons">
          <Button
            variant="primary"
            onClick={() => window.open("/#countries", "_self")}
          >
            {t.hero.startApplication}
          </Button>
          <Button variant="secondary">{t.hero.learnMore}</Button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="floating-card card-1">
          <div className="card-icon">📋</div>
          <div className="card-text">{t.common.application}</div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">✅</div>
          <div className="card-text">{t.common.approved}</div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">✈️</div>
          <div className="card-text">{t.common.travelReady}</div>
        </div>
      </div>
    </section>
  );
};
