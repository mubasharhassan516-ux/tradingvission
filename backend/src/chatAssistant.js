/**
 * chatAssistant.js
 *
 * MVP implementation: a small template-based responder grounded in the
 * actual signal-engine output, so answers never contradict the dashboard.
 *
 * Swap point for production: replace `composeReply` with a call to an
 * LLM (e.g. Claude), passing the same `context` object in as grounding
 * so the model explains real numbers instead of inventing them.
 */

const ASSET_ALIASES = {
  btc: "BTC",
  bitcoin: "BTC",
  eth: "ETH",
  ethereum: "ETH",
  sol: "SOL",
  solana: "SOL",
  bnb: "BNB",
  binance: "BNB",
};

export function detectAsset(message) {
  const lower = message.toLowerCase();
  for (const [alias, symbol] of Object.entries(ASSET_ALIASES)) {
    if (lower.includes(alias)) return symbol;
  }
  return null;
}

export function composeReply(message, context) {
  const { asset, marketSnapshot, signalResult, indicators } = context;

  if (!asset) {
    return (
      "I can help with BTC, ETH, SOL, or BNB — ask me something like " +
      '"Should I buy BTC now?" or "Why is ETH a HOLD?" and I\'ll walk through the indicators.'
    );
  }

  const lower = message.toLowerCase();
  const wantsWhy = /why|reason|explain/.test(lower);
  const wantsBuy = /buy|long|enter/.test(lower);
  const wantsSell = /sell|short|exit/.test(lower);

  const topReasons = signalResult.reasons
    .filter((r) => r.type === (signalResult.signal === "SELL" ? "bearish" : "bullish") || r.type === "neutral")
    .slice(0, 3)
    .map((r) => r.text);

  const priceLine = `${asset}/USDT is trading around $${marketSnapshot.price.toLocaleString()}`;
  const signalLine = `The current AI signal is **${signalResult.signal}** with **${signalResult.confidence}% confidence** and **${signalResult.risk}** risk.`;

  if (wantsWhy) {
    return `${priceLine}. ${signalLine} ${topReasons.length ? "Here's why: " + topReasons.join("; ") + "." : ""}`;
  }

  if (wantsBuy || wantsSell) {
    if (signalResult.signal === "BUY") {
      return `${signalLine} RSI is ${indicators.rsi}${indicators.rsi < 35 ? " (oversold)" : ""}, and ${topReasons[0] ? topReasons[0].toLowerCase() : "momentum is supportive"}. That said, this is an informational signal, not financial advice — size any position to your own risk tolerance.`;
    }
    if (signalResult.signal === "SELL") {
      return `${signalLine} RSI is ${indicators.rsi}${indicators.rsi > 70 ? " (overbought)" : ""}, and momentum indicators are turning down. This is informational only, not financial advice.`;
    }
    return `${signalLine} Conditions are mixed right now — no strong edge in either direction, so the model isn't flagging a high-confidence entry or exit.`;
  }

  // Default: general status reply, matching the product spec's example.
  return `${priceLine}. ${signalLine} ${topReasons.length ? topReasons.join("; ") + "." : ""}`;
}
