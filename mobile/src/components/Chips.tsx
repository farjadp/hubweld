import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui";

/** Horizontal single-select filter row. `value` "" means "All". */
export function Chips({ options, value, onChange, allLabel = "All" }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; allLabel?: string | null }) {
  const all = allLabel === null ? options : [{ value: "", label: allLabel }, ...options];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
      {all.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value || "all"}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            className={`rounded-sm border px-3 py-1.5 ${on ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-panel active:bg-pressed"}`}
          >
            <Text className={`font-body-medium text-[13px] ${on ? "text-white" : "text-slate-700"}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Two- or three-way switch for a screen's sections. */
export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View className="flex-row rounded-sm border border-slate-300 bg-recess p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center rounded-sm py-2 ${on ? "bg-panel" : ""}`}
          >
            <Text className={`font-display text-[14px] uppercase tracking-machine ${on ? "text-slate-900" : "text-slate-500"}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
