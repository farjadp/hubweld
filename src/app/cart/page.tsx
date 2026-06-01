import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import Link from "next/link";
import CartItems from "./CartItems";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/cart");
  const me = session.user as any;
  const cart = await getOrCreateCart(me.id);

  const items = cart.items.map((i) => ({
    id: i.id, productId: i.productId, slug: i.product.slug, name: i.product.name,
    imageUrl: i.product.imageUrl, priceCents: i.product.priceCents, quantity: i.quantity,
    stock: i.product.stock,
  }));
  const totals = cartTotals(items);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black tracking-tight">Your cart</h1>
      {items.length === 0 ? (
        <div className="card text-center">
          <p className="text-white/70">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-4 inline-block">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <CartItems initial={items} />
          <aside className="card h-fit sticky top-24">
            <h3 className="mb-3 font-bold">Order summary</h3>
            <Row label="Subtotal" value={formatCents(totals.subtotalCents)} />
            <Row label={totals.shippingCents === 0 ? "Shipping (free over $500)" : "Shipping (est.)"} value={formatCents(totals.shippingCents)} />
            <Row label="Tax (est. 8%)" value={formatCents(totals.taxCents)} />
            <div className="my-3 h-px bg-white/10" />
            <Row label="Total" value={formatCents(totals.totalCents)} bold />
            <Link href="/checkout" className="btn-primary mt-4 block text-center">Proceed to Checkout</Link>
            <Link href="/shop" className="btn-secondary mt-2 block text-center">Continue shopping</Link>
            <p className="mt-3 text-xs text-white/50">Approved business buyers can switch to Net 30 terms at checkout.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "font-black text-base" : "text-white/70"}`}>
      <span>{label}</span><span className={bold ? "text-amber" : "text-white"}>{value}</span>
    </div>
  );
}
