import { useLanguage } from "../contexts/LanguageContext";
import "./Footer.css";

const FooterSection = ({
  title,
  linkToText,
}: {
  title: string;
  linkToText: Record<string, string>;
}) => {
  return (
    <div className="footer-section">
      <h4 className="footer-title">{title}</h4>
      {Object.entries(linkToText).map(([link, text]) => (
        <a href={link} className="footer-link">
          {text}
        </a>
      ))}
    </div>
  );
};

export const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">Visa-Kal</h4>
            <p className="footer-text">{t.footer.tagline}</p>
          </div>
          <FooterSection
            title={t.footer.quickLinks}
            linkToText={{
              "#home": t.nav.home,
              "#countries": t.nav.countries,
              "#about": t.nav.about,
            }}
          />
          <FooterSection
            title={t.footer.support}
            linkToText={{
              "#home": t.footer.helpCenter,
              "#countries": t.footer.contactUs,
              "#about": t.footer.privacyPolicy,
            }}
          />
        </div>
        <div className="footer-bottom">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
