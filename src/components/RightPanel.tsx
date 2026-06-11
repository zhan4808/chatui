"use client";

import { useState } from "react";
import { Brain, Activity, BookOpen, FolderOpen, User, Building, Pencil, Plus, ToggleLeft, ToggleRight, Zap, FileSearch } from "lucide-react";
import { MemoryDoc, ToolCall, RouteSource } from "@/data/mock";

type Tab = "memory" | "activity";

const memTypeConfig: Record<string, { icon: typeof BookOpen; color: string; label: string }> = {
  methodology: { icon: BookOpen, color: "var(--kb)", label: "Method" },
  "run-context": { icon: FolderOpen, color: "var(--log)", label: "Context" },
  "user-pref": { icon: User, color: "var(--accent)", label: "Pref" },
  project: { icon: Building, color: "var(--live)", label: "Project" },
};

const routeIcons: Record<RouteSource, typeof BookOpen> = {
  knowledge: BookOpen,
  "log-analysis": FileSearch,
  "live-fc": Zap,
};

export default function RightPanel({
  memoryDocs,
  toolCalls,
  onToggleMemory,
}: {
  memoryDocs: MemoryDoc[];
  toolCalls: ToolCall[];
  onToggleMemory: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("memory");

  return (
    <div className="w-[280px] flex flex-col transition-panel animate-slide-in-right glass" style={{ borderLeft: "1px solid var(--glass-border)" }}>
      <div className="flex px-2 pt-2 gap-1">
        {([
          { id: "memory" as Tab, icon: Brain, label: "Memory" },
          { id: "activity" as Tab, icon: Activity, label: "Activity" },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-colors"
              style={{
                background: tab === t.id ? "rgba(255,255,255,0.06)" : "transparent",
                color: tab === t.id ? "var(--text)" : "var(--text-muted)",
              }}
            >
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tab === "memory" ? (
          <MemoryTab docs={memoryDocs} onToggle={onToggleMemory} />
        ) : (
          <ActivityTab calls={toolCalls} />
        )}
      </div>
    </div>
  );
}

function MemoryTab({ docs, onToggle }: { docs: MemoryDoc[]; onToggle: (id: string) => void }) {
  return (
    <>
      <p className="text-[10px] px-1 mb-1" style={{ color: "var(--text-muted)" }}>
        Context documents active in this session
      </p>
      {docs.map((doc) => {
        const type = memTypeConfig[doc.type];
        const Icon = type.icon;
        return (
          <div key={doc.id} className="rounded-xl p-3 group transition-all" style={{ background: "rgba(255,255,255,0.04)", opacity: doc.active ? 1 : 0.5 }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon size={11} color={type.color} className="shrink-0" />
                <span className="text-[11px] font-medium truncate">{doc.title}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--glass-hover)]">
                  <Pencil size={10} color="var(--text-muted)" />
                </button>
                <button onClick={() => onToggle(doc.id)} className="p-0.5 rounded transition-colors" title={doc.active ? "Disable" : "Enable"}>
                  {doc.active ? (
                    <ToggleRight size={14} color="var(--accent)" />
                  ) : (
                    <ToggleLeft size={14} color="var(--text-muted)" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {doc.summary}
            </p>
            <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>
              {doc.lastUsed}
            </p>
          </div>
        );
      })}
      <button className="w-full rounded-xl p-2.5 text-[11px] font-medium transition-colors hover:bg-[var(--glass-hover)]" style={{ border: "1px dashed var(--glass-border)", color: "var(--text-muted)" }}>
        <Plus size={11} className="inline mr-1" /> Add context
      </button>
    </>
  );
}

function ActivityTab({ calls }: { calls: ToolCall[] }) {
  return (
    <>
      <p className="text-[10px] px-1 mb-1" style={{ color: "var(--text-muted)" }}>
        Recent tool calls
      </p>
      {calls.map((tc) => {
        const Icon = routeIcons[tc.route];
        return (
          <div key={tc.id} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon size={10} color={tc.route === "live-fc" ? "var(--live)" : tc.route === "knowledge" ? "var(--kb)" : "var(--log)"} />
                <span className="text-[10px] font-semibold font-mono">{tc.tool}</span>
              </div>
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{tc.timestamp}</span>
            </div>
            <div className="text-[9px] font-mono px-2 py-1 rounded-lg mb-1" style={{ background: "rgba(0,0,0,0.2)", color: "var(--text-secondary)" }}>
              {tc.input}
            </div>
            <div className="flex justify-between text-[9px]" style={{ color: "var(--text-muted)" }}>
              <span>{tc.output}</span>
              <span>{tc.duration}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
