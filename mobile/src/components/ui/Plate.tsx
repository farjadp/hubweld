import { useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type ViewProps } from "react-native";
import Svg, { Polygon } from "react-native-svg";

/**
 * The site's "plasma-cut plate": a rectangle with two opposite corners cut at
 * 45°. The web does it with clip-path; here an SVG polygon is drawn behind the
 * content at the measured size.
 */
export function Plate({
  fill,
  stroke,
  cut = 8,
  children,
  className = "",
  ...rest
}: ViewProps & { fill: string; stroke?: string; cut?: number; children?: ReactNode; className?: string }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.w !== width || size.h !== height) setSize({ w: width, h: height });
    rest.onLayout?.(e);
  };
  const s = stroke ? 0.5 : 0; // keep a stroke inside the bounds
  const points = size
    ? [
        [cut, s],
        [size.w - s, s],
        [size.w - s, size.h - cut],
        [size.w - cut, size.h - s],
        [s, size.h - s],
        [s, cut],
      ]
        .map((p) => p.join(","))
        .join(" ")
    : "";

  return (
    <View {...rest} onLayout={onLayout} className={className}>
      {size && (
        <Svg width={size.w} height={size.h} style={{ position: "absolute", top: 0, left: 0 }} pointerEvents="none">
          <Polygon points={points} fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} />
        </Svg>
      )}
      {children}
    </View>
  );
}
