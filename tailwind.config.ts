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
        background: "#08080C", // Deep void background
        surface: "#12121A",
        border: "#2A2A35",
        foreground: "#F4F4F5",
        muted: "#A1A1AA",
        accent: {
          DEFAULT: "#00F0FF", // Cyan accent
          hover: "#00C2CF",
        },
        secondary: {
          DEFAULT: "#FF0055", // Neon pink secondary accent
          hover: "#CC0044",
        }
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
        body: ["var(--font-manrope)"],
      },
      backgroundImage: {
        'glass': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'neon-accent': '0 0 20px rgba(0, 240, 255, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
