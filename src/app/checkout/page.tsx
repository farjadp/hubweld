import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateCart } from "@/lib/cart";
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

  // The order summary lives inside the form now: sales tax depends on the
  // destination province, so the total has to be recomputed as it is typed.
  // A server-rendered aside could only ever show a pre-address guess.
  return (
    <div>
      <h1 className="mb-6 text-3xl font-black tracking-tight">Checkout</h1>
      <CheckoutForm defaultName={me.name} items={items} />
    </div>
  );
}
