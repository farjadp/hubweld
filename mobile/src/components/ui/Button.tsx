import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Plate } from "@/components/ui/Plate";
import { Text } from "@/components/ui/Text";
import { colors } from "@/components/ui/colors";

type Variant = "primary" | "secondary" | "ghost";

const LOOK: Record<Variant, { fill: string; pressed: string; stroke?: string; text: string }> = {
  primary: { fill: colors.brand, pressed: colors.brandDark, text: "text-white" },
  secondary: { fill: "#ffffff", pressed: colors.raised, stroke: "#cbd5e1", text: "text-slate-800" },
  ghost: { fill: "transparent", pressed: colors.pressed, text: "text-brand" },
};

/** Condensed uppercase plate button — the site's .btn-primary / .btn-secondary. */
export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  size = "md",
  className = "",
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const look = LOOK[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        if (variant === "primary") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      className={`${inactive ? "opacity-50" : ""} ${className}`}
    >
      {({ pressed }) => (
        <Plate
          fill={pressed ? look.pressed : look.fill}
          stroke={look.stroke}
          cut={size === "sm" ? 6 : 8}
          className={`flex-row items-center justify-center gap-2 ${size === "sm" ? "px-4 py-2" : "px-6 py-3.5"}`}
        >
          {loading ? (
            <ActivityIndicator color={variant === "primary" ? "#fff" : colors.brand} />
          ) : (
            <>
              {icon ? <View>{icon}</View> : null}
              <Text className={`font-display uppercase tracking-machine ${size === "sm" ? "text-[13px]" : "text-[15px]"} ${look.text}`}>
                {title}
              </Text>
            </>
          )}
        </Plate>
      )}
    </Pressable>
  );
}
