import { Pressable, View } from "react-native";
import { Star } from "lucide-react-native";

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (n: number) => void }) {
  return (
    <View className="flex-row gap-0.5" accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star size={size} color="#d97706" fill={n <= value ? "#f59e0b" : "transparent"} />;
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`} hitSlop={6} className="p-1">
            {icon}
          </Pressable>
        ) : (
          <View key={n}>{icon}</View>
        );
      })}
    </View>
  );
}
