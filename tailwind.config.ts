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
        amber: { DEFAULT: "#B45309" },
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
    },
  },
  plugins: [],
} satisfies Config;
