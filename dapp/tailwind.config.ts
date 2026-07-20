import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primary - Lime #acff00
        primary: {
          50: "#f7ffe6",
          100: "#ecffc2",
          200: "#d9ff85",
          300: "#c6ff4d",
          400: "#b8ff1a",
          500: "#acff00",
          600: "#8acc00",
          700: "#689900",
          800: "#476600",
          900: "#2a3d00",
        },
        // Accent - same lime family
        accent: {
          300: "#d9ff85",
          400: "#c6ff4d",
          500: "#acff00",
          600: "#8acc00",
        },
        // Secondary - deeper lime
        secondary: {
          400: "#b8ff1a",
          500: "#9ae600",
          600: "#7ab800",
        },
        // Neutral - black scale (structure unchanged)
        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
