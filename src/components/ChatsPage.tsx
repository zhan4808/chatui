"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { ChatSession } from "@/data/mock";

export default function ChatsPage({
  sessions,
  onSelectChat,
}: {
  sessions: ChatSession[];
  onSelectChat: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[700px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold font-display">Chats</h1>
        </div>

        <div className="relative mb-4">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none placeholder:text-[var(--text-muted)]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          />
        </div>

        <div className="space-y-px">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => onSelectChat(s.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-[var(--surface-hover)]"
            >
              <MessageSquare size={16} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              <span className="text-[13px] flex-1 truncate" style={{ color: "var(--text)" }}>{s.title}</span>
              <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>{s.timestamp}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[13px]" style={{ color: "var(--text-muted)" }}>No chats found</div>
          )}
        </div>
      </div>
    </div>
  );
}
