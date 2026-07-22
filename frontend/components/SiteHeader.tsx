import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-ledger">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="font-display italic text-xl md:text-2xl text-paper">TradeVision</span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">AI</span>
      </Link>
      <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-[#9AA2B1]">
        <Link href="/dashboard" className="hover:text-paper transition-colors">
          Dashboard
        </Link>
        <Link href="/dashboard#chat" className="hover:text-paper transition-colors">
          AI Chat
        </Link>
        <span className="hidden md:inline text-[#4A5261]">News</span>
      </nav>
    </header>
  );
}
