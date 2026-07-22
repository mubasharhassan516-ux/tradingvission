# TradeVision AI — MVP Prototype

An AI-powered trading trend analysis dashboard: BUY / SELL / HOLD signals for
BTC, ETH, SOL, and BNB, built from real technical-indicator math with
plain-language explanations. **Educational/informational only — not
financial advice.**

This is a working prototype, built and smoke-tested end to end (backend API,
frontend rendering, and the client→server API path all verified — see
"What's actually been tested" below).

---

## Architecture

```
tradevision-ai/
├── backend/                  Express API (Node, ESM)
│   └── src/
│       ├── marketData.js     Seeded price-history simulator (swap point for a real feed)
│       ├── indicators.js     RSI / EMA / MACD / volume-trend, implemented from scratch
│       ├── signalEngine.js   Rules engine → BUY/SELL/HOLD + confidence + risk + reasons
│       ├── chatAssistant.js  Template responder grounded in signalEngine output
│       └── index.js          Route definitions
│
├── frontend/                 Next.js 15 (App Router, TypeScript, Tailwind)
│   ├── app/                  page.tsx (landing), dashboard/page.tsx
│   ├── components/           AssetCard, SignalPanel, LiveChart, ChatPanel, Watchlist, etc.
│   └── lib/                  api.ts (client fetch), serverApi.ts (server-component fetch)
│
└── docker-compose.yml        Wires both services together
```

### Scope decisions made building this (and why)

The original spec called for a third **Python/FastAPI "AI service"**
(pandas, `ta`, scikit-learn) alongside the Node backend. For this MVP I
folded that into the Node backend instead:

- The "AI signal" logic described in the spec is a **rules engine over
  technical indicators** (RSI thresholds, MACD crossovers, EMA crossovers),
  not a trained model — there's no scikit-learn model to justify a separate
  Python runtime yet. Implementing the same rules directly in Node removes
  a whole service, a second language, and inter-service networking from the
  MVP without losing any functionality described in the spec.
- **If/when you actually train a model** (e.g. a classifier over engineered
  features to predict next-period direction), that's the point where
  spinning `ai-service/` back out as a real FastAPI process pays for itself
  — Python's ML tooling is worth it once there's an actual model, not before.

The spec also called for an embedded **TradingView widget**. That widget
loads an external script client-side, which isn't something I could render
or verify from this build environment, so the chart here uses
[Recharts](https://recharts.org/) against the same candle data the backend
already computes indicators from. Swapping in the TradingView embed is a
contained change in `components/LiveChart.tsx` — the note is left in that
file.

**Live market data**: there's no live exchange connection here — the
backend generates a deterministic, seeded random-walk price series
(`marketData.js`) so the whole pipeline (indicators → signal → chat) can be
built, demoed, and reasoned about without exchange API keys. The return
shape (`{ time, open, high, low, close, volume }` candles) is the contract
the rest of the app depends on; point `getCandles()` at a real Binance/
CoinGecko fetch and nothing downstream needs to change.

**"AI" naming honesty**: the confidence score is a weighted count of how
many independent technical conditions agree, not a calibrated statistical
probability from a trained model. It's presented that way in the code
comments (`signalEngine.js`) so it doesn't get oversold later either.

### What's actually been tested

- Backend: all routes (`/api/market/:asset`, `/api/signal/:asset`,
  `/api/sentiment`, `/api/chat`, `/api/assets`) hit directly with curl and
  returning correct, internally-consistent data — including a case where
  the signal engine correctly returned HOLD instead of SELL on overbought
  RSI because the EMA trend was still bullish (mixed signal → HOLD, per the
  spec's own rule set).
- Frontend: `next build` succeeds; both the landing page and dashboard were
  rendered with a headless browser and screenshotted to confirm the design
  actually renders (not just compiles) — asset cards, sentiment gauge, live
  chart, signal panel with reasons, chat, and watchlist all populated with
  live data from the backend.
- The client-side `/api/*` proxy (Next.js rewrite → Express backend) was
  tested directly, since that's the path the browser's chat/watchlist
  interactions actually use, not just the server-side data fetch.

What hasn't been tested: Docker Compose build/run itself (no Docker daemon
in this environment), and no cross-browser/mobile-viewport testing.

---

## Design

The UI direction is "Ticker & Ledger" — a trading-floor instrument panel
crossed with a hand-kept ledger, rather than a generic dark-mode AI
dashboard: ink-blue panels, muted (non-neon) bull/bear colors, monospace
for every number so data reads as data, a rotated "confidence stamp" on
the signal panel, and a scrolling ticker strip. Token definitions are in
`frontend/tailwind.config.ts`.

Note: this sandbox can't reach `fonts.googleapis.com`, so the intended
typefaces (Fraunces / IBM Plex Sans / IBM Plex Mono) are approximated with
system font stacks in `app/globals.css`. Swapping back to `next/font/google`
is noted directly in `app/layout.tsx` and is a small, contained change once
this runs somewhere with normal internet access.

---

## Running locally (without Docker)

**Backend**
```bash
cd backend
npm install
npm run dev        # http://localhost:4000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
BACKEND_URL=http://localhost:4000 npm run dev   # http://localhost:3000
```

Visit `http://localhost:3000` for the landing page, `/dashboard` for the
live dashboard.

## Running with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

## API reference

| Method | Path                 | Description                                   |
|--------|----------------------|------------------------------------------------|
| GET    | `/api/market/:asset` | Price, 24h change, trend, and candle history   |
| GET    | `/api/signal/:asset` | Indicators + BUY/SELL/HOLD signal + reasons    |
| GET    | `/api/sentiment`     | Mocked Fear & Greed index, derived from BTC    |
| GET    | `/api/assets`        | List of supported asset symbols                |
| POST   | `/api/chat`          | `{ "message": "..." }` → grounded chat reply   |

`:asset` accepts `BTC`, `ETH`, `SOL`, or `BNB`.

---

## Next steps toward a real product

1. Replace `marketData.js` with a real exchange feed (Binance/CoinGecko),
   keeping the same candle shape.
2. If you want a genuine ML signal (not just rules), engineer features from
   the indicator series and train a classifier — that's the point to bring
   back a Python service.
3. Swap the Recharts panel for the TradingView embed if you want that
   specific chart UI.
4. Add auth + a real database (Postgres) if watchlists need to persist
   server-side instead of per-browser localStorage.
5. Rate-limit `/api/chat` and add real LLM-backed responses (the function
   signature in `chatAssistant.js` is already structured to swap in an
   API call while keeping the same grounding context).

---

## Disclaimer

TradeVision AI provides AI-generated market analysis for educational and
informational purposes only. It is not financial advice, and users should
perform their own research before making trading decisions.
