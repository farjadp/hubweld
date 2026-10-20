import { View } from "react-native";
import type { CartResponse } from "@shared/api-types";
import { Text } from "@/components/ui";
import { formatCents } from "@/lib/format";

/** Subtotal / shipping / tax / total, as computed by the server. */
export function TotalsBlock({ totals, taxNote }: { totals: NonNullable<CartResponse["totals"]>; taxNote?: string }) {
  const line = (label: string, value: string, strong = false) => (
    <View className="flex-row justify-between">
      <Text className={strong ? "font-body-bold text-[16px] text-slate-900" : "text-slate-600"}>{label}</Text>
      <Text className={strong ? "font-body-bold text-[16px] text-slate-900" : "font-mono text-[14px] text-slate-800"}>{value}</Text>
    </View>
  );
  return (
    <View className="gap-2">
      {line("Subtotal", formatCents(totals.subtotalCents))}
      {line("Shipping", totals.shippingCents === 0 ? "Free" : formatCents(totals.shippingCents))}
      {line(totals.taxLabel, totals.taxResolved ? formatCents(totals.taxCents) : taxNote ?? "At checkout")}
      <View className="my-1 h-px bg-slate-200" />
      {line(totals.taxResolved ? "Estimated total (CAD)" : "Total before tax (CAD)", formatCents(totals.totalCents), true)}
    </View>
  );
}
