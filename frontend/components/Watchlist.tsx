"use client";

import { useEffect, useState } from "react";

const ALL_ASSETS = ["BTC", "ETH", "SOL", "BNB"];
const STORAGE_KEY = "tradevision:watchlist";

export default function Watchlist({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (asset: string) => void;
}) {
  const [watched, setWatched] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setWatched(stored ? JSON.parse(stored) : ["BTC", "ETH"]);
    } catch {
      setWatched(["BTC", "ETH"]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }, [watched, hydrated]);

  function toggle(asset: string) {
    setWatched((w) => (w.includes(asset) ? w.filter((a) => a !== asset) : [...w, asset]));
  }

  return (
    <div className="panel p-5">
      <span className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1] mb-3 block">
        Watchlist
      </span>
      <div className="flex flex-wrap gap-2">
        {ALL_ASSETS.map((asset) => {
          const isWatched = watched.includes(asset);
          const isActive = asset === selected;
          return (
            <button
              key={asset}
              onClick={() => onSelect(asset)}
              className={`group flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full border transition ${
                isActive ? "border-gold text-gold" : "border-ledger text-[#9AA2B1] hover:border-[#3A4456]"
              }`}
            >
              {asset}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(asset);
                }}
                className={isWatched ? "text-gold" : "text-[#4A5261]"}
                aria-label={isWatched ? `Remove ${asset} from watchlist` : `Add ${asset} to watchlist`}
              >
                {isWatched ? "★" : "☆"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
