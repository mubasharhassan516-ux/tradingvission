import type { Metadata } from "next";
import "./globals.css";

// NOTE: this sandbox can't reach fonts.googleapis.com, so the intended
// typefaces (Fraunces / IBM Plex Sans / IBM Plex Mono — see
// tailwind.config.ts "Ticker & Ledger" design tokens) are approximated
// with system stacks in globals.css instead. In a real deployment with
// normal internet access, swap this back to `next/font/google` with the
// three font loaders and pass their `.variable` classNames on <html> —
// no other code changes needed, since components already reference the
// same `--font-*` CSS variables.

export const metadata: Metadata = {
  title: "TradeVision AI — AI-powered trading signals",
  description:
    "BUY, SELL, or HOLD signals for BTC and ETH, combining technical indicators, market sentiment, and AI-generated explanations. Educational, not financial advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
