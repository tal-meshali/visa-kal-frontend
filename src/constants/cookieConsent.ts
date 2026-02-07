import {
  useCookieConsentStore,
  type CookieConsentStatus,
} from "../stores/cookieConsentStore";

const getStatus = (): CookieConsentStatus =>
  useCookieConsentStore.getState().status;

export const hasCookieRefused = () => getStatus() === "refused";
export const hasCookieAccepted = () => getStatus() === "accepted";
