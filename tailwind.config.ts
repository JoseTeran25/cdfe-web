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
        navy: {
          50: "#e8edf5",
          100: "#c5d0e6",
          200: "#9fb1d6",
          300: "#7891c5",
          400: "#5a79b9",
          500: "#3c61ac",
          600: "#2d50a0",
          700: "#1c3d8e",
          800: "#0d2a7c",
          900: "#001F3F",
          950: "#000a1a",
          DEFAULT: "#001F3F",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf0c8",
          200: "#f4de91",
          300: "#edc55a",
          400: "#C9A84C",
          500: "#b8922e",
          600: "#9e7523",
          700: "#7e5a1e",
          800: "#5e431a",
          900: "#3e2d12",
          DEFAULT: "#C9A84C",
        },
        surface: {
          DEFAULT: "#F8F9FC",
          card: "#FFFFFF",
          border: "#E5E8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,31,63,0.06), 0 1px 2px -1px rgba(0,31,63,0.04)",
        "card-hover":
          "0 4px 12px 0 rgba(0,31,63,0.10), 0 2px 4px -1px rgba(0,31,63,0.06)",
        sidebar: "2px 0 12px 0 rgba(0,31,63,0.08)",
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #001F3F 0%, #000080 100%)",
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #e8c86a 100%)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
