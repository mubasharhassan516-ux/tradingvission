"use client";

import type { SentimentResult } from "@/lib/api";

export default function SentimentWidget({ sentiment }: { sentiment: SentimentResult | null }) {
  if (!sentiment) return null;
  const pct = sentiment.fearGreedIndex;
  const color =
    sentiment.sentiment === "Bullish" ? "#5FB88F" : sentiment.sentiment === "Bearish" ? "#D65F45" : "#D9A544";

  return (
    <div className="panel p-5 flex flex-col items-center justify-center">
      <span className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1] mb-3">
        Fear &amp; Greed
      </span>
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#232B38" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 263.9} 263.9`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl text-paper">{pct}</span>
        </div>
      </div>
      <span className="font-mono text-xs mt-3 uppercase tracking-widest" style={{ color }}>
        {sentiment.sentiment}
      </span>
    </div>
  );
}
