"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Candle } from "@/lib/api";

/**
 * Renders candle-close price history with recharts.
 *
 * Swap point for production: the product spec calls for an embedded
 * TradingView widget (BTCUSDT / ETHUSDT). That widget loads its own
 * external script client-side and isn't something this sandbox can
 * render/verify, so this chart uses the same candle data the backend
 * already computes indicators from — drop in the TradingView <iframe>/
 * script embed here when running in a real browser if you want the
 * TradingView UI specifically.
 */
export default function LiveChart({ candles, symbol }: { candles: Candle[]; symbol: string }) {
  const data = candles.map((c) => ({
    time: new Date(c.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    close: c.close,
  }));

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1]">
          {symbol} · live chart
        </span>
        <span className="font-mono text-[10px] text-[#4A5261]">hourly candles</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9A544" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#D9A544" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#232B38" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-plex-mono)" }}
            interval={Math.ceil(data.length / 8)}
            axisLine={{ stroke: "#232B38" }}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-plex-mono)" }}
            axisLine={false}
            tickLine={false}
            width={70}
            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              background: "#151C29",
              border: "1px solid #2A3241",
              borderRadius: 2,
              fontFamily: "var(--font-plex-mono)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#9AA2B1" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Close"]}
          />
          <Area type="monotone" dataKey="close" stroke="#D9A544" strokeWidth={1.5} fill="url(#priceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
