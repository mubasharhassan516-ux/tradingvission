import express from "express";
import cors from "cors";
import { getCandles, getAssetConfig, listAssets } from "./marketData.js";
import { computeLatestIndicators } from "./indicators.js";
import { generateSignal } from "./signalEngine.js";
import { detectAsset, composeReply } from "./chatAssistant.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --- GET /api/market/:asset ---------------------------------------------
app.get("/api/market/:asset", (req, res) => {
  const asset = req.params.asset.toUpperCase();
  const candles = getCandles(asset, 200);
  if (!candles) return res.status(404).json({ error: `Unsupported asset: ${asset}` });

  const snapshot = buildSnapshot(asset, candles);
  res.json(snapshot);
});

// --- GET /api/signal/:asset ---------------------------------------------
app.get("/api/signal/:asset", (req, res) => {
  const asset = req.params.asset.toUpperCase();
  const candles = getCandles(asset, 200);
  if (!candles) return res.status(404).json({ error: `Unsupported asset: ${asset}` });

  const indicators = computeLatestIndicators(candles);
  const signalResult = generateSignal(candles, indicators);

  res.json({
    asset,
    symbol: getAssetConfig(asset).symbol,
    indicators,
    ...signalResult,
  });
});

// --- GET /api/sentiment ----------------------------------------------
app.get("/api/sentiment", (_req, res) => {
  // Mocked per the MVP spec ("Fear & Greed index (mocked for MVP)").
  // Derived deterministically from BTC's indicators so it moves in
  // sync with the rest of the dashboard rather than being static.
  const candles = getCandles("BTC", 200);
  const indicators = computeLatestIndicators(candles);
  let index = 50;
  if (indicators.rsi !== null) index += (indicators.rsi - 50) * 0.8;
  if (indicators.emaAbove) index += 8;
  if (indicators.emaBelow) index -= 8;
  index = Math.max(0, Math.min(100, Math.round(index)));

  let label = "Neutral";
  if (index >= 65) label = "Bullish";
  else if (index <= 35) label = "Bearish";

  res.json({ fearGreedIndex: index, sentiment: label });
});

// --- GET /api/assets ----------------------------------------------------
app.get("/api/assets", (_req, res) => {
  res.json({ assets: listAssets() });
});

// --- POST /api/chat -------------------------------------------------------
app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Body must include a 'message' string." });
  }

  const asset = detectAsset(message) || "BTC"; // default to BTC per the spec's example
  const candles = getCandles(asset, 200);
  const indicators = computeLatestIndicators(candles);
  const signalResult = generateSignal(candles, indicators);
  const marketSnapshot = buildSnapshot(asset, candles);

  const reply = composeReply(message, { asset, marketSnapshot, signalResult, indicators });

  res.json({ reply, asset, signal: signalResult.signal, confidence: signalResult.confidence });
});

app.listen(PORT, () => {
  console.log(`TradeVision AI backend listening on http://localhost:${PORT}`);
});

function buildSnapshot(asset, candles) {
  const last = candles[candles.length - 1];
  const dayAgoIdx = Math.max(0, candles.length - 25); // ~24 hourly candles back
  const dayAgo = candles[dayAgoIdx];
  const changePct = ((last.close - dayAgo.close) / dayAgo.close) * 100;

  return {
    asset,
    symbol: getAssetConfig(asset).symbol,
    price: last.close,
    change24hPct: Math.round(changePct * 100) / 100,
    trend: changePct >= 0 ? "Bullish" : "Bearish",
    candles: candles.slice(-100), // enough for a chart without over-fetching
  };
}
