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
        background: "#1a1a1a",
        foreground: "#f5f5f5",
        surface: "#262626",
        accent: "#f5f5f5",
        accentForeground: "#18181b",
        border: "#3a3a3a",
        borderStrong: "#4a4a4a",
        muted: "#a1a1aa",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
      },
      boxShadow: {
        panel: "0 0 0 rgba(0, 0, 0, 0)",
      },
    },
  },
  plugins: [],
};

export default config;
