import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { Heading, Label } from "@/components/ui";

/** The site's logo mark, drawn from the same geometry. */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="HubWeld">
      <Rect width={100} height={100} fill="#D42B2B" />
      <Path d="M62 16 L34 50 L47 50 L38 84 L66 50 L53 50 Z" fill="#fff" />
    </Svg>
  );
}

/**
 * Header for a tab's root screen (native tabs have none of their own): the red
 * rule along the top edge, as on the site's nav bar, then the title.
 */
export function TabHeader({ title, kicker, right }: { title: string; kicker?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-b border-slate-200 bg-ground" style={{ paddingTop: insets.top }}>
      <View className="h-[2px] w-full bg-brand" />
      <View className="flex-row items-center justify-between px-5 pb-3 pt-3">
        <View className="flex-1 gap-1">
          {kicker ? <Label accent>{kicker}</Label> : null}
          <Heading className="text-[28px] leading-[30px]">{title}</Heading>
        </View>
        {right}
      </View>
    </View>
  );
}
