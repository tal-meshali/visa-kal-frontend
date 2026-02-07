/**
 * PayMe multi-checkout payment integration.
 * See https://payme.stoplight.io/docs/payments/llx5k4nw1tyb1-generate-multi-checkout-payment
 * Calls PayMe API directly from the frontend.
 */

const PAYME_BASE_URL = import.meta.env.VITE_PAYME_BASE_URL || "";
const PAYME_MERCHANT_ID = import.meta.env.VITE_PAYME_MERCHANT_ID || "";
const PAYME_SECRET_KEY = import.meta.env.VITE_PAYME_SECRET_KEY || "";
const PAYME_CHECKOUT_PATH =
  import.meta.env.VITE_PAYME_CHECKOUT_PATH || "/generate-sale/";

export interface PayMeCreatePaymentParams {
  amount: number;
  currency: "ILS" | "USD";
  reference: string;
  successUrl: string;
  cancelUrl: string;
  description?: string;
  buyerEmail?: string;
}

export interface PayMeCreatePaymentResult {
  paymentUrl: string;
}

export function isPayMeAvailable(): boolean {
  return Boolean(PAYME_BASE_URL && PAYME_MERCHANT_ID && PAYME_SECRET_KEY);
}

export async function createPayMePayment(
  params: PayMeCreatePaymentParams,
): Promise<PayMeCreatePaymentResult> {
  if (!isPayMeAvailable()) {
    throw new Error(
      "PayMe is not configured. Set VITE_PAYME_BASE_URL, VITE_PAYME_MERCHANT_ID, VITE_PAYME_SECRET_KEY.",
    );
  }

  const base = PAYME_BASE_URL.replace(/\/+$/, "");
  const path = PAYME_CHECKOUT_PATH.startsWith("/")
    ? PAYME_CHECKOUT_PATH
    : `/${PAYME_CHECKOUT_PATH}`;
  const endpoint = `${base}${path}`;

  const amountSmallest = Math.round(params.amount * 100);
  const body: Record<string, unknown> = {
    seller_payme_id: PAYME_SECRET_KEY,
    sale_price: amountSmallest,
    currency: params.currency,
    installments: 1,
    transaction_id: params.reference,
    sale_send_notification: true,
    sale_callback_url: "https://www.payme.io",
    sale_return_url: "https://www.payme.io",
    product_name: params.description,
    sale_payment_method: "multi",
  };
  if (params.buyerEmail) {
    body.buyer_email = params.buyerEmail;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAYME_SECRET_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `PayMe API error (${response.status}): ${text || response.statusText}`,
    );
  }

  const data = (await response.json()) as
    | {
        sale_url: string;
        status_code: 0;
      }
    | {
        status_code: 1;
        status_error_details: string;
        status_error_code: number;
      };

  if (data.status_code === 1) {
    throw new Error(
      `Request failed with status ${data.status_error_code}! ${data.status_error_details}`,
    );
  }

  if (!data.sale_url) {
    throw new Error("PayMe did not return a payment URL");
  }

  return { paymentUrl: data.sale_url };
}
