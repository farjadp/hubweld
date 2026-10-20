import { useState } from "react";
import { Alert, FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import type { SupplierOrderLine } from "@shared/api-types";
import { Segmented } from "@/components/Chips";
import { RemoteImage } from "@/components/RemoteImage";
import { TabHeader } from "@/components/TabHeader";
import { Badge, Button, Card, Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useLineStatus, useSupplierLines, useSupplierProducts } from "@/lib/queries";
import { LINE_STATUS, formatCents, formatDate } from "@/lib/format";

/** Supplier workspace: order lines to fulfil, and the product list. */
export default function Sales() {
  const [tab, setTab] = useState<"orders" | "products">("orders");
  return (
    <View className="flex-1 bg-ground">
      <TabHeader
        kicker="Your storefront"
        title="Sales"
        right={tab === "products" ? <Button title="New" size="sm" icon={<Plus size={16} color="#fff" />} onPress={() => router.push("/supplier/product")} /> : null}
      />
      <View className="px-5 pt-3">
        <Segmented value={tab} onChange={setTab} options={[{ value: "orders", label: "Orders" }, { value: "products", label: "Products" }]} />
      </View>
      {tab === "orders" ? <Orders /> : <Products />}
    </View>
  );
}

function Orders() {
  const lines = useSupplierLines();
  const update = useLineStatus();

  const act = (line: SupplierOrderLine, status: "FULFILLED" | "CANCELLED") => {
    const run = () => update.mutate({ id: line.id, status }, { onError: (e) => Alert.alert("Couldn't update", errorMessage(e)) });
    if (status === "CANCELLED") {
      Alert.alert("Cancel this line?", `${line.name} × ${line.quantity} will be cancelled and the stock returned. The buyer is notified.`, [
        { text: "Keep it", style: "cancel" },
        { text: "Cancel line", style: "destructive", onPress: run },
      ]);
    } else run();
  };

  if (lines.isPending) return <Loading />;
  if (lines.isError) return <ErrorState error={lines.error} onRetry={() => void lines.refetch()} />;
  return (
    <FlatList
      data={lines.data}
      keyExtractor={(l) => l.id}
      contentContainerClassName="gap-3 px-5 pb-12 pt-4"
      refreshControl={<RefreshControl refreshing={lines.isRefetching} onRefresh={() => void lines.refetch()} tintColor={colors.brand} />}
      ListEmptyComponent={<Empty title="No orders yet" body="When a buyer orders one of your products it appears here, and you get a notification." />}
      renderItem={({ item: l }) => {
        const st = LINE_STATUS[l.status];
        const open = l.status === "PENDING" && l.orderStatus !== "CANCELLED" && l.orderStatus !== "COMPLETED";
        return (
          <Card className="gap-2 p-4">
            <View className="flex-row items-start justify-between gap-3">
              <Text numberOfLines={2} className="flex-1 font-body-semibold text-slate-900">{l.name}</Text>
              <Badge {...st} />
            </View>
            <Text className="text-[13px] text-slate-500">{l.reference} · {formatDate(l.createdAt)} · {l.buyerName}</Text>
            <Text className="text-[13px] text-slate-500">Ship to {l.shipTo}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[13px] text-slate-700">Qty {l.quantity}</Text>
              <Text className="font-body-bold text-slate-900">{formatCents(l.priceCents * l.quantity)}</Text>
            </View>
            {open ? (
              <View className="mt-1 flex-row gap-2">
                <Button title="Mark shipped" size="sm" className="flex-1" loading={update.isPending && update.variables?.id === l.id && update.variables.status === "FULFILLED"} onPress={() => act(l, "FULFILLED")} />
                <Button title="Cancel" size="sm" variant="secondary" disabled={update.isPending} onPress={() => act(l, "CANCELLED")} />
              </View>
            ) : null}
          </Card>
        );
      }}
    />
  );
}

function Products() {
  const products = useSupplierProducts();
  if (products.isPending) return <Loading />;
  if (products.isError) return <ErrorState error={products.error} onRetry={() => void products.refetch()} />;
  return (
    <FlatList
      data={products.data}
      keyExtractor={(p) => p.id}
      contentContainerClassName="gap-3 px-5 pb-12 pt-4"
      refreshControl={<RefreshControl refreshing={products.isRefetching} onRefresh={() => void products.refetch()} tintColor={colors.brand} />}
      ListEmptyComponent={<Empty title="No products yet" body="Photograph an item and list it in under a minute." action={<Button title="Add a product" onPress={() => router.push("/supplier/product")} />} />}
      renderItem={({ item: p }) => (
        <Card className="flex-row gap-3 p-3" onPress={() => router.push({ pathname: "/supplier/product", params: { id: p.id } })}>
          <RemoteImage uri={p.imageUrl} label={p.name} className="h-16 w-16 rounded-sm" />
          <View className="flex-1 gap-1">
            <Text numberOfLines={2} className="font-body-semibold text-[14px] leading-[18px] text-slate-900">{p.name}</Text>
            <View className="flex-row items-center gap-3">
              <Text className="font-body-bold text-slate-900">{formatCents(p.priceCents)}</Text>
              <Text className={`text-[13px] ${p.stock <= 3 ? "text-brand" : "text-slate-500"}`}>{p.stock} in stock</Text>
            </View>
            {p.status !== "ACTIVE" ? <Badge label={p.status === "DRAFT" ? "Draft" : "Archived"} tone="neutral" /> : null}
          </View>
        </Card>
      )}
    />
  );
}
