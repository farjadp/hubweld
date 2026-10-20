import type { BidStatus, JobCategory, JobStatus, OrderStatus } from "@shared/api-types";

/**
 * Money: the app always shows the settlement currency, CAD. The site's
 * USD/EUR display conversion is indicative only and is not offered here.
 */
const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" });

/** CAD cents (product prices, order totals). */
export const formatCents = (cents: number) => cad.format(cents / 100);

/** Whole CAD dollars (job budgets, bid amounts). */
export const formatDollars = (dollars: number) => cad.format(dollars);

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(iso);
}

export const JOB_CATEGORIES: { value: JobCategory; label: string }[] = [
  { value: "mobile", label: "Mobile welding" },
  { value: "fabrication", label: "Fabrication" },
  { value: "repair", label: "Repair" },
  { value: "structural", label: "Structural" },
  { value: "other", label: "Other" },
];

export const categoryLabel = (c: string) => JOB_CATEGORIES.find((x) => x.value === c)?.label ?? c;

export type Tone = "neutral" | "info" | "warn" | "progress" | "ok" | "bad";

export const JOB_STATUS: Record<JobStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Open", tone: "info" },
  ASSIGNED: { label: "Assigned", tone: "warn" },
  IN_PROGRESS: { label: "In progress", tone: "progress" },
  COMPLETED: { label: "Completed", tone: "ok" },
  CANCELLED: { label: "Cancelled", tone: "bad" },
};

export const BID_STATUS: Record<BidStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "neutral" },
  ACCEPTED: { label: "Accepted", tone: "ok" },
  REJECTED: { label: "Not selected", tone: "bad" },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Awaiting payment", tone: "warn" },
  PAID: { label: "Paid", tone: "info" },
  SHIPPED: { label: "Shipped", tone: "progress" },
  COMPLETED: { label: "Completed", tone: "ok" },
  CANCELLED: { label: "Cancelled", tone: "bad" },
};

export const LINE_STATUS: Record<"PENDING" | "FULFILLED" | "CANCELLED", { label: string; tone: Tone }> = {
  PENDING: { label: "To ship", tone: "warn" },
  FULFILLED: { label: "Shipped", tone: "ok" },
  CANCELLED: { label: "Cancelled", tone: "bad" },
};

/** Canadian provinces and territories, for checkout tax. */
export const PROVINCES: { code: string; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
