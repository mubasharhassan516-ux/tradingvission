/**
 * marketData.js
 *
 * MVP data source: a deterministic, seeded random-walk price generator.
 * This exists so the rest of the pipeline (indicators, signal engine, API)
 * can be built and demoed without live exchange credentials.
 *
 * Swap point for production: replace `getCandles()` internals with a real
 * fetch to Binance/CoinGecko/etc. The return shape (array of OHLCV candles)
 * is the contract the rest of the app depends on — keep it stable and
 * everything downstream keeps working unmodified.
 */

// Simple mulberry32 PRNG so prices are stable across requests within a
// server run (and reproducible for debugging) instead of re-randomizing
// on every call.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASSET_CONFIG = {
  BTC: { basePrice: 118_200, volatility: 0.012, seed: 7719, symbol: "BTCUSDT" },
  ETH: { basePrice: 3_250, volatility: 0.018, seed: 4242, symbol: "ETHUSDT" },
  SOL: { basePrice: 178, volatility: 0.026, seed: 1010, symbol: "SOLUSDT" },
  BNB: { basePrice: 612, volatility: 0.015, seed: 3131, symbol: "BNBUSDT" },
};

// Cache generated series per-asset per-process-start so price action is
// consistent across the several endpoints a single dashboard load hits.
const cache = new Map();

/**
 * Generates `count` hourly OHLCV candles ending "now" for the given asset.
 * Candle shape: { time, open, high, low, close, volume }
 */
export function getCandles(assetSymbol, count = 200) {
  const key = assetSymbol.toUpperCase();
  const config = ASSET_CONFIG[key];
  if (!config) return null;

  const cacheKey = `${key}:${count}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const rand = mulberry32(config.seed);
  const candles = [];
  let price = config.basePrice * 0.94; // start slightly below "current" so a trend exists

  // Slight upward drift with periodic momentum swings, plus noise —
  // gives RSI/MACD/EMA something realistic to react to.
  for (let i = 0; i < count; i++) {
    const momentum = Math.sin(i / 14) * config.volatility * 0.6;
    const noise = (rand() - 0.5) * config.volatility;
    const drift = 0.0006; // gentle long-run upward bias
    const change = drift + momentum + noise;

    const open = price;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + rand() * config.volatility * 0.3);
    const low = Math.min(open, close) * (1 - rand() * config.volatility * 0.3);
    const volume = 1000 + rand() * 4000 + Math.abs(change) * 50000;

    candles.push({
      time: Date.now() - (count - i) * 60 * 60 * 1000,
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume: Math.round(volume),
    });

    price = close;
  }

  // Nudge the final close to match the "advertised" base price so the
  // dashboard headline number matches what's in the product spec.
  const lastIdx = candles.length - 1;
  const scale = config.basePrice / candles[lastIdx].close;
  for (const c of candles) {
    c.open = round(c.open * scale);
    c.high = round(c.high * scale);
    c.low = round(c.low * scale);
    c.close = round(c.close * scale);
  }

  cache.set(cacheKey, candles);
  return candles;
}

export function getAssetConfig(assetSymbol) {
  return ASSET_CONFIG[assetSymbol.toUpperCase()] || null;
}

export function listAssets() {
  return Object.keys(ASSET_CONFIG);
}

function round(n) {
  return Math.round(n * 100) / 100;
}
