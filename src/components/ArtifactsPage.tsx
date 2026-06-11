"use client";

import { useState } from "react";
import { Search, Layers, BarChart3, Terminal, Code, Image, Table } from "lucide-react";
import { Artifact } from "@/data/mock";

const typeIcons: Record<string, typeof Layers> = {
  chart: BarChart3,
  terminal: Terminal,
  code: Code,
  image: Image,
  table: Table,
};

export default function ArtifactsPage({
  artifacts,
  onOpenArtifact,
}: {
  artifacts: Artifact[];
  onOpenArtifact: (artifact: Artifact) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = artifacts.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[700px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold font-display">Artifacts</h1>
        </div>

        <div className="relative mb-4">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none placeholder:text-[var(--text-muted)]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Layers size={32} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-[14px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No artifacts yet</p>
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Artifacts created during chats will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((a) => {
              const Icon = typeIcons[a.type] || Layers;
              return (
                <button key={a.id} onClick={() => onOpenArtifact(a)}
                  className="text-left rounded-xl p-4 transition-all hover:bg-[var(--surface-hover)] group"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-surface)" }}>
                      <Icon size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
                    </div>
                    <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{a.type}</span>
                  </div>
                  <p className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{a.title}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
