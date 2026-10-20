import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

const BASE = "rounded-sm border border-slate-200 bg-panel";
// The site's shadow-plate-sm, as a native boxShadow.
const SHADOW = { boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 5px 14px rgba(15,23,42,0.07)" } as const;

/** The site's .card: flat white plate, hairline edge, soft real shadow. */
export function Card({ children, className = "", onPress }: { children: ReactNode; className?: string; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={SHADOW} className={`${BASE} active:bg-raised ${className}`}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={SHADOW} className={`${BASE} ${className}`}>
      {children}
    </View>
  );
}
