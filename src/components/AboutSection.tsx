import { useLanguage } from "../contexts/useLanguage";
import "./AboutSection.css";

export const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="about-section" id="about">
      <div className="container">
        <h2 className="about-section-title">{t.home.aboutTitle}</h2>
        <div className="about-section-content">
          <p className="about-section-text">{t.home.about}</p>
        </div>
      </div>
    </section>
  );
};
