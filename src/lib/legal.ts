/**
 * Facts the privacy policy and terms state about the business.
 *
 * TODO(owner): `address` and `contactEmail` are still placeholders. Fill them
 * in, have the two pages read by someone qualified, and only then link them
 * from the app stores. Every value here is printed verbatim on /privacy and
 * /terms.
 */
export const LEGAL = {
  /** Registered legal name, from the Certificate of Incorporation (Ontario, June 10, 2024). */
  entity: "HubWeld Ltd. (Ontario Corporation No. 1000918163)",
  /** Registered business address, as it should appear on a legal notice. */
  address: "[Registered business address]",
  /** An inbox someone reads: privacy requests and legal notices go here. */
  contactEmail: "[privacy contact email]",
  /** Governing law for the terms. */
  jurisdiction: "the Province of Ontario and the federal laws of Canada that apply there",
  /** Date shown as "Last updated" on both pages. Change it whenever either page changes. */
  lastUpdated: "October 22, 2026",
} as const;
