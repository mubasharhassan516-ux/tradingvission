import SiteHeader from "@/components/SiteHeader";
import TickerStrip from "@/components/TickerStrip";
import DashboardClient from "@/components/DashboardClient";
import { serverApi } from "@/lib/serverApi";
import type { MarketSnapshot, SignalResult } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tickerSymbols = ["BTC", "ETH", "SOL", "BNB"];
  const [tickerSnapshots, btcMarket, ethMarket, btcSignal, ethSignal, sentiment] = await Promise.all([
    Promise.all(tickerSymbols.map((s) => serverApi.market(s))),
    serverApi.market("BTC"),
    serverApi.market("ETH"),
    serverApi.signal("BTC"),
    serverApi.signal("ETH"),
    serverApi.sentiment(),
  ]);

  const initialMarkets: Record<string, MarketSnapshot> = { BTC: btcMarket, ETH: ethMarket };
  const initialSignals: Record<string, SignalResult> = { BTC: btcSignal, ETH: ethSignal };
  const tickerItems = tickerSnapshots.map((s) => ({ symbol: s.symbol, price: s.price, changePct: s.change24hPct }));

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader />
      <TickerStrip items={tickerItems} />
      <DashboardClient
        initialMarkets={initialMarkets}
        initialSignals={initialSignals}
        initialSentiment={sentiment}
      />
    </div>
  );
}
