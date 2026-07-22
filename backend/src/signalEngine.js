/**
 * signalEngine.js
 *
 * NOTE ON NAMING: this is a transparent rules engine over technical
 * indicators, not a trained model. Confidence is a weighted count of how
 * many independent conditions agree, not a calibrated statistical
 * probability. Being explicit about that here so it's not oversold in
 * the product copy either — see README "Scope & honesty notes".
 */

export function generateSignal(candles, indicators) {
  const reasons = [];
  let bullishScore = 0;
  let bearishScore = 0;
  const maxScore = 4;

  // --- RSI ---
  if (indicators.rsi !== null) {
    if (indicators.rsi < 35) {
      bullishScore++;
      reasons.push({ type: "bullish", text: `RSI is ${indicators.rsi} (oversold, below 35)` });
    } else if (indicators.rsi > 70) {
      bearishScore++;
      reasons.push({ type: "bearish", text: `RSI is ${indicators.rsi} (overbought, above 70)` });
    } else {
      reasons.push({ type: "neutral", text: `RSI is ${indicators.rsi} (neutral range)` });
    }
  }

  // --- MACD crossover ---
  if (indicators.macdCrossBullish) {
    bullishScore++;
    reasons.push({ type: "bullish", text: "MACD shows a bullish crossover" });
  } else if (indicators.macdCrossBearish) {
    bearishScore++;
    reasons.push({ type: "bearish", text: "MACD shows a bearish crossover" });
  } else if (indicators.macd !== null && indicators.macdSignal !== null) {
    const above = indicators.macd > indicators.macdSignal;
    reasons.push({
      type: "neutral",
      text: `MACD is ${above ? "above" : "below"} its signal line (no fresh crossover)`,
    });
  }

  // --- EMA20 vs EMA50 ---
  if (indicators.emaCrossBullish || indicators.emaAbove) {
    bullishScore++;
    reasons.push({ type: "bullish", text: "EMA20 is above EMA50 (short-term trend up)" });
  } else if (indicators.emaCrossBearish || indicators.emaBelow) {
    bearishScore++;
    reasons.push({ type: "bearish", text: "EMA20 is below EMA50 (short-term trend down)" });
  }

  // --- Volume trend ---
  if (indicators.volumeTrendPct > 5) {
    bullishScore += 0.5;
    reasons.push({ type: "bullish", text: `Trading volume increased ${indicators.volumeTrendPct}%` });
  } else if (indicators.volumeTrendPct < -5) {
    bearishScore += 0.5;
    reasons.push({ type: "bearish", text: `Trading volume decreased ${Math.abs(indicators.volumeTrendPct)}%` });
  }

  // --- Decide signal per the spec's BUY/SELL/HOLD rules ---
  let signal = "HOLD";
  const rsiOversold = indicators.rsi !== null && indicators.rsi < 35;
  const rsiOverbought = indicators.rsi !== null && indicators.rsi > 70;

  if (rsiOversold && (indicators.macdCrossBullish || indicators.emaAbove)) {
    signal = "BUY";
  } else if (rsiOverbought && (indicators.macdCrossBearish || indicators.emaBelow)) {
    signal = "SELL";
  } else if (bullishScore - bearishScore >= 2) {
    signal = "BUY";
  } else if (bearishScore - bullishScore >= 2) {
    signal = "SELL";
  } else {
    signal = "HOLD";
  }

  const dominantScore = signal === "SELL" ? bearishScore : bullishScore;
  const confidence = Math.round(Math.min(0.95, 0.5 + dominantScore / (maxScore * 1.3)) * 100);

  const risk = computeRisk(indicators);
  const lastClose = candles[candles.length - 1].close;

  return {
    signal,
    confidence: signal === "HOLD" ? Math.round(confidence * 0.75) : confidence,
    risk,
    suggestedStopLossPct: signal === "BUY" ? -2.5 : signal === "SELL" ? 2.5 : null,
    suggestedTakeProfitPct: signal === "BUY" ? 5 : signal === "SELL" ? -5 : null,
    suggestedStopLossPrice:
      signal === "BUY" ? round2(lastClose * 0.975) : signal === "SELL" ? round2(lastClose * 1.025) : null,
    suggestedTakeProfitPrice:
      signal === "BUY" ? round2(lastClose * 1.05) : signal === "SELL" ? round2(lastClose * 0.95) : null,
    reasons,
  };
}

function computeRisk(indicators) {
  // Wider gap between MACD and its signal line, plus RSI near the
  // extremes, reads as higher near-term volatility / risk.
  const rsiExtreme =
    indicators.rsi !== null ? Math.min(Math.abs(indicators.rsi - 50), 50) / 50 : 0.3;
  const macdGap =
    indicators.macd !== null && indicators.macdSignal !== null
      ? Math.min(Math.abs(indicators.macd - indicators.macdSignal) / (Math.abs(indicators.macd) + 1), 1)
      : 0.3;
  const score = rsiExtreme * 0.6 + macdGap * 0.4;
  if (score > 0.55) return "High";
  if (score > 0.3) return "Medium";
  return "Low";
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
