"use client";

import { useEffect, useState } from "react";
import { api, type MarketSnapshot, type SignalResult, type SentimentResult } from "@/lib/api";
import AssetCard from "./AssetCard";
import SentimentWidget from "./SentimentWidget";
import LiveChart from "./LiveChart";
import SignalPanel from "./SignalPanel";
import ChatPanel from "./ChatPanel";
import Watchlist from "./Watchlist";

const TRACKED = ["BTC", "ETH"];

export default function DashboardClient({
  initialMarkets,
  initialSignals,
  initialSentiment,
}: {
  initialMarkets: Record<string, MarketSnapshot>;
  initialSignals: Record<string, SignalResult>;
  initialSentiment: SentimentResult;
}) {
  const [selected, setSelected] = useState<string>("BTC");
  const [markets, setMarkets] = useState(initialMarkets);
  const [signals, setSignals] = useState(initialSignals);
  const [sentiment, setSentiment] = useState<SentimentResult>(initialSentiment);
  const [loadingSelected, setLoadingSelected] = useState(false);

  // Load data for any asset not already fetched (e.g. selecting SOL/BNB
  // from the watchlist, which the server didn't preload).
  useEffect(() => {
    if (markets[selected]) return;
    let cancelled = false;
    setLoadingSelected(true);
    Promise.all([api.market(selected), api.signal(selected)])
      .then(([m, s]) => {
        if (cancelled) return;
        setMarkets((prev) => ({ ...prev, [selected]: m }));
        setSignals((prev) => ({ ...prev, [selected]: s }));
      })
      .finally(() => !cancelled && setLoadingSelected(false));
    return () => {
      cancelled = true;
    };
  }, [selected, markets]);

  // Light polling to keep the "live" feel without a websocket for the MVP.
  useEffect(() => {
    const id = setInterval(() => {
      api.sentiment().then(setSentiment).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const activeMarket = markets[selected];
  const activeSignal = signals[selected];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">
      <div className="grid md:grid-cols-3 gap-5">
        {TRACKED.map((asset) =>
          markets[asset] ? (
            <AssetCard
              key={asset}
              market={markets[asset]}
              signal={signals[asset] ?? null}
              active={selected === asset}
              onSelect={() => setSelected(asset)}
            />
          ) : null
        )}
        <SentimentWidget sentiment={sentiment} />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="space-y-5">
          {activeMarket && !loadingSelected ? (
            <LiveChart candles={activeMarket.candles} symbol={activeMarket.symbol} />
          ) : (
            <div className="panel p-5 h-[320px] flex items-center justify-center font-mono text-sm text-[#6B7280]">
              Loading chart…
            </div>
          )}
          <Watchlist selected={selected} onSelect={setSelected} />
        </div>

        <div className="space-y-5">
          {activeSignal && !loadingSelected ? (
            <SignalPanel signal={activeSignal} />
          ) : (
            <div className="panel p-6 h-[320px] flex items-center justify-center font-mono text-sm text-[#6B7280]">
              Reading the tape…
            </div>
          )}
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
