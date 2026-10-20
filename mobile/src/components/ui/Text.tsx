import { Text as RNText, type TextProps } from "react-native";

const HAS_FAMILY = /\bfont-(body|display|mono)/;
const HAS_COLOR = /\btext-(slate|brand|white|black|green|amber|red|blue|violet|emerald)/;

/**
 * All copy goes through here: React Native does not inherit fonts, so this is
 * where the body font and default colour are applied. Pass a font-* family or
 * a text-* colour in className to override either.
 */
export function Text({ className = "", ...props }: TextProps & { className?: string }) {
  const family = HAS_FAMILY.test(className) ? "" : "font-body";
  const color = HAS_COLOR.test(className) ? "" : "text-slate-700";
  return <RNText {...props} className={`${family} ${color} ${className}`} />;
}

/** Condensed uppercase heading, the site's `font-display`. */
export function Heading({ className = "", ...props }: TextProps & { className?: string }) {
  return <Text {...props} className={`font-display uppercase text-slate-900 ${className}`} />;
}

/** Mono uppercase micro-label, the site's `.label` / `.section-label`. */
export function Label({ className = "", accent = false, ...props }: TextProps & { className?: string; accent?: boolean }) {
  return (
    <Text
      {...props}
      className={`font-mono text-[11px] uppercase tracking-machine text-slate-500 ${accent ? "border-l border-brand pl-2.5" : ""} ${className}`}
    />
  );
}
