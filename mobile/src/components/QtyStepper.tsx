import { Pressable, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { Text, colors } from "@/components/ui";

export function QtyStepper({ value, min = 1, max = 999, onChange, disabled }: { value: number; min?: number; max?: number; onChange: (n: number) => void; disabled?: boolean }) {
  const btn = "h-9 w-9 items-center justify-center active:bg-pressed";
  return (
    <View className={`flex-row items-center rounded-sm border border-slate-300 bg-panel ${disabled ? "opacity-50" : ""}`}>
      <Pressable accessibilityLabel="Decrease quantity" disabled={disabled || value <= min} onPress={() => onChange(value - 1)} className={btn}>
        <Minus size={16} color={value <= min ? colors.slate300 : colors.slate700} />
      </Pressable>
      <Text className="min-w-[32px] text-center font-mono text-[14px] text-slate-900">{value}</Text>
      <Pressable accessibilityLabel="Increase quantity" disabled={disabled || value >= max} onPress={() => onChange(value + 1)} className={btn}>
        <Plus size={16} color={value >= max ? colors.slate300 : colors.slate700} />
      </Pressable>
    </View>
  );
}
