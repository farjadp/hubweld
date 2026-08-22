import { SITE_URL } from "@/lib/site";
import { formatAmount } from "@/lib/money";

/**
 * Email templates in the "Forged Industrial · Daylight" identity.
 *
 * Built as nested tables with inline styles because that is what email
 * clients actually render — no flex, no grid, no external stylesheet. Webfonts
 * are unreliable in mail, so the condensed display voice is approximated with
 * a heavy system stack plus the wide tracking the brand uses; the weld-seam
 * rule and the red action colour carry the identity instead.
 */

const BRAND = "#C22127";
const INK = "#16181D";
const BODY = "#2C3037";
const MUTED = "#6B7280";
const LINE = "#E2E6EB";
const GROUND = "#F6F7F9";

const DISPLAY = "'Barlow Condensed','Arial Narrow',Arial,Helvetica,sans-serif";
const SANS = "Barlow,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

/** Dashed weld-seam rule, the same motif the site uses between sections. */
function seam(color = LINE): string {
  return `<tr><td style="padding:0;line-height:0;font-size:0;height:1px;background-image:repeating-linear-gradient(90deg,${color} 0 6px,transparent 6px 11px);background-color:transparent;">&nbsp;</td></tr>`;
}

export function layout(opts: { preheader: string; heading: string; body: string }): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${GROUND};color:${BODY};font-family:${SANS};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GROUND};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid ${LINE};">

  <!-- red top edge, as on the site header -->
  <tr><td style="height:3px;line-height:0;font-size:0;background:${BRAND};">&nbsp;</td></tr>

  <!-- masthead -->
  <tr><td style="padding:26px 32px 18px 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="26" style="width:26px;height:26px;background:${BRAND};">
          <tr><td align="center" style="color:#FFFFFF;font-family:${DISPLAY};font-size:17px;font-weight:700;line-height:26px;">H</td></tr>
        </table>
      </td>
      <td style="font-family:${DISPLAY};font-size:21px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${INK};">HubWeld</td>
    </tr></table>
  </td></tr>

  ${seam()}

  <!-- heading + body -->
  <tr><td style="padding:26px 32px 8px 32px;">
    <h1 style="margin:0;font-family:${DISPLAY};font-size:30px;line-height:1.1;font-weight:700;letter-spacing:-.01em;text-transform:uppercase;color:${INK};">${escapeHtml(opts.heading)}</h1>
  </td></tr>
  <tr><td style="padding:0 32px 28px 32px;font-size:15px;line-height:1.65;color:${BODY};">
    ${opts.body}
  </td></tr>

  ${seam()}

  <!-- footer -->
  <tr><td style="padding:18px 32px 24px 32px;background:#F6F7F9;">
    <p style="margin:0 0 6px 0;font-family:${MONO};font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};">
      HubWeld &middot; Certified Welding &amp; Fabrication Network
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
      <a href="${SITE_URL}/shop" style="color:${MUTED};text-decoration:underline;">Shop</a> &nbsp;·&nbsp;
      <a href="${SITE_URL}/jobs" style="color:${MUTED};text-decoration:underline;">Jobs</a> &nbsp;·&nbsp;
      <a href="${SITE_URL}/directory" style="color:${MUTED};text-decoration:underline;">Welders</a>
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px 0;"><tr>
    <td style="background:${BRAND};">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${DISPLAY};font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${escapeHtml(label)}</a>
    </td>
  </tr></table>`;
}

/** Amber notice block — used for the payment-gateway message. */
export function notice(title: string, text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px 0;border:1px solid #F0C36D;background:#FEF8E7;">
    <tr><td style="padding:14px 16px;">
      <p style="margin:0 0 4px 0;font-family:${DISPLAY};font-size:16px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8A6100;">${escapeHtml(title)}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#6B4E00;">${escapeHtml(text)}</p>
    </td></tr>
  </table>`;
}

export type LineItem = { name: string; quantity: number; priceCents: number; supplier?: string };

export function itemsTable(
  items: LineItem[],
  totals?: { subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number }
): string {
  const rows = items
    .map(
      (i) => `<tr>
      <td style="padding:11px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">
        <strong style="font-weight:600;">${escapeHtml(i.name)}</strong>
        <span style="display:block;font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};padding-top:3px;">
          Qty ${i.quantity}${i.supplier ? ` &middot; ${escapeHtml(i.supplier)}` : ""}
        </span>
      </td>
      <td align="right" style="padding:11px 0;border-bottom:1px solid ${LINE};font-size:14px;font-weight:700;color:${INK};white-space:nowrap;">
        ${formatAmount(i.priceCents * i.quantity)}
      </td>
    </tr>`
    )
    .join("");

  const totalRow = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:${bold ? "11px 0 0 0" : "6px 0 0 0"};font-size:${bold ? "15px" : "13px"};color:${bold ? INK : MUTED};${bold ? "font-weight:700;" : ""}">${escapeHtml(label)}</td>
      <td align="right" style="padding:${bold ? "11px 0 0 0" : "6px 0 0 0"};font-size:${bold ? "17px" : "13px"};color:${bold ? BRAND : BODY};font-weight:700;white-space:nowrap;">${value}</td>
    </tr>`;

  const sums = totals
    ? `<tr><td colspan="2" style="padding-top:10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${totalRow("Subtotal", formatAmount(totals.subtotalCents))}
          ${totalRow("Shipping", formatAmount(totals.shippingCents))}
          ${totalRow("Tax", formatAmount(totals.taxCents))}
          ${totalRow("Total (CAD)", formatAmount(totals.totalCents), true)}
        </table>
      </td></tr>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px 0;">
    <tr><td colspan="2" style="padding-bottom:4px;font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${LINE};">Items</td></tr>
    ${rows}
    ${sums}
  </table>`;
}

export function addressBlock(lines: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px 0;background:${GROUND};border:1px solid ${LINE};">
    <tr><td style="padding:14px 16px;">
      <p style="margin:0 0 6px 0;font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};">Ship to</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${BODY};">${lines.filter(Boolean).map(escapeHtml).join("<br>")}</p>
    </td></tr>
  </table>`;
}

export { escapeHtml };
