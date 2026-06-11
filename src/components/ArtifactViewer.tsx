"use client";

import { X, Download, Code } from "lucide-react";
import { Artifact } from "@/data/mock";
import { ArtifactRenderer } from "./ChatPanel";

export default function ArtifactViewer({
  artifact,
  onClose,
}: {
  artifact: Artifact;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-[600px] max-h-[480px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-slide-in-up"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-[12px] font-semibold">{artifact.title}</span>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              <Download size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              <Code size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              <X size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <ArtifactRenderer artifact={artifact} />
        </div>
      </div>
    </div>
  );
}
