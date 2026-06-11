"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { ChatSession, toolLabels } from "@/data/mock";

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  collapsed,
  onToggleCollapse,
  username,
}: {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  username: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const initials = username.slice(0, 2).toUpperCase();

  if (collapsed) {
    return (
      <div className="w-[52px] flex flex-col items-center py-3 gap-1 glass" style={{ borderRight: "1px solid var(--glass-border)" }}>
        <button onClick={onToggleCollapse} className="p-2 rounded-xl hover:bg-[var(--glass-hover)] transition-colors">
          <PanelLeftOpen size={16} color="var(--text-muted)" />
        </button>
        <button className="p-2 rounded-xl hover:bg-[var(--glass-hover)] transition-colors" title="New chat">
          <Plus size={16} color="var(--text-muted)" />
        </button>
        <div className="flex-1" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[220px] flex flex-col py-3 px-2 transition-panel glass" style={{ borderRight: "1px solid var(--glass-border)" }}>
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-[13px] font-semibold tracking-tight">PDGuru</span>
        <button onClick={onToggleCollapse} className="p-1 rounded-lg hover:bg-[var(--glass-hover)] transition-colors">
          <PanelLeftClose size={14} color="var(--text-muted)" />
        </button>
      </div>

      <div className="px-1 mb-3">
        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium transition-colors hover:brightness-110" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>
          <Plus size={13} /> New chat
        </button>
      </div>

      <div className="px-1 mb-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" color="var(--text-muted)" />
          <input
            type="text" placeholder="Search..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg outline-none transition-colors placeholder:text-[var(--text-muted)]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {filtered.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left px-2.5 py-2 rounded-xl transition-all ${
              session.id === activeSessionId ? "" : "hover:bg-[var(--glass-hover)]"
            }`}
            style={session.id === activeSessionId ? { background: "rgba(255,255,255,0.06)" } : undefined}
          >
            <div className="text-[11px] font-medium truncate" style={{ color: session.id === activeSessionId ? "var(--text)" : "var(--text-secondary)" }}>
              {session.title}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{session.timestamp}</span>
              {session.activeTool && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: toolLabels[session.activeTool].color + "20", color: toolLabels[session.activeTool].color }}>
                  {toolLabels[session.activeTool].short}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="px-1 pt-2 mt-1">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--glass-hover)] transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium truncate">{username}</div>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>Compute: cn-17</div>
          </div>
          <LogOut size={12} color="var(--text-muted)" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </div>
  );
}
