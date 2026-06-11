"use client";

import { useState } from "react";
import {
  Brain, Activity, Layers, ChevronRight, ChevronDown,
  BookOpen, FolderOpen, User, Building,
} from "lucide-react";
import { MemoryDoc, ToolCall, Artifact } from "@/data/mock";

type Tab = "memory" | "activity" | "artifacts";

const memTypeIcons: Record<string, typeof BookOpen> = {
  methodology: BookOpen,
  "run-context": FolderOpen,
  "user-pref": User,
  project: Building,
};

export default function RightPanel({
  memoryDocs,
  toolCalls,
  artifacts,
}: {
  memoryDocs: MemoryDoc[];
  toolCalls: ToolCall[];
  artifacts: Artifact[];
}) {
  const [tab, setTab] = useState<Tab>("memory");

  const tabs: { id: Tab; icon: typeof Brain; label: string }[] = [
    { id: "memory", icon: Brain, label: "Memory" },
    { id: "activity", icon: Activity, label: "Activity" },
    { id: "artifacts", icon: Layers, label: "Artifacts" },
  ];

  return (
    <div className="w-[260px] flex flex-col animate-slide-in-right" style={{ borderLeft: "1px solid var(--border)" }}>
      <div className="flex px-1.5 pt-1.5 gap-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
              style={{
                background: tab === t.id ? "var(--surface-hover)" : "transparent",
                color: tab === t.id ? "var(--text)" : "var(--text-muted)",
              }}
            >
              <Icon size={11} strokeWidth={2} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tab === "memory" && <MemoryTab docs={memoryDocs} />}
        {tab === "activity" && <ActivityTab calls={toolCalls} />}
        {tab === "artifacts" && <ArtifactsTab artifacts={artifacts} />}
      </div>
    </div>
  );
}

function MemoryTab({ docs }: { docs: MemoryDoc[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <p className="text-[9px] px-1 mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
        {docs.length} context documents
      </p>
      {docs.map((doc) => {
        const Icon = memTypeIcons[doc.type] || BookOpen;
        const expanded = expandedId === doc.id;
        return (
          <button key={doc.id}
            onClick={() => setExpandedId(expanded ? null : doc.id)}
            className="w-full text-left rounded-lg p-2 transition-all hover:bg-[var(--surface-hover)]"
          >
            <div className="flex items-center gap-1.5">
              {expanded ? <ChevronDown size={10} style={{ color: "var(--icon)" }} /> : <ChevronRight size={10} style={{ color: "var(--icon)" }} />}
              <Icon size={10} strokeWidth={2} style={{ color: "var(--icon)" }} />
              <span className="text-[11px] font-medium truncate flex-1">{doc.title}</span>
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{doc.lastUsed}</span>
            </div>
            {expanded && (
              <p className="text-[10px] mt-1.5 ml-5 leading-relaxed animate-fade-up" style={{ color: "var(--text-secondary)" }}>
                {doc.summary}
              </p>
            )}
          </button>
        );
      })}
    </>
  );
}

function ActivityTab({ calls }: { calls: ToolCall[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <p className="text-[9px] px-1 mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
        {calls.length} tool calls
      </p>
      {calls.map((tc) => {
        const expanded = expandedId === tc.id;
        return (
          <button key={tc.id}
            onClick={() => setExpandedId(expanded ? null : tc.id)}
            className="w-full text-left rounded-lg p-2 transition-all hover:bg-[var(--surface-hover)]"
          >
            <div className="flex items-center gap-1.5">
              {expanded ? <ChevronDown size={10} style={{ color: "var(--icon)" }} /> : <ChevronRight size={10} style={{ color: "var(--icon)" }} />}
              <span className="text-[10px] font-semibold font-mono flex-1 truncate">{tc.tool}</span>
              <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>{tc.duration}</span>
            </div>
            {expanded && (
              <div className="mt-1.5 ml-5 animate-fade-up">
                <div className="text-[9px] font-mono px-2 py-1 rounded" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                  {tc.input}
                </div>
                <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>{tc.output}</p>
              </div>
            )}
          </button>
        );
      })}
    </>
  );
}

function ArtifactsTab({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <>
      <p className="text-[9px] px-1 mb-1 font-medium" style={{ color: "var(--text-muted)" }}>
        {artifacts.length} artifact{artifacts.length !== 1 ? "s" : ""} in this session
      </p>
      {artifacts.length === 0 ? (
        <div className="text-center py-8">
          <Layers size={20} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>No artifacts yet</p>
        </div>
      ) : (
        artifacts.map((a) => (
          <div key={a.id} className="rounded-lg p-2 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
            <div className="flex items-center gap-1.5">
              <Layers size={10} strokeWidth={2} style={{ color: "var(--icon)" }} />
              <span className="text-[11px] font-medium truncate">{a.title}</span>
            </div>
            <span className="text-[9px] ml-4" style={{ color: "var(--text-muted)" }}>{a.type}</span>
          </div>
        ))
      )}
    </>
  );
}
