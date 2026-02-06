export const COOKIE_CONSENT_KEY = "visa-kal-cookie-consent";

export const hasCookieConsent = (): boolean =>
  localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";

export const hasCookieRefused = (): boolean =>
  localStorage.getItem(COOKIE_CONSENT_KEY) === "refused";

export const hasCookieChoiceMade = (): boolean =>
  localStorage.getItem(COOKIE_CONSENT_KEY) !== null;

export const setCookieConsent = (): void => {
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
};

export const setCookieRefused = (): void => {
  localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
};
