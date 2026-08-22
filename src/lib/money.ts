import { BASE_CURRENCY, convertFromBase, type Currency } from "@/lib/currency";

/**
 * Format an amount held in BASE (Canadian) cents.
 *
 * Pass no currency to render the settlement amount in CAD — correct for carts,
 * checkout and order records, which must show what is actually charged. Pass a
 * display currency on browsing surfaces to show an indicative converted price.
 */
export function formatCents(cents: number, currency: Currency = BASE_CURRENCY) {
  return new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-CA", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(convertFromBase(cents, currency) / 100);
}

/** Format an amount already denominated in `currency`, no conversion applied. */
export function formatAmount(cents: number, currency: Currency = BASE_CURRENCY) {
  return new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-CA", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(cents / 100);
}
