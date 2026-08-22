import { SITE_URL } from "@/lib/site";
import { formatAmount } from "@/lib/money";
import { sendMailSafe, opsAddress } from "@/lib/email";
import { layout, button, notice, itemsTable, addressBlock, escapeHtml, type LineItem } from "@/lib/email-templates";

export type OrderForEmail = {
  id: string;
  reference: string;
  buyerName: string;
  buyerEmail: string;
  items: LineItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  ship: {
    name: string;
    company: string;
    address: string;
    city: string;
    region: string;
    postal: string;
    country: string;
    phone: string;
  };
  notes: string;
};

const P = (t: string) => `<p style="margin:0 0 14px 0;">${t}</p>`;

function addressLines(s: OrderForEmail["ship"]): string[] {
  return [
    s.name,
    s.company,
    s.address,
    [s.city, s.region].filter(Boolean).join(", ") + (s.postal ? ` ${s.postal}` : ""),
    s.country,
    s.phone,
  ];
}

/** To the buyer: the gateway is down, the order is recorded, we will call. */
export async function sendOrderReceivedToBuyer(order: OrderForEmail) {
  const totals = {
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
  };

  const html = layout({
    preheader: `We have your order ${order.reference}. Nothing has been charged — our team will contact you to arrange payment.`,
    heading: `Order ${order.reference} received`,
    body: `
      ${P(`Thanks, ${escapeHtml(order.buyerName)}. Your order is recorded and reserved.`)}
      ${notice(
        "Card payments are temporarily unavailable",
        "Our payment gateway is being reconnected, so nothing has been charged and no card details were stored. A member of our team will contact you shortly to confirm the order and arrange payment — by invoice, transfer, or card over the phone, whichever suits you."
      )}
      ${itemsTable(order.items, totals)}
      ${addressBlock(addressLines(order.ship))}
      ${order.notes ? P(`<strong style="color:#16181D;">Your notes:</strong> ${escapeHtml(order.notes)}`) : ""}
      ${button(`${SITE_URL}/orders/${order.id}`, "View your order")}
      ${P(`<span style="font-size:13px;color:#6B7280;">Need to change something? Reply to this email and we will pick it up.</span>`)}
    `,
  });

  const text = [
    `Order ${order.reference} received`,
    ``,
    `Thanks, ${order.buyerName}. Your order is recorded and reserved.`,
    ``,
    `CARD PAYMENTS ARE TEMPORARILY UNAVAILABLE`,
    `Our payment gateway is being reconnected, so nothing has been charged and no`,
    `card details were stored. A member of our team will contact you shortly to`,
    `confirm the order and arrange payment.`,
    ``,
    `Items:`,
    ...order.items.map((i) => `  ${i.quantity} x ${i.name} — ${formatAmount(i.priceCents * i.quantity)}`),
    ``,
    `Subtotal ${formatAmount(order.subtotalCents)}`,
    `Shipping ${formatAmount(order.shippingCents)}`,
    `Tax      ${formatAmount(order.taxCents)}`,
    `Total    ${formatAmount(order.totalCents)} CAD`,
    ``,
    `Ship to: ${addressLines(order.ship).filter(Boolean).join(", ")}`,
    ``,
    `View your order: ${SITE_URL}/orders/${order.id}`,
  ].join("\n");

  await sendMailSafe({ to: order.buyerEmail, subject: `HubWeld order ${order.reference} received`, html, text });
}

/** To the team: somebody has to make the promised call. */
export async function sendOrderAlertToOps(order: OrderForEmail) {
  const to = opsAddress();
  if (!to) return;

  const html = layout({
    preheader: `${order.buyerName} placed order ${order.reference} for ${formatAmount(order.totalCents)} — needs a follow-up call.`,
    heading: `Action: call ${order.reference}`,
    body: `
      ${notice("Payment not collected", "The buyer was told the gateway is down and that we would contact them to arrange payment. This order needs a follow-up.")}
      ${P(`<strong style="color:#16181D;">${escapeHtml(order.buyerName)}</strong><br>
           <a href="mailto:${escapeHtml(order.buyerEmail)}" style="color:#C22127;">${escapeHtml(order.buyerEmail)}</a>
           ${order.ship.phone ? `<br>${escapeHtml(order.ship.phone)}` : ""}`)}
      ${itemsTable(order.items, {
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        taxCents: order.taxCents,
        totalCents: order.totalCents,
      })}
      ${addressBlock(addressLines(order.ship))}
      ${order.notes ? P(`<strong style="color:#16181D;">Buyer notes:</strong> ${escapeHtml(order.notes)}`) : ""}
      ${button(`${SITE_URL}/admin/orders`, "Open in admin")}
    `,
  });

  const text = [
    `ACTION: call ${order.reference}`,
    ``,
    `Payment was not collected — the buyer expects a call to arrange it.`,
    ``,
    `${order.buyerName} <${order.buyerEmail}>${order.ship.phone ? ` — ${order.ship.phone}` : ""}`,
    ``,
    ...order.items.map((i) => `  ${i.quantity} x ${i.name} — ${formatAmount(i.priceCents * i.quantity)}`),
    ``,
    `Total ${formatAmount(order.totalCents)} CAD`,
    `Ship to: ${addressLines(order.ship).filter(Boolean).join(", ")}`,
    ``,
    `${SITE_URL}/admin/orders`,
  ].join("\n");

  await sendMailSafe({
    to,
    replyTo: order.buyerEmail,
    subject: `[Action] Order ${order.reference} — ${formatAmount(order.totalCents)} — payment to arrange`,
    html,
    text,
  });
}

/** To each supplier: only their own line items. */
export async function sendOrderAlertToSupplier(
  order: OrderForEmail,
  supplier: { email: string; name: string; items: LineItem[] }
) {
  if (!supplier.email) return;

  const html = layout({
    preheader: `Order ${order.reference} includes ${supplier.items.length} of your item(s).`,
    heading: `New order ${order.reference}`,
    body: `
      ${P(`${escapeHtml(supplier.name)} — an order has come in that includes your items.`)}
      ${notice("Do not ship yet", "Payment is being arranged directly with the buyer while our gateway is reconnected. We will confirm before you dispatch.")}
      ${itemsTable(supplier.items)}
      ${addressBlock(addressLines(order.ship))}
      ${button(`${SITE_URL}/dashboard/supplier/orders/${order.id}`, "Open order")}
    `,
  });

  const text = [
    `New order ${order.reference}`,
    ``,
    `${supplier.name} — an order has come in that includes your items.`,
    ``,
    `DO NOT SHIP YET — payment is being arranged with the buyer directly.`,
    ``,
    ...supplier.items.map((i) => `  ${i.quantity} x ${i.name} — ${formatAmount(i.priceCents * i.quantity)}`),
    ``,
    `Ship to: ${addressLines(order.ship).filter(Boolean).join(", ")}`,
    ``,
    `${SITE_URL}/dashboard/supplier/orders/${order.id}`,
  ].join("\n");

  await sendMailSafe({ to: supplier.email, subject: `HubWeld: new order ${order.reference}`, html, text });
}
