export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketSnapshot = {
  asset: string;
  symbol: string;
  price: number;
  change24hPct: number;
  trend: "Bullish" | "Bearish";
  candles: Candle[];
};

export type Indicators = {
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  volumeTrendPct: number;
  emaCrossBullish: boolean;
  emaCrossBearish: boolean;
  macdCrossBullish: boolean;
  macdCrossBearish: boolean;
  emaAbove: boolean;
  emaBelow: boolean;
};

export type SignalReason = { type: "bullish" | "bearish" | "neutral"; text: string };

export type SignalResult = {
  asset: string;
  symbol: string;
  indicators: Indicators;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  risk: "Low" | "Medium" | "High";
  suggestedStopLossPct: number | null;
  suggestedTakeProfitPct: number | null;
  suggestedStopLossPrice: number | null;
  suggestedTakeProfitPrice: number | null;
  reasons: SignalReason[];
};

export type SentimentResult = { fearGreedIndex: number; sentiment: "Bullish" | "Neutral" | "Bearish" };

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Request failed: ${path} (${res.status})`);
  return res.json();
}

export const api = {
  market: (asset: string) => getJSON<MarketSnapshot>(`/api/market/${asset}`),
  signal: (asset: string) => getJSON<SignalResult>(`/api/signal/${asset}`),
  sentiment: () => getJSON<SentimentResult>(`/api/sentiment`),
  assets: () => getJSON<{ assets: string[] }>(`/api/assets`),
  chat: (message: string) =>
    getJSON<{ reply: string; asset: string; signal: string; confidence: number }>(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }),
};
