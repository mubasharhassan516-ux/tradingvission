import type { MarketSnapshot, SentimentResult, SignalResult } from "./api";

// Server Components run on the Next.js server, not the browser, so relative
// fetch() paths don't resolve — they need the backend's real origin. Client
// Components use lib/api.ts (relative paths + the next.config.mjs rewrite)
// instead.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Backend request failed: ${path} (${res.status})`);
  return res.json();
}

export const serverApi = {
  market: (asset: string) => getJSON<MarketSnapshot>(`/api/market/${asset}`),
  signal: (asset: string) => getJSON<SignalResult>(`/api/signal/${asset}`),
  sentiment: () => getJSON<SentimentResult>(`/api/sentiment`),
};
