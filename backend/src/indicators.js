/**
 * indicators.js
 * Standard technical-analysis calculations, implemented directly (no
 * external TA library) so the math is auditable end to end.
 */

/** Exponential Moving Average over `values`, period `period`. Returns an
 * array the same length as `values`, with `null` before the series has
 * enough data to seed the average. */
export function ema(values, period) {
  const out = new Array(values.length).fill(null);
  if (values.length < period) return out;

  const k = 2 / (period + 1);
  // Seed with a simple average of the first `period` values.
  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i];
  seed /= period;
  out[period - 1] = seed;

  for (let i = period; i < values.length; i++) {
    out[i] = values[i] * k + out[i - 1] * (1 - k);
  }
  return out;
}

/** Relative Strength Index, Wilder's smoothing, standard period 14. */
export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null);
  if (values.length < period + 1) return out;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gainSum += change;
    else lossSum -= change;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = rsiFromAverages(avgGain, avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = rsiFromAverages(avgGain, avgLoss);
  }
  return out;
}

function rsiFromAverages(avgGain, avgLoss) {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** MACD: fast EMA - slow EMA, plus a signal-line EMA of that series.
 * Defaults: 12 / 26 / 9, the conventional settings. */
export function macd(values, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEma = ema(values, fastPeriod);
  const slowEma = ema(values, slowPeriod);

  const macdLine = values.map((_, i) =>
    fastEma[i] !== null && slowEma[i] !== null ? fastEma[i] - slowEma[i] : null
  );

  // Signal line is an EMA of the MACD line, computed only over the
  // portion of the series where macdLine is defined.
  const firstValidIdx = macdLine.findIndex((v) => v !== null);
  const signalLine = new Array(values.length).fill(null);
  if (firstValidIdx !== -1) {
    const macdSlice = macdLine.slice(firstValidIdx).map((v) => v);
    const signalSlice = ema(macdSlice, signalPeriod);
    signalSlice.forEach((v, i) => {
      signalLine[firstValidIdx + i] = v;
    });
  }

  const histogram = values.map((_, i) =>
    macdLine[i] !== null && signalLine[i] !== null ? macdLine[i] - signalLine[i] : null
  );

  return { macdLine, signalLine, histogram };
}

/** Simple % change in average volume: last `recent` candles vs the
 * `recent` candles before them. Positive = volume increasing. */
export function volumeTrend(candles, recent = 10) {
  if (candles.length < recent * 2) return 0;
  const volumes = candles.map((c) => c.volume);
  const last = volumes.slice(-recent);
  const prior = volumes.slice(-recent * 2, -recent);
  const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (priorAvg === 0) return 0;
  return ((lastAvg - priorAvg) / priorAvg) * 100;
}

/** Convenience: run every indicator against a candle series and return
 * the latest (most recent) reading of each, plus the crossover state
 * needed by the signal engine. */
export function computeLatestIndicators(candles) {
  const closes = candles.map((c) => c.close);
  const rsiSeries = rsi(closes, 14);
  const ema20Series = ema(closes, 20);
  const ema50Series = ema(closes, 50);
  const macdResult = macd(closes);

  const last = closes.length - 1;
  const prev = last - 1;

  const emaCrossBullish =
    ema20Series[prev] !== null &&
    ema50Series[prev] !== null &&
    ema20Series[prev] <= ema50Series[prev] &&
    ema20Series[last] > ema50Series[last];

  const emaCrossBearish =
    ema20Series[prev] !== null &&
    ema50Series[prev] !== null &&
    ema20Series[prev] >= ema50Series[prev] &&
    ema20Series[last] < ema50Series[last];

  const macdCrossBullish =
    macdResult.macdLine[prev] !== null &&
    macdResult.signalLine[prev] !== null &&
    macdResult.macdLine[prev] <= macdResult.signalLine[prev] &&
    macdResult.macdLine[last] > macdResult.signalLine[last];

  const macdCrossBearish =
    macdResult.macdLine[prev] !== null &&
    macdResult.signalLine[prev] !== null &&
    macdResult.macdLine[prev] >= macdResult.signalLine[prev] &&
    macdResult.macdLine[last] < macdResult.signalLine[last];

  return {
    rsi: roundOrNull(rsiSeries[last]),
    ema20: roundOrNull(ema20Series[last]),
    ema50: roundOrNull(ema50Series[last]),
    macd: roundOrNull(macdResult.macdLine[last]),
    macdSignal: roundOrNull(macdResult.signalLine[last]),
    macdHistogram: roundOrNull(macdResult.histogram[last]),
    volumeTrendPct: Math.round(volumeTrend(candles) * 10) / 10,
    emaCrossBullish,
    emaCrossBearish,
    macdCrossBullish,
    macdCrossBearish,
    emaAbove: ema20Series[last] !== null && ema50Series[last] !== null && ema20Series[last] > ema50Series[last],
    emaBelow: ema20Series[last] !== null && ema50Series[last] !== null && ema20Series[last] < ema50Series[last],
  };
}

function roundOrNull(n) {
  return n === null ? null : Math.round(n * 100) / 100;
}
