/**
 * Canonical site origin — the single source of truth for every absolute URL
 * the app emits: metadataBase, canonicals, Open Graph, JSON-LD and sitemaps.
 *
 * hubweld.ca is the primary domain. hubweld.online and the Railway-generated
 * *.up.railway.app hostname also resolve to this service, so all SEO signals
 * must point here rather than at whichever host served the request.
 *
 * Override with NEXT_PUBLIC_SITE_URL if the canonical domain ever changes;
 * a trailing slash is stripped so `${SITE_URL}/path` is always well formed.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hubweld.ca").replace(/\/+$/, "");

/** Absolute URL for a site-relative path, e.g. url("/blog") → https://hubweld.ca/blog */
export function url(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
