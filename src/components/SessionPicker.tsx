"use client";

import { useState } from "react";
import { X, Circle, Search, Server, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { ToolSession, ToolType, toolLabels } from "@/data/mock";

export default function SessionPicker({
  sessions, onAttach, onClose, username,
}: {
  sessions: ToolSession[];
  onAttach: (id: string) => void;
  onClose: () => void;
  username: string;
}) {
  const [filter, setFilter] = useState<ToolType | "all">("all");
  const [search, setSearch] = useState("");

  const userSessions = sessions.filter((s) => s.user === username);
  const filtered = userSessions.filter((s) => {
    if (filter !== "all" && s.tool !== filter) return false;
    if (search && !s.name.includes(search) && !s.design.includes(search)) return false;
    return true;
  });
  const toolTypes = [...new Set(userSessions.map((s) => s.tool))];

  const statusColors: Record<string, { color: string; label: string }> = {
    active: { color: "var(--success)", label: "Active" },
    idle: { color: "var(--warning)", label: "Idle" },
    batch: { color: "var(--text-muted)", label: "Batch" },
    stale: { color: "var(--error)", label: "Stale" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-[440px] max-h-[500px] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-slide-in-up"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[13px] font-semibold">Connect to session</h2>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {filtered.length} session{filtered.length !== 1 ? "s" : ""} for {username}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
            <X size={15} color="var(--text-muted)" />
          </button>
        </div>

        <div className="px-5 pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" color="var(--text-muted)" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-xl outline-none transition-all placeholder:text-[var(--text-muted)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setFilter("all")} className="px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors"
              style={{ background: filter === "all" ? "var(--accent)" : "var(--surface)", color: filter === "all" ? "#fff" : "var(--text-secondary)" }}>
              All
            </button>
            {toolTypes.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-colors"
                style={{ background: filter === t ? toolLabels[t].color + "25" : "var(--surface)", color: filter === t ? toolLabels[t].color : "var(--text-secondary)" }}>
                {toolLabels[t].short}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
          {filtered.map((session) => {
            const status = statusColors[session.status];
            const tool = toolLabels[session.tool];
            return (
              <div key={session.id} className="rounded-2xl p-3.5 transition-all"
                style={{ background: session.attached ? tool.color + "10" : "var(--surface)", border: session.attached ? `1px solid ${tool.color}40` : "1px solid transparent" }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: tool.color + "20", color: tool.color }}>{tool.short}</span>
                    <span className="text-[12px] font-semibold font-mono">{session.name}</span>
                    {session.attached && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: tool.color }}>CONNECTED</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle size={5} fill={status.color} color={status.color} />
                    <span className="text-[9px]" style={{ color: status.color }}>{status.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span>{session.design}</span>
                  <span className="flex items-center gap-0.5"><Server size={9} />{session.node}</span>
                  <span className="flex items-center gap-0.5"><Clock size={9} />{session.uptime}</span>
                </div>
                {!session.attached && session.status !== "batch" && (
                  <button onClick={() => onAttach(session.id)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all hover:brightness-110"
                    style={{ background: tool.color + "18", color: tool.color }}>
                    <ArrowRight size={12} /> Connect
                  </button>
                )}
                {session.status === "batch" && (
                  <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <AlertCircle size={10} /> Batch — not connectable
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
