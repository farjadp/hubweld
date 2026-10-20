import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

/** Inline callout: amber for "know this before you continue", red for errors. */
export function Notice({ tone = "warn", title, children }: { tone?: "warn" | "error" | "ok"; title?: string; children: ReactNode }) {
  const box = tone === "error" ? "border-brand/30 bg-brand/5" : tone === "ok" ? "border-green-600/30 bg-green-50" : "border-amber-500/40 bg-amber-50";
  const text = tone === "error" ? "text-brand" : tone === "ok" ? "text-green-800" : "text-amber-900";
  return (
    <View className={`rounded-sm border px-4 py-3 ${box}`}>
      {title ? <Text className={`font-display mb-1 text-[16px] uppercase tracking-wide ${text}`}>{title}</Text> : null}
      {typeof children === "string" ? <Text className={`text-[14px] leading-5 ${text}`}>{children}</Text> : children}
    </View>
  );
}
