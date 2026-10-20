import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { Tone } from "@/lib/format";

const TONES: Record<Tone, { box: string; text: string }> = {
  neutral: { box: "bg-slate-100", text: "text-slate-600" },
  info: { box: "bg-blue-600/10", text: "text-blue-700" },
  warn: { box: "bg-amber-600/10", text: "text-amber-700" },
  progress: { box: "bg-violet-600/10", text: "text-violet-700" },
  ok: { box: "bg-green-600/10", text: "text-green-700" },
  bad: { box: "bg-red-600/10", text: "text-brand" },
};

/** Mono uppercase status chip, the site's .badge. */
export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View className={`self-start rounded-sm px-2 py-1 ${t.box}`}>
      <Text className={`font-mono text-[10px] uppercase tracking-wider ${t.text}`}>{label}</Text>
    </View>
  );
}
