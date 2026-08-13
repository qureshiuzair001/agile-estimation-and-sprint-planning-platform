/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Felt (deep pine/teal) — primary surface color, evokes a card table
        felt: {
          50: "#EAF3F1",
          100: "#CFE4E0",
          200: "#9FC9C1",
          300: "#6FAEA2",
          400: "#3E8B7C",
          500: "#276257",
          600: "#1B4B44",
          700: "#123833",
          800: "#0B2422",
          900: "#071716",
          950: "#040D0C",
        },
        // Chip gold — the single accent used for reveals & primary actions
        chip: {
          50: "#FDF6E9",
          100: "#FAEACB",
          200: "#F3D28F",
          300: "#EDBB5E",
          400: "#E8A33D",
          500: "#C9861F",
          600: "#A66C18",
          700: "#7D5112",
        },
        // Coral — reserved for destructive / leave-session actions only
        coral: {
          400: "#E17A6C",
          500: "#D65A4A",
          600: "#B34537",
        },
        // Parchment — light-mode background/neutral scale
        parchment: {
          50: "#FBFAF7",
          100: "#F5F3EE",
          200: "#EAE7DE",
        },
        ink: {
          600: "#3E524E",
          700: "#283835",
          900: "#10201E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 32, 30, 0.06), 0 8px 24px -8px rgba(16, 32, 30, 0.12)",
        "card-hover": "0 2px 4px rgba(16, 32, 30, 0.08), 0 16px 32px -12px rgba(16, 32, 30, 0.18)",
        chip: "0 4px 14px -2px rgba(232, 163, 61, 0.45)",
      },
      borderRadius: {
        card: "0.875rem",
      },
      keyframes: {
        "flip-in": {
          "0%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flip-in": "flip-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-up": "fade-up 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
