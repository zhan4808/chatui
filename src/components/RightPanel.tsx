"use client";

import { useState } from "react";
import {
  Brain, Layers, BookOpen, FolderOpen, User, Building,
  Zap, Database,
} from "lucide-react";
import { MemoryDoc, SkillDoc, Artifact } from "@/data/mock";
import { SideViewerContent } from "./SideViewer";

type Tab = "memory" | "artifacts";

const memTypeIcons: Record<string, typeof BookOpen> = {
  methodology: BookOpen,
  "run-context": FolderOpen,
  "user-pref": User,
  project: Building,
};

const skillTypeIcons: Record<string, typeof Zap> = {
  skill: Zap,
  knowledge: Database,
};

export default function RightPanel({
  memoryDocs,
  skillDocs,
  artifacts,
  onOpenViewer,
}: {
  memoryDocs: MemoryDoc[];
  skillDocs: SkillDoc[];
  artifacts: Artifact[];
  onOpenViewer: (content: SideViewerContent) => void;
}) {
  const [tab, setTab] = useState<Tab>("memory");

  const tabs: { id: Tab; icon: typeof Brain; label: string }[] = [
    { id: "memory", icon: Brain, label: "Memory" },
    { id: "artifacts", icon: Layers, label: "Artifacts" },
  ];

  return (
    <div className="w-[260px] flex flex-col animate-slide-in-right rounded-l-2xl overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
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
        {tab === "memory" && (
          <MemoryTab docs={memoryDocs} skillDocs={skillDocs} onOpenViewer={onOpenViewer} />
        )}
        {tab === "artifacts" && <ArtifactsTab artifacts={artifacts} onOpenViewer={onOpenViewer} />}
      </div>
    </div>
  );
}

function MemoryTab({ docs, skillDocs, onOpenViewer }: {
  docs: MemoryDoc[];
  skillDocs: SkillDoc[];
  onOpenViewer: (content: SideViewerContent) => void;
}) {
  return (
    <>
      <div className="px-1 pt-1 pb-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Context
        </p>
      </div>
      {docs.map((doc) => {
        const Icon = memTypeIcons[doc.type] || BookOpen;
        return (
          <button key={doc.id}
            onClick={() => onOpenViewer({
              kind: "file", title: doc.title, fileName: doc.fileName,
              fileType: doc.fileType, content: doc.content,
            })}
            className="w-full text-left rounded-lg p-2 transition-all hover:bg-[var(--surface-hover)]"
          >
            <div className="flex items-center gap-1.5">
              <Icon size={11} strokeWidth={2} style={{ color: "var(--icon)" }} />
              <span className="text-[11px] truncate flex-1">{doc.fileName}</span>
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{doc.lastUsed}</span>
            </div>
          </button>
        );
      })}

      <div className="px-1 pt-3 pb-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Skills & Knowledge
        </p>
      </div>
      {skillDocs.map((doc) => {
        const Icon = skillTypeIcons[doc.type] || Zap;
        return (
          <button key={doc.id}
            onClick={() => onOpenViewer({
              kind: "file", title: doc.title, fileName: doc.source,
              fileType: doc.fileType, content: doc.content,
            })}
            className="w-full text-left rounded-lg p-2 transition-all hover:bg-[var(--surface-hover)]"
          >
            <div className="flex items-center gap-1.5">
              <Icon size={11} strokeWidth={2} style={{ color: "var(--icon)" }} />
              <span className="text-[11px] truncate flex-1">{doc.source}</span>
            </div>
          </button>
        );
      })}
    </>
  );
}

function ArtifactsTab({ artifacts, onOpenViewer }: { artifacts: Artifact[]; onOpenViewer: (content: SideViewerContent) => void }) {
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
          <button key={a.id} onClick={() => onOpenViewer({ kind: "artifact", artifact: a })}
            className="w-full text-left rounded-lg p-2 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Layers size={10} strokeWidth={2} style={{ color: "var(--icon)" }} />
              <span className="text-[11px] font-medium truncate">{a.title}</span>
            </div>
            <span className="text-[9px] ml-4" style={{ color: "var(--text-muted)" }}>{a.type}</span>
          </button>
        ))
      )}
    </>
  );
}
