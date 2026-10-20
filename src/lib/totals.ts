/**
 * Cart arithmetic: shipping, sales tax, totals.
 *
 * Lives apart from lib/cart.ts (which imports Prisma) so client components can
 * recompute a total as the buyer types their address without pulling the
 * database client into the browser bundle.
 *
 * TAX — this replaces a flat 8% that was applied to every order. The platform
 * settles in CAD and ships from Canada, so the rate has to come from the
 * destination province: 8% is not a rate that exists anywhere in Canada, and
 * charging Ontario 8% instead of 13% understated every invoice.
 *
 * The table is GST + the provincial component for destinations in Canada.
 * It is deliberately simple and is an ESTIMATE shown to the buyer: because no
 * gateway is connected, the amount a buyer actually pays is confirmed on the
 * follow-up call, and what HubWeld may lawfully collect depends on its own
 * sales-tax registrations. Treat this as the quoted figure, not as tax advice.
 *
 * Destinations outside Canada are quoted tax-free; duties and any local tax
 * are settled at invoicing. That is honest about what we can compute here.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 50_000; // CAD $500
export const FLAT_SHIPPING_CENTS = 1_500; // CAD $15

/** GST + provincial sales tax, combined, by province code. */
const CA_TAX_RATES: Record<string, number> = {
  AB: 0.05,
  BC: 0.12,
  MB: 0.12,
  NB: 0.15,
  NL: 0.15,
  NS: 0.15,
  NT: 0.05,
  NU: 0.05,
  ON: 0.13,
  PE: 0.15,
  QC: 0.14975,
  SK: 0.11,
  YT: 0.05,
};

/** Province names and common spellings → code, since the field is free text. */
const CA_PROVINCE_ALIASES: Record<string, string> = {
  alberta: "AB",
  "british columbia": "BC",
  bc: "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland": "NL",
  "newfoundland and labrador": "NL",
  "nova scotia": "NS",
  "northwest territories": "NT",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  pei: "PE",
  quebec: "QC",
  "québec": "QC",
  saskatchewan: "SK",
  yukon: "YT",
};

export type Destination = { country?: string; region?: string };

/** The province code for a free-text region, or null if we cannot tell. */
export function provinceCode(region: string | undefined): string | null {
  const raw = (region ?? "").trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (CA_TAX_RATES[upper] !== undefined) return upper;
  const alias = CA_PROVINCE_ALIASES[raw.toLowerCase()];
  return alias ?? null;
}

export type TaxQuote = {
  rate: number;
  /** False when the destination is known but we cannot pin the rate down. */
  resolved: boolean;
  label: string;
};

export function taxQuoteFor(dest: Destination): TaxQuote {
  const country = (dest.country ?? "").trim().toUpperCase();

  if (country && country !== "CA" && country !== "CANADA") {
    return { rate: 0, resolved: true, label: "Tax (settled at invoicing)" };
  }

  const code = provinceCode(dest.region);
  if (!code) {
    // Canada, province not yet given: we cannot quote a rate honestly.
    return { rate: 0, resolved: false, label: "Tax (set by province)" };
  }
  return { rate: CA_TAX_RATES[code], resolved: true, label: `Tax (${code} ${(CA_TAX_RATES[code] * 100).toFixed(code === "QC" ? 3 : 0)}%)` };
}

export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  tax: TaxQuote;
};

export function cartTotals(
  items: Array<{ priceCents: number; quantity: number }>,
  dest: Destination = {}
): Totals {
  const subtotalCents = items.reduce((a, i) => a + i.priceCents * i.quantity, 0);
  const shippingCents =
    subtotalCents === 0 ? 0 : subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const tax = taxQuoteFor(dest);
  const taxCents = Math.round((subtotalCents + shippingCents) * tax.rate);
  return { subtotalCents, shippingCents, taxCents, totalCents: subtotalCents + shippingCents + taxCents, tax };
}
