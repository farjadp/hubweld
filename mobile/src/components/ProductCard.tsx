import { View } from "react-native";
import { router } from "expo-router";
import type { ProductSummary } from "@shared/api-types";
import { Card, Text } from "@/components/ui";
import { RemoteImage } from "@/components/RemoteImage";
import { formatCents } from "@/lib/format";

export function ProductCard({ p, className = "" }: { p: ProductSummary; className?: string }) {
  return (
    <Card className={`overflow-hidden ${className}`} onPress={() => router.push({ pathname: "/product/[id]", params: { id: p.id } })}>
      <RemoteImage uri={p.imageUrl} label={p.name} className="aspect-[4/3] w-full" />
      <View className="gap-1 p-3">
        {p.brand ? <Text className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{p.brand}</Text> : null}
        <Text numberOfLines={2} className="font-body-semibold text-[14px] leading-[18px] text-slate-900">{p.name}</Text>
        <View className="mt-1 flex-row items-end justify-between">
          <Text className="font-body-bold text-[16px] text-slate-900">{formatCents(p.priceCents)}</Text>
          <Text className="text-[11px] text-slate-500">{p.stock > 0 ? "In stock" : "Backorder"}</Text>
        </View>
      </View>
    </Card>
  );
}
