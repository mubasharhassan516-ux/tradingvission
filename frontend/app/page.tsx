import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import TickerStrip from "@/components/TickerStrip";
import { serverApi } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const symbols = ["BTC", "ETH", "SOL", "BNB"];
  const snapshots = await Promise.all(symbols.map((s) => serverApi.market(s)));
  const tickerItems = snapshots.map((s) => ({
    symbol: s.symbol,
    price: s.price,
    changePct: s.change24hPct,
  }));

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader />
      <TickerStrip items={tickerItems} />

      {/* Hero */}
      <section className="px-6 md:px-10 py-16 md:py-24 max-w-6xl mx-auto grid md:grid-cols-[1.3fr_0.7fr] gap-12 items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Entry 01 — Market Read
          </span>
          <h1 className="font-display italic text-4xl md:text-6xl leading-tight mt-4 text-paper">
            AI-powered trading signals, read like a ledger.
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#B7BECB] max-w-xl">
            Get BUY, SELL, or HOLD signals with confidence scores and clear explanations —
            technical indicators, market sentiment, and plain-language reasoning, updated live.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gold text-ink font-mono text-xs uppercase tracking-widest rounded-sm hover:brightness-110 transition"
            >
              Try Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-ledger text-paper font-mono text-xs uppercase tracking-widest rounded-sm hover:border-gold transition"
            >
              View Live Signals
            </Link>
          </div>
        </div>

        {/* Signature stamp element */}
        <div className="flex justify-center md:justify-end">
          <div className="stamp w-40 h-40 md:w-48 md:h-48 border-bull text-bull text-center p-4">
            <div>
              <div className="text-3xl font-semibold">BUY</div>
              <div className="text-[10px] mt-1">87% confidence</div>
              <div className="text-[9px] mt-2 opacity-70">certified reading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ledger">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-3 gap-px bg-ledger">
          {[
            {
              title: "Explainable signals",
              body: "Every BUY, SELL, or HOLD ships with the exact RSI, MACD, and EMA readings behind it — no black box.",
            },
            {
              title: "Live market pulse",
              body: "Price, 24h change, and trend for BTC and ETH, plus a sentiment read on the wider market.",
            },
            {
              title: "Ask the ledger",
              body: "Chat with the assistant about any signal and get an answer grounded in the same numbers on your screen.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-ink p-8">
              <h3 className="font-display italic text-xl text-paper mb-2">{f.title}</h3>
              <p className="text-sm text-[#9AA2B1]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — a real sequence, so numbering is earned here */}
      <section className="border-t border-ledger bg-ink-800 bg-ledger-lines">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-gold mb-8">How it works</h2>
          <ol className="space-y-6">
            {[
              ["01", "Pull the tape", "Live price and volume history is read for each supported asset."],
              ["02", "Run the indicators", "RSI, EMA20/50, and MACD are calculated from that history in real time."],
              ["03", "Weigh the evidence", "Rules combine the readings into a signal, a confidence score, and a risk rating."],
              ["04", "Explain the call", "Every signal comes with the plain-language reasons behind it — ask the chat for more."],
            ].map(([num, title, body]) => (
              <li key={num} className="flex gap-5 panel-line pb-6 last:border-none last:pb-0">
                <span className="font-mono text-gold text-sm pt-1">{num}</span>
                <div>
                  <h3 className="font-display italic text-lg text-paper">{title}</h3>
                  <p className="text-sm text-[#9AA2B1] mt-1">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Supported assets */}
      <section className="border-t border-ledger">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-gold mb-6">Supported assets</h2>
          <div className="flex flex-wrap gap-3">
            {snapshots.map((s) => (
              <span
                key={s.asset}
                className="font-mono text-sm px-4 py-2 border border-ledger rounded-full text-paper"
              >
                {s.symbol} <span className="text-[#6B7280]">·</span>{" "}
                <span className={s.trend === "Bullish" ? "text-bull" : "text-bear"}>{s.trend}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-ledger bg-ink-800">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-px bg-ledger">
          <div className="bg-ink-800 p-8">
            <h3 className="font-display italic text-2xl text-paper">Free</h3>
            <p className="text-sm text-[#9AA2B1] mt-2">Live BTC & ETH signals, watchlist, and chat.</p>
            <p className="font-mono text-3xl text-paper mt-6">$0</p>
          </div>
          <div className="bg-ink-800 p-8">
            <h3 className="font-display italic text-2xl text-paper">Pro</h3>
            <p className="text-sm text-[#9AA2B1] mt-2">
              All assets, alerting, and priority signal refresh. <span className="text-gold">Coming soon.</span>
            </p>
            <p className="font-mono text-3xl text-paper mt-6">—</p>
          </div>
        </div>
      </section>

      {/* Footer + disclaimer */}
      <footer className="border-t border-ledger px-6 md:px-10 py-10">
        <p className="text-xs text-[#6B7280] max-w-3xl leading-relaxed">
          TradeVision AI provides AI-generated market analysis for educational and informational
          purposes only. It is not financial advice, and users should perform their own research
          before making trading decisions.
        </p>
      </footer>
    </div>
  );
}
