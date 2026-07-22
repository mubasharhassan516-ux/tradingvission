import type { Config } from "tailwindcss";

// Design direction: "Ticker & Ledger" — a trading-floor instrument panel
// crossed with a hand-kept ledger. Ink-blue working surfaces, a warm
// paper accent used sparingly (the "stamp"), muted (not neon) bull/bear
// colors, and monospace for every number so data reads as data.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1420",
          800: "#151C29",
          700: "#1B2432",
          600: "#232B38",
        },
        paper: "#F3EFE4",
        bull: {
          DEFAULT: "#5FB88F",
          soft: "#233830",
        },
        bear: {
          DEFAULT: "#D65F45",
          soft: "#3A2620",
        },
        gold: "#D9A544",
        ledger: "#2A3241",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(217,165,68,0.06) 28px)",
      },
    },
  },
  plugins: [],
};

export default config;
