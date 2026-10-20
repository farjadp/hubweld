import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BadgeCheck } from "lucide-react-native";
import { ProductCard } from "@/components/ProductCard";
import { QtyStepper } from "@/components/QtyStepper";
import { RemoteImage } from "@/components/RemoteImage";
import { Badge, Button, Card, ErrorState, Heading, Label, Loading, Seam, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { useCartMutations, useProduct } from "@/lib/queries";
import { formatCents } from "@/lib/format";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const product = useProduct(id);
  const { add } = useCartMutations();
  const [qty, setQty] = useState(1);

  if (product.isPending) return <Loading />;
  if (product.isError) return <ErrorState error={product.error} onRetry={() => void product.refetch()} />;
  const p = product.data;
  const own = user?.id === p.supplier.id;

  function addToCart() {
    if (!user) return router.push("/sign-in");
    add.mutate(
      { productId: p.id, quantity: qty },
      {
        onSuccess: () =>
          Alert.alert("Added to cart", `${qty} × ${p.name}`, [
            { text: "Keep shopping", style: "cancel" },
            { text: "View cart", onPress: () => router.push("/(tabs)/cart") },
          ]),
        onError: (e) => Alert.alert("Couldn't add to cart", errorMessage(e)),
      }
    );
  }

  return (
    <ScrollView contentContainerClassName="pb-16">
      <RemoteImage uri={p.imageUrl} label={p.name} className="aspect-square w-full bg-panel" />
      <View className="gap-2 px-5 pt-5">
        <Label>{[p.brand, p.category.name].filter(Boolean).join(" · ")}</Label>
        <Heading className="text-[26px] leading-[28px]">{p.name}</Heading>
        {p.sku ? <Text className="font-mono text-[12px] text-slate-500">SKU {p.sku}</Text> : null}
        <Text className="mt-2 font-display text-[34px] text-slate-900">{formatCents(p.priceCents)}</Text>
        <Text className="text-slate-600">{p.stock > 0 ? `${p.stock} in stock${p.supplier.city ? ` · ships from ${p.supplier.city}` : ""}` : "Backorder: the supplier will confirm a date"}</Text>
        {p.status !== "ACTIVE" ? <Badge label={p.status === "DRAFT" ? "Draft — not listed" : "Archived — not listed"} tone="warn" /> : null}
      </View>

      <View className="mt-5 flex-row items-center gap-3 px-5">
        <QtyStepper value={qty} max={Math.max(1, p.stock || 99)} onChange={setQty} />
        <Button title={own ? "Your product" : "Add to cart"} onPress={addToCart} loading={add.isPending} disabled={own || p.status !== "ACTIVE"} className="flex-1" />
      </View>
      {own ? (
        <View className="mt-3 px-5">
          <Button title="Edit product" variant="secondary" onPress={() => router.push({ pathname: "/supplier/product", params: { id: p.id } })} />
        </View>
      ) : null}

      <View className="mt-6 px-5">
        <Card className="gap-1 p-4">
          <Label>Sold by</Label>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-body-bold text-slate-900">{p.supplier.name}</Text>
            {p.supplier.approved ? <BadgeCheck size={16} color={colors.green} /> : null}
          </View>
          {p.supplier.approved ? <Text className="text-[13px] text-green-700">Verified supplier</Text> : null}
          {p.supplier.description ? <Text className="mt-1 text-[14px] text-slate-600">{p.supplier.description}</Text> : null}
        </Card>
      </View>

      {p.description ? (
        <View className="mt-6 gap-2 px-5">
          <Label accent>Description</Label>
          <Text className="leading-6 text-slate-700">{p.description}</Text>
        </View>
      ) : null}

      <View className="mt-6 gap-1.5 px-5">
        <Label accent>B2B terms</Label>
        <Text className="text-slate-700">• Free shipping on orders over $500 CAD</Text>
        <Text className="text-slate-700">• Net 30 terms for approved accounts</Text>
        <Text className="text-slate-700">• Prices in CAD; tax set by delivery province</Text>
      </View>

      {p.related.length ? (
        <View className="mt-8 px-5">
          <Seam className="mb-6" />
          <Label accent className="mb-3">Related products</Label>
          <View className="flex-row flex-wrap gap-3">
            {p.related.map((r) => <ProductCard key={r.id} p={r} className="w-[48%]" />)}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
