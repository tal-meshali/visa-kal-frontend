import type { FormDataRecord, TranslatedText } from "../types/formTypes";
import { useAgentStore } from "../stores/agentStore";
import { createApplication, updateApplicationStatus } from "./applicationService";
import { apiGet, apiPost } from "./apiService";

export interface PaymentConfig {
  payme_available: boolean;
}

export interface CreatePaymentRequest {
  request_id: string;
  amount_ils?: number;
  amount_usd?: number;
  success_url: string;
  cancel_url: string;
  description?: string;
}

export interface CreatePaymentResponse {
  payment_url: string;
  reference: string;
}

export type PaymentCurrency = "usd" | "ils";

export interface ExchangeRateResponse {
  rate: number;
}

export interface ExecutePaymentParams {
  requestId: string | undefined;
  countryId: string;
  finalFormData: FormDataRecord[];
  finalCountryName: TranslatedText;
  selectedPricing: { price_ils: number; price_usd: number } | null;
  paymeAvailable: boolean;
  language: "en" | "he";
  currency: PaymentCurrency;
  /** When currency is USD, ILS-per-1-USD rate for real-time conversion: amount_usd = amount_ils / rate */
  exchangeRateUsdToIls?: number;
}

export type ExecutePaymentResult =
  | { outcome: "redirect"; paymentUrl: string }
  | { outcome: "success" }
  | { outcome: "error" }
  | { outcome: "not_configured" };

export const getPaymentConfig = async (): Promise<PaymentConfig> => {
  return apiGet<PaymentConfig>("/api/payment/config");
};

export const getExchangeRate = async (): Promise<number> => {
  const res = await apiGet<ExchangeRateResponse>("/api/payment/exchange-rate");
  return res.rate;
};

export const createPayMePayment = async (
  payload: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  return apiPost<CreatePaymentResponse>("/api/payment/create", payload);
};

/**
 * Executes payment flow: PayMe redirect when configured, otherwise simulated completion.
 * Returns an outcome so the caller can update UI (alert, redirect, loading state).
 */
export const executePayment = async (
  params: ExecutePaymentParams
): Promise<ExecutePaymentResult> => {
  const {
    requestId,
    countryId,
    finalFormData,
    finalCountryName,
    selectedPricing,
    paymeAvailable,
    language,
    currency,
    exchangeRateUsdToIls,
  } = params;

  const beneficiaryCount = finalFormData.length;
  const amountIls = selectedPricing
    ? selectedPricing.price_ils * beneficiaryCount
    : 180 * beneficiaryCount;
  const amountUsd =
    currency === "usd" && exchangeRateUsdToIls != null && exchangeRateUsdToIls > 0
      ? amountIls / exchangeRateUsdToIls
      : selectedPricing
        ? selectedPricing.price_usd * beneficiaryCount
        : 50 * beneficiaryCount;

  if (paymeAvailable && requestId) {
    try {
      const origin = window.location.origin;
      const basePath = `/payment/${countryId}`;
      const successUrl = `${origin}${basePath}?status=success&request_id=${requestId}`;
      const cancelUrl = `${origin}${basePath}?status=cancel&request_id=${requestId}`;
      const payload = {
        request_id: requestId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        description: `Visa application – ${finalCountryName[language]}`,
      };
      const { payment_url } = await createPayMePayment({
        ...payload,
        ...(currency === "ils"
          ? { amount_ils: amountIls }
          : { amount_usd: amountUsd }),
      });
      return { outcome: "redirect", paymentUrl: payment_url };
    } catch {
      return { outcome: "error" };
    }
  }

  if (paymeAvailable && !requestId) {
    return { outcome: "not_configured" };
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (requestId) {
      await updateApplicationStatus(requestId, "payment_received");
    } else {
      const agentId = useAgentStore.getState().getAgentId();
      await createApplication({
        country_id: countryId,
        beneficiaries: finalFormData,
        agent_id: agentId || undefined,
      });
      if (agentId) {
        useAgentStore.getState().clearAgentId();
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { outcome: "success" };
  } catch {
    return { outcome: "error" };
  }
};
