import { useState } from "react";
import { View } from "react-native";
import Svg, { Line } from "react-native-svg";

/** The weld-seam divider: a stitched dashed line between sections. */
export function Seam({ red = false, className = "" }: { red?: boolean; className?: string }) {
  const [w, setW] = useState(0);
  return (
    <View className={`h-px w-full ${className}`} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {w > 0 && (
        <Svg width={w} height={1}>
          <Line x1={0} y1={0.5} x2={w} y2={0.5} stroke={red ? "rgba(194,33,39,0.75)" : "#c8ced6"} strokeWidth={1} strokeDasharray="6 5" />
        </Svg>
      )}
    </View>
  );
}
