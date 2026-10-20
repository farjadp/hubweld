import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { useOrders } from "@/lib/queries";
import { ORDER_STATUS, formatCents, formatDate } from "@/lib/format";

export default function Orders() {
  const orders = useOrders();
  if (orders.isPending) return <Loading />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={() => void orders.refetch()} />;
  return (
    <FlatList
      data={orders.data}
      keyExtractor={(o) => o.id}
      contentContainerClassName="gap-3 px-5 pb-12 pt-2"
      refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} tintColor={colors.brand} />}
      ListEmptyComponent={<Empty title="No orders yet" action={<Button title="Browse the shop" onPress={() => router.push("/(tabs)/shop")} />} />}
      renderItem={({ item: o }) => (
        <Card className="gap-2 p-4" onPress={() => router.push({ pathname: "/order/[id]", params: { id: o.id } })}>
          <View className="flex-row items-center justify-between">
            <Text className="font-body-bold text-slate-900">Order {o.reference}</Text>
            <Text className="font-body-bold text-slate-900">{formatCents(o.totalCents)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-slate-500">{formatDate(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}</Text>
            <Badge {...ORDER_STATUS[o.status]} />
          </View>
        </Card>
      )}
    />
  );
}
