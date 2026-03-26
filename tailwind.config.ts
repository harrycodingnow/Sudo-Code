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
        background: "#081215",
        foreground: "#F1F7F5",
        surface: "#0F1D20",
        accent: "#22C7B8",
        accentForeground: "#041715",
        border: "rgba(198,224,220,0.12)",
        borderStrong: "rgba(198,224,220,0.22)",
        muted: "#8FA4A6",
      },
      fontFamily: {
        sans: ["Inter", "Avenir Next", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Inter", "Avenir Next", "Segoe UI", "system-ui", "sans-serif"],
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
