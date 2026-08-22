import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { sendOrderReceivedToBuyer, sendOrderAlertToOps, sendOrderAlertToSupplier } from "@/lib/order-emails";

const schema = z.object({
  name: z.string().min(2),
  company: z.string().default(""),
  address: z.string().min(3),
  city: z.string().min(1),
  region: z.string().default(""),
  postal: z.string().default(""),
  country: z.string().default("US"),
  phone: z.string().default(""),
  notes: z.string().default(""),
  paymentMethod: z.enum(["contact", "net30"]).default("contact"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const cart = await getOrCreateCart(me.id);
  if (cart.items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  // Validate stock and snapshot prices
  const items = cart.items.map((i) => ({
    productId: i.productId, supplierId: i.product.supplierId, name: i.product.name,
    priceCents: i.product.priceCents, quantity: i.quantity, stock: i.product.stock,
  }));
  const insufficient = items.find((i) => i.quantity > i.stock);
  if (insufficient) return NextResponse.json({ error: `Insufficient stock for ${insufficient.name}` }, { status: 400 });

  const totals = cartTotals(items);

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        buyerId: me.id,
        // No gateway is connected, so nothing has been charged. Every order
        // starts PENDING and is settled by the team contacting the buyer.
        status: "PENDING",
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        shipName: d.name, shipCompany: d.company, shipAddress: d.address,
        shipCity: d.city, shipRegion: d.region, shipPostal: d.postal,
        shipCountry: d.country, shipPhone: d.phone, notes: d.notes,
        items: {
          create: items.map((i) => ({
            productId: i.productId, supplierId: i.supplierId,
            nameSnapshot: i.name, priceCents: i.priceCents, quantity: i.quantity,
          })),
        },
      },
    });
    // decrement stock
    for (const i of items) {
      await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
    }
    // clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return o;
  });

  // Notify buyer, the team who must make the promised call, and each supplier.
  // Awaited so failures are logged in the request, but sendMailSafe never
  // throws — a mail outage must not lose a recorded order.
  const suppliers = await prisma.user.findMany({
    where: { id: { in: [...new Set(items.map((i) => i.supplierId))] } },
    select: { id: true, email: true, name: true, supplierProfile: { select: { businessName: true } } },
  });

  const payload = {
    id: order.id,
    reference: `#${order.id.slice(-8).toUpperCase()}`,
    buyerName: d.name,
    buyerEmail: me.email as string,
    items: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      priceCents: i.priceCents,
      supplier:
        suppliers.find((s) => s.id === i.supplierId)?.supplierProfile?.businessName ??
        suppliers.find((s) => s.id === i.supplierId)?.name,
    })),
    subtotalCents: totals.subtotalCents,
    shippingCents: totals.shippingCents,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    ship: {
      name: d.name, company: d.company, address: d.address, city: d.city,
      region: d.region, postal: d.postal, country: d.country, phone: d.phone,
    },
    notes: d.notes,
  };

  await Promise.all([
    sendOrderReceivedToBuyer(payload),
    sendOrderAlertToOps(payload),
    ...suppliers.map((s) =>
      sendOrderAlertToSupplier(payload, {
        email: s.email,
        name: s.supplierProfile?.businessName || s.name,
        items: payload.items.filter((_, idx) => items[idx].supplierId === s.id),
      })
    ),
  ]);

  return NextResponse.json({ id: order.id });
}
