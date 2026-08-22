/**
 * Currency handling.
 *
 * CAD is the settlement currency: every `priceCents` in the database, every
 * order total, and every amount actually charged is Canadian dollars. USD and
 * EUR exist only as a browsing convenience — they are converted for display
 * and always labelled as indicative, never used to price an order.
 *
 * This module is imported by client components too, so it must stay free of
 * server-only APIs. The cookie reader lives in currency.server.ts.
 *
 * Rates are a stored table rather than a live API call so that rendering a
 * product page can never fail or stall on a third-party request. Override
 * them with FX_RATE_USD / FX_RATE_EUR without a code change; refresh the
 * defaults periodically.
 */
export const BASE_CURRENCY = "CAD" as const;

export const CURRENCIES = ["CAD", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABEL: Record<Currency, string> = {
  CAD: "CAD $",
  USD: "USD $",
  EUR: "EUR €",
};

/** Units of the target currency per 1 CAD. Source: exchangerate-api.com. */
export const RATES_AS_OF = "22 August 2026";
export const RATES: Record<Currency, number> = {
  CAD: 1,
  USD: Number(process.env.FX_RATE_USD) || 0.7266,
  EUR: Number(process.env.FX_RATE_EUR) || 0.6217,
};

export const CURRENCY_COOKIE = "hw_currency";

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

/** Convert an amount of CAD cents into cents of the display currency. */
export function convertFromBase(cents: number, to: Currency): number {
  if (to === BASE_CURRENCY) return cents;
  return Math.round(cents * (RATES[to] ?? 1));
}
