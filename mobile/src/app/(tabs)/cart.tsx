import { Alert, FlatList, Pressable, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { QtyStepper } from "@/components/QtyStepper";
import { RemoteImage } from "@/components/RemoteImage";
import { SignInPrompt } from "@/components/SignInPrompt";
import { TabHeader } from "@/components/TabHeader";
import { TotalsBlock } from "@/components/TotalsBlock";
import { Button, Card, Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { useCart, useCartMutations } from "@/lib/queries";
import { useRefetchOnFocus } from "@/lib/focus";
import { formatCents } from "@/lib/format";

const FREE_SHIPPING_CENTS = 50_000;

export default function Cart() {
  const { user } = useAuth();
  // Canada, province not chosen yet: the server returns shipping and leaves tax for checkout.
  const cart = useCart({ country: "CA", region: "" });
  useRefetchOnFocus(cart.refetch);
  const { setQty, remove } = useCartMutations();

  if (!user) {
    return (
      <View className="flex-1 bg-ground">
        <TabHeader title="Cart" />
        <SignInPrompt title="Sign in to order" body="Your cart is saved to your account, on the site and in the app." />
      </View>
    );
  }

  const items = cart.data?.items ?? [];
  const totals = cart.data?.totals;
  const short = totals ? FREE_SHIPPING_CENTS - totals.subtotalCents : 0;
  const busy = setQty.isPending || remove.isPending;
  const onError = (e: unknown) => Alert.alert("Couldn't update your cart", errorMessage(e));

  return (
    <View className="flex-1 bg-ground">
      <TabHeader kicker={items.length ? `${items.length} ${items.length === 1 ? "line" : "lines"}` : undefined} title="Cart" />
      {cart.isPending ? (
        <Loading />
      ) : cart.isError ? (
        <ErrorState error={cart.error} onRetry={() => void cart.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerClassName="gap-3 px-5 pb-12 pt-4"
          refreshControl={<RefreshControl refreshing={cart.isRefetching} onRefresh={() => void cart.refetch()} tintColor={colors.brand} />}
          ListEmptyComponent={<Empty title="Your cart is empty" body="Machines, consumables and safety gear from verified suppliers." action={<Button title="Browse the shop" onPress={() => router.push("/(tabs)/shop")} />} />}
          renderItem={({ item }) => (
            <Card className="flex-row gap-3 p-3">
              <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.productId } })}>
                <RemoteImage uri={item.imageUrl} label={item.name} className="h-20 w-20 rounded-sm" />
              </Pressable>
              <View className="flex-1 gap-2">
                <Text numberOfLines={2} className="font-body-semibold text-[14px] leading-[18px] text-slate-900">{item.name}</Text>
                <Text className="font-body-bold text-slate-900">{formatCents(item.priceCents * item.quantity)}</Text>
                <View className="flex-row items-center justify-between">
                  <QtyStepper
                    value={item.quantity}
                    max={Math.max(item.stock, item.quantity)}
                    disabled={busy}
                    onChange={(n) => setQty.mutate({ itemId: item.id, quantity: n }, { onError })}
                  />
                  <Pressable accessibilityLabel={`Remove ${item.name}`} hitSlop={10} disabled={busy} onPress={() => remove.mutate(item.id, { onError })}>
                    <Trash2 size={20} color={colors.slate500} />
                  </Pressable>
                </View>
                {item.quantity > item.stock ? <Text className="text-[12px] text-brand">Only {item.stock} in stock</Text> : null}
              </View>
            </Card>
          )}
          ListFooterComponent={
            items.length && totals ? (
              <Card className="mt-2 gap-4 p-4">
                {short > 0 ? (
                  <Text className="text-[13px] text-slate-600">Add {formatCents(short)} more for free shipping.</Text>
                ) : (
                  <Text className="text-[13px] text-green-700">Free shipping on this order.</Text>
                )}
                <TotalsBlock totals={totals} />
                <Button title="Checkout" onPress={() => router.push("/checkout")} disabled={items.some((i) => i.quantity > i.stock)} />
              </Card>
            ) : undefined
          }
        />
      )}
    </View>
  );
}
