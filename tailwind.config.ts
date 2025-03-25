import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1", // Indigo
          dark: "#4F46E5",
        },
        secondary: {
          DEFAULT: "#14B8A6", // Teal
          dark: "#0D9488",
        },
        background: {
          light: "#F9FAFB",
          dark: "#111827",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1F2937",
        },
        text: {
          light: "#1F2937",
          dark: "#F9FAFB",
        },
        accent: {
          romantic: "#F472B6",
          dark: "#374151",
          sciFi: "#7C3AED",
          mystery: "#6B7280",
          adventure: "#F59E0B",
          fantasy: "#8B5CF6",
          horror: "#EF4444",
          comedy: "#10B981",
          drama: "#3B82F6",
          thriller: "#EC4899",
        },
      },
    },
  },
  plugins: [],
};

export default config;
