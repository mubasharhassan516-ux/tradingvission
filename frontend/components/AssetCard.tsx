"use client";

import type { MarketSnapshot, SignalResult } from "@/lib/api";

export default function AssetCard({
  market,
  signal,
  active,
  onSelect,
}: {
  market: MarketSnapshot;
  signal: SignalResult | null;
  active: boolean;
  onSelect: () => void;
}) {
  const isUp = market.change24hPct >= 0;

  return (
    <button
      onClick={onSelect}
      className={`panel text-left p-5 w-full transition-colors ${
        active ? "border-gold" : "hover:border-[#3A4456]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-[#9AA2B1]">{market.symbol}</span>
        {signal && <SignalBadge signal={signal.signal} />}
      </div>
      <div className="font-mono text-2xl md:text-3xl text-paper mt-3">
        ${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
      <div className={`font-mono text-sm mt-1 ${isUp ? "text-bull" : "text-bear"}`}>
        {isUp ? "▲" : "▼"} {Math.abs(market.change24hPct)}% · {market.trend}
      </div>
      {signal && (
        <div className="mt-3 text-xs text-[#9AA2B1] font-mono">
          Confidence <span className="text-paper">{signal.confidence}%</span>
        </div>
      )}
    </button>
  );
}

export function SignalBadge({ signal }: { signal: "BUY" | "SELL" | "HOLD" }) {
  const styles =
    signal === "BUY"
      ? "text-bull border-bull bg-bull-soft"
      : signal === "SELL"
      ? "text-bear border-bear bg-bear-soft"
      : "text-gold border-gold bg-transparent";
  return (
    <span className={`font-mono text-[10px] uppercase tracking-widest border rounded-full px-2 py-1 ${styles}`}>
      {signal}
    </span>
  );
}
