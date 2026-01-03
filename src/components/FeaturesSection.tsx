import {
  useLanguage,
  type LanguageContextType,
} from "../contexts/LanguageContext";
import "./FeaturesSection.css";

type SectionText = { title: string; desc: string };

const iconToFeature: Record<
  string,
  keyof LanguageContextType["t"]["features"]
> = {
  "🚀": "fast",
  "🔒": "secure",
  "⚡": "automated",
  "💬": "support",
  "📊": "track",
  "✨": "easy",
};

export const FeaturesSection = () => {
  const { t } = useLanguage();
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t.features.title}</h2>
          <p className="section-subtitle">{t.features.subtitle}</p>
        </div>
        <div className="features-grid">
          {Object.entries(iconToFeature).map(([icon, feature]) => (
            <div className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title">
                {(t.features[feature] as SectionText).title}
              </h3>
              <p className="feature-description">
                {(t.features[feature] as SectionText).desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
