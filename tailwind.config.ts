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
        background: "#110f0d",
        foreground: "#f6efe5",
        surface: "#1d1916",
        accent: "#f6efe5",
        accentForeground: "#110f0d",
        border: "#342d27",
        borderStrong: "#4a4036",
        muted: "#b5aa99",
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
