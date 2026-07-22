"use client";

import type { SignalResult } from "@/lib/api";
import { SignalBadge } from "./AssetCard";

export default function SignalPanel({ signal }: { signal: SignalResult }) {
  const stampColor =
    signal.signal === "BUY" ? "border-bull text-bull" : signal.signal === "SELL" ? "border-bear text-bear" : "border-gold text-gold";

  return (
    <div className="panel p-6 relative overflow-hidden">
      <div className={`stamp absolute -top-3 -right-3 w-24 h-24 border-2 ${stampColor} text-center hidden md:flex`}>
        <div>
          <div className="text-lg font-semibold">{signal.confidence}%</div>
          <div className="text-[8px] mt-0.5">confidence</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <span className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1]">{signal.symbol}</span>
        <SignalBadge signal={signal.signal} />
      </div>
      <h2 className="font-display italic text-3xl text-paper mt-2">AI Signal</h2>

      <div className="grid grid-cols-3 gap-4 mt-6 font-mono text-sm">
        <Stat label="Confidence" value={`${signal.confidence}%`} />
        <Stat label="Risk" value={signal.risk} />
        <Stat
          label="Stop Loss"
          value={signal.suggestedStopLossPct !== null ? `${signal.suggestedStopLossPct}%` : "—"}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 font-mono text-sm">
        <Stat
          label="Take Profit"
          value={signal.suggestedTakeProfitPct !== null ? `+${signal.suggestedTakeProfitPct}%` : "—"}
        />
        <Stat label="RSI (14)" value={signal.indicators.rsi ?? "—"} tone={rsiTone(signal.indicators.rsi)} />
        <Stat
          label="MACD"
          value={signal.indicators.macd ?? "—"}
          tone={signal.indicators.macd !== null && signal.indicators.macd > 0 ? "bull" : "bear"}
        />
      </div>

      <div className="mt-6 pt-5 panel-line">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1] mb-3">Why?</h3>
        <ul className="space-y-2">
          {signal.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={
                  r.type === "bullish" ? "text-bull" : r.type === "bearish" ? "text-bear" : "text-gold"
                }
              >
                {r.type === "bullish" ? "▲" : r.type === "bearish" ? "▼" : "•"}
              </span>
              <span className="text-[#C7CCD6]">{r.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "bull" | "bear" | "neutral" }) {
  const color = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : tone === "neutral" ? "text-gold" : "text-paper";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">{label}</div>
      <div className={`text-base mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function rsiTone(rsi: number | null): "bull" | "bear" | "neutral" | undefined {
  if (rsi === null) return undefined;
  if (rsi < 35) return "bull";
  if (rsi > 70) return "bear";
  return "neutral";
}
