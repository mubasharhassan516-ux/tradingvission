"use client";

type TickerItem = { symbol: string; price: number; changePct: number };

export default function TickerStrip({ items }: { items: TickerItem[] }) {
  if (!items.length) return null;
  // Duplicate the list so the CSS scroll-loop (translateX -50%) is seamless.
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-ledger bg-ink-800 py-2">
      <div className="flex ticker-track w-max">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-2 px-6 font-mono text-xs whitespace-nowrap">
            <span className="text-[#8B93A3]">{item.symbol}</span>
            <span className="text-paper">
              ${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={item.changePct >= 0 ? "text-bull" : "text-bear"}>
              {item.changePct >= 0 ? "▲" : "▼"} {Math.abs(item.changePct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
