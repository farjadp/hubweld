import { Alert, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Badge, Button, Card, ErrorState, Heading, Label, Loading, Notice, Seam, Text } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useOrder, useOrderAction } from "@/lib/queries";
import { LINE_STATUS, ORDER_STATUS, formatCents, formatDate } from "@/lib/format";

export default function OrderScreen() {
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const order = useOrder(id);
  const action = useOrderAction(id);

  if (order.isPending) return <Loading />;
  if (order.isError) return <ErrorState error={order.error} onRetry={() => void order.refetch()} />;
  const o = order.data;
  const allShipped = o.items.every((i) => i.status !== "PENDING");

  const cancel = () =>
    Alert.alert("Cancel this order?", "The reserved stock is released and the suppliers are told not to ship.", [
      { text: "Keep order", style: "cancel" },
      { text: "Cancel order", style: "destructive", onPress: () => action.mutate("cancel", { onError: (e) => Alert.alert("Couldn't cancel", errorMessage(e)) }) },
    ]);
  const receive = () =>
    Alert.alert("Confirm you received it?", "This closes the order.", [
      { text: "Not yet", style: "cancel" },
      { text: "Received", onPress: () => action.mutate("receive", { onError: (e) => Alert.alert("Couldn't update", errorMessage(e)) }) },
    ]);

  const line = (label: string, value: string, strong = false) => (
    <View className="flex-row justify-between">
      <Text className={strong ? "font-body-bold text-slate-900" : "text-slate-600"}>{label}</Text>
      <Text className={strong ? "font-body-bold text-slate-900" : "font-mono text-[14px] text-slate-800"}>{value}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerClassName="gap-5 px-5 pb-16 pt-2">
      <Stack.Screen options={{ headerTitle: `Order ${o.reference}` }} />
      {placed ? (
        <Notice title="Order request received">
          Your order is recorded and the stock reserved, and a confirmation is on its way to your inbox. Nothing has been charged — our team will contact you to confirm and arrange payment.
        </Notice>
      ) : null}

      <View className="gap-2">
        <Badge {...ORDER_STATUS[o.status]} />
        <Heading className="text-[26px]">Order {o.reference}</Heading>
        <Text className="text-slate-500">Placed {formatDate(o.createdAt)} · {o.paymentMethod === "net30" ? "Net 30 requested" : "We'll contact you about payment"}</Text>
      </View>

      <Card className="gap-3 p-4">
        <Label>Items</Label>
        {o.items.map((i) => (
          <View key={i.id} className="gap-1">
            <View className="flex-row justify-between gap-3">
              <Text numberOfLines={2} className="flex-1 font-body-medium text-slate-900">{i.name}</Text>
              <Text className="font-body-semibold text-slate-900">{formatCents(i.priceCents * i.quantity)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-slate-500">Qty {i.quantity} · {i.supplierName}</Text>
              <Badge {...LINE_STATUS[i.status]} />
            </View>
          </View>
        ))}
        <Seam />
        {line("Subtotal", formatCents(o.subtotalCents))}
        {line("Shipping", o.shippingCents === 0 ? "Free" : formatCents(o.shippingCents))}
        {line("Tax (estimate)", formatCents(o.taxCents))}
        {line("Total (CAD)", formatCents(o.totalCents), true)}
      </Card>

      <Card className="gap-1 p-4">
        <Label>Ship to</Label>
        <Text className="font-body-semibold text-slate-900">{o.ship.name}{o.ship.company ? ` · ${o.ship.company}` : ""}</Text>
        <Text className="text-slate-700">{o.ship.address}</Text>
        <Text className="text-slate-700">{[o.ship.city, o.ship.region, o.ship.postal].filter(Boolean).join(", ")}</Text>
        <Text className="text-slate-700">{o.ship.country}</Text>
        {o.ship.phone ? <Text className="text-slate-700">{o.ship.phone}</Text> : null}
        {o.notes ? <Text className="mt-2 text-slate-500">Notes: {o.notes}</Text> : null}
      </Card>

      {o.status === "PENDING" ? <Button title="Cancel order" variant="secondary" loading={action.isPending} onPress={cancel} /> : null}
      {o.status === "SHIPPED" && allShipped ? <Button title="Confirm received" loading={action.isPending} onPress={receive} /> : null}
    </ScrollView>
  );
}
