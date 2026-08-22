import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/checkout");
  const me = session.user as any;
  const cart = await getOrCreateCart(me.id);
  if (cart.items.length === 0) redirect("/cart");

  const items = cart.items.map((i) => ({
    id: i.id, name: i.product.name, priceCents: i.product.priceCents,
    quantity: i.quantity, imageUrl: i.product.imageUrl,
  }));
  const totals = cartTotals(items);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black tracking-tight">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <CheckoutForm defaultName={me.name} />
        <aside className="card h-fit sticky top-24">
          <h3 className="mb-3 font-bold">Order summary</h3>
          <ul className="mb-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex gap-2">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">{i.imageUrl && <img src={i.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
                <div className="flex-1">
                  <div className="line-clamp-2 leading-tight">{i.name}</div>
                  <div className="text-slate-500 text-xs">Qty {i.quantity}</div>
                </div>
                <div className="font-bold">{formatCents(i.priceCents * i.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-slate-100" />
          <Row label="Subtotal" value={formatCents(totals.subtotalCents)} />
          <Row label="Shipping" value={formatCents(totals.shippingCents)} />
          <Row label="Tax" value={formatCents(totals.taxCents)} />
          <div className="my-3 h-px bg-slate-100" />
          <Row label="Total" value={formatCents(totals.totalCents)} bold />
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "font-black text-base" : "text-slate-700"}`}>
      <span>{label}</span><span className={bold ? "text-amber" : "text-slate-900"}>{value}</span>
    </div>
  );
}
