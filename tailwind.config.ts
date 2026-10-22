import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light workshop surface scale — brushed aluminum, not glass.
        // NOTE: the scale is inverted on purpose so legacy `ink-*` usages flip
        // to light automatically: 900 = page ground, 700 = standard panel.
        ink: {
          DEFAULT: "#F6F7F9",
          900: "#F6F7F9", // page ground
          800: "#EEF1F4", // recessed panel
          700: "#FFFFFF", // standard panel (cards)
          600: "#F3F5F7", // raised / hover panel
          500: "#E7EAEE", // pressed surface
        },
        steel: "#E7EAEE",
        brand: {
          DEFAULT: "#C22127",
          light: "#E23138",
          dark: "#9A171C",
        },
        // Legacy alias kept for existing pages
        "brand-light": "#E23138",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        plate: "0 2px 4px rgba(15,23,42,0.06), 0 12px 28px rgba(15,23,42,0.10)",
        "plate-sm": "0 1px 2px rgba(15,23,42,0.05), 0 5px 14px rgba(15,23,42,0.07)",
        ember: "0 4px 14px rgba(194,33,39,0.28), 0 1px 3px rgba(15,23,42,0.15)",
      },
      letterSpacing: {
        machine: "0.14em",
      },
      // App demo on /app. Every entry fills "both" so a staged element stays
      // hidden until its animation-delay, then holds its end state.
      keyframes: {
        "rise-in": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        "pop-in": { "0%": { opacity: "0", transform: "scale(0.6)" }, "70%": { opacity: "1", transform: "scale(1.08)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "sheet-up": { from: { transform: "translateY(105%)" }, to: { transform: "none" } },
        "notify-drop": {
          "0%": { opacity: "0", transform: "translateY(-120%)" },
          "12%, 82%": { opacity: "1", transform: "none" },
          "100%": { opacity: "0", transform: "translateY(-120%)" },
        },
        type: { from: { maxWidth: "0" }, to: { maxWidth: "100%" } },
        caret: { "50%": { borderColor: "transparent" } },
        tap: { "0%": { opacity: "0.55", transform: "scale(0.2)" }, "100%": { opacity: "0", transform: "scale(2.4)" } },
        fill: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "dot-pulse": { "0%, 100%": { opacity: "0.25" }, "50%": { opacity: "1" } },
        spark: { "0%": { opacity: "0", transform: "scale(0.4) rotate(0deg)" }, "40%": { opacity: "1" }, "100%": { opacity: "0", transform: "scale(1.3) rotate(90deg)" } },
      },
      animation: {
        "rise-in": "rise-in 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-out": "fade-out 200ms ease-out both",
        "sheet-up": "sheet-up 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "notify-drop": "notify-drop 3400ms cubic-bezier(0.22, 1, 0.36, 1) both",
        type: "type 1100ms steps(20, end) both",
        caret: "caret 800ms step-end infinite",
        tap: "tap 600ms ease-out both",
        fill: "fill 4600ms linear both",
        float: "float 5s ease-in-out infinite",
        "dot-pulse": "dot-pulse 1s ease-in-out infinite",
        spark: "spark 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
