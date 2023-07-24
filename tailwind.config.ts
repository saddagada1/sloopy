import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        display: ["var(--font-syne)"],
      },
      colors: {
        primary: "var(--primary-colour)",
        secondary: "var(--secondary-colour)",
        accent: "var(--accent-colour)",
      },
      screens: {
        sm: "428px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "2160px",
      },
    },
  },
  plugins: [],
} satisfies Config;
