/**
 * Raw colour values for props that cannot take a className (icon colours,
 * SVG fills, ActivityIndicator, navigation options). Keep in step with the
 * @theme block in src/global.css.
 */
export const colors = {
  ground: "#f6f7f9",
  recess: "#eef1f4",
  panel: "#ffffff",
  raised: "#f3f5f7",
  pressed: "#e7eaee",
  brand: "#c22127",
  brandLight: "#e23138",
  brandDark: "#9a171c",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate700: "#334155",
  slate900: "#0f172a",
  green: "#15803d",
  amber: "#b45309",
} as const;
