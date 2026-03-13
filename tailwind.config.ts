import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f4f2ea",
        foreground: "#101010",
        surface: "#fbfaf6",
        accent: "#14532d",
        accentSoft: "#dff3d8",
        border: "#d8d2c3",
        muted: "#6b665d",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
      },
      boxShadow: {
        panel: "0 18px 60px rgba(16, 16, 16, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
