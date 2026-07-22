"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: 'Ask me about BTC, ETH, SOL, or BNB — try "Should I buy BTC now?"',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.chat(trimmed);
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Couldn't reach the signal engine — check that the backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="chat" className="panel p-5 flex flex-col h-[420px]">
      <span className="font-mono text-xs uppercase tracking-widest text-[#9AA2B1] mb-3">AI Chat</span>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm max-w-[85%] px-3 py-2 rounded-sm ${
              m.role === "user"
                ? "ml-auto bg-gold text-ink"
                : "bg-ink-800 border border-ledger text-[#C7CCD6]"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bg-ink-800 border border-ledger text-[#6B7280] text-sm px-3 py-2 rounded-sm max-w-[60%] font-mono">
            reading the tape…
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Should I buy BTC now?"
          className="flex-1 bg-ink-800 border border-ledger rounded-sm px-3 py-2 text-sm text-paper placeholder:text-[#4A5261] focus:border-gold outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gold text-ink font-mono text-xs uppercase tracking-widest rounded-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
