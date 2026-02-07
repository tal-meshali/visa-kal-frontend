/**
 * Exchange rate service for USD/ILS conversion.
 * Uses Frankfurter API (no API key required).
 */

const FRANKFURTER_URL = "https://api.frankfurter.app/latest";
const DEFAULT_RATE = 3.7;

/**
 * Return how many ILS per 1 USD (e.g. 3.72).
 * Used as: amount_usd = amount_ils / rate.
 */
export async function getUsdToIlsRate(): Promise<number> {
  try {
    const url = `${FRANKFURTER_URL}?from=USD&to=ILS`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { rates?: { ILS?: number } };
    const rate = data?.rates?.ILS;
    if (rate == null || typeof rate !== "number" || rate <= 0) {
      return DEFAULT_RATE;
    }
    return rate;
  } catch {
    return DEFAULT_RATE;
  }
}
