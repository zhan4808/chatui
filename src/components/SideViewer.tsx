"use client";

import { useState, useRef, useCallback } from "react";
import { X, Copy, Check, Download, Code, FileText, ArrowLeft } from "lucide-react";
import { Artifact, FileType } from "@/data/mock";
import { ArtifactRenderer } from "./ChatPanel";

export type SideViewerContent =
  | { kind: "file"; title: string; fileName: string; fileType: FileType; content: string }
  | { kind: "artifact"; artifact: Artifact };

const langMap: Record<FileType, string> = {
  markdown: "markdown",
  tcl: "tcl",
  log: "log",
  csv: "csv",
  python: "python",
  verilog: "verilog",
  sdc: "sdc",
  text: "text",
  json: "json",
};

export default function SideViewer({
  content,
  onClose,
  onBack,
}: {
  content: SideViewerContent;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "source">("preview");
  const [width, setWidth] = useState(480);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: width };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - ev.clientX;
      setWidth(Math.max(320, Math.min(800, dragRef.current.startW + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width]);

  const title = content.kind === "file" ? content.title : content.artifact.title;
  const subtitle = content.kind === "file"
    ? (content.fileName !== content.title ? content.fileName : undefined)
    : content.artifact.type;

  const handleCopy = () => {
    const text = content.kind === "file" ? content.content : JSON.stringify(content.artifact.data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = content.kind === "file" ? content.content : JSON.stringify(content.artifact.data, null, 2);
    const fileName = content.kind === "file" ? content.fileName : `${content.artifact.title}.json`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isCodeType = content.kind === "file" && content.fileType !== "markdown";
  const isMarkdown = content.kind === "file" && content.fileType === "markdown";

  return (
    <div className="flex flex-col animate-slide-in-right shrink-0 h-full relative"
      style={{ width, background: "var(--bg-elevated)", borderLeft: "1px solid var(--border)" }}>
      {/* Drag handle with visible indicator */}
      <div
        onMouseDown={onDragStart}
        className="absolute left-0 top-0 bottom-0 w-[5px] cursor-col-resize z-10 group/drag flex items-center justify-center hover:bg-[rgba(60,123,192,0.15)]"
      >
        <div className="w-[3px] h-8 rounded-full transition-colors bg-[rgba(255,255,255,0.15)] group-hover/drag:bg-[var(--accent)]"
        />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors shrink-0" title="Back to panel">
              <ArrowLeft size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate">{title}</div>
            {subtitle && <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{subtitle}</div>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          {content.kind === "file" && isMarkdown && (
            <>
              <button
                onClick={() => setViewMode("preview")}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: viewMode === "preview" ? "var(--surface)" : "transparent" }}
                title="Preview"
              >
                <FileText size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
              </button>
              <button
                onClick={() => setViewMode("source")}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: viewMode === "source" ? "var(--surface)" : "transparent" }}
                title="Source"
              >
                <Code size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
              </button>
            </>
          )}
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Copy">
            {copied ? <Check size={13} strokeWidth={2} style={{ color: "var(--success)" }} /> : <Copy size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />}
          </button>
          <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Download">
            <Download size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Close">
            <X size={13} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {content.kind === "artifact" ? (
          <div className="p-5">
            <ArtifactRenderer artifact={content.artifact} />
          </div>
        ) : isMarkdown && viewMode === "preview" ? (
          <div className="p-5">
            <MarkdownPreview content={content.content} />
          </div>
        ) : (
          <CodeView content={content.content} lang={langMap[content.fileType] || "text"} />
        )}
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="text-[12px] leading-relaxed space-y-2" style={{ color: "var(--text-secondary)" }}>
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-[14px] font-semibold mt-4 mb-1" style={{ color: "var(--text)" }}>{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-[13px] font-semibold mt-3 mb-0.5" style={{ color: "var(--text)" }}>{line.slice(4)}</h3>;
        if (line.startsWith("- [ ] ")) return <p key={i} className="pl-3 flex items-center gap-1.5"><span className="w-3 h-3 rounded border inline-block shrink-0" style={{ borderColor: "var(--border)" }} />{line.slice(6)}</p>;
        if (line.startsWith("- [x] ")) return <p key={i} className="pl-3 flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block shrink-0" style={{ background: "var(--accent)" }} />{line.slice(6)}</p>;
        if (line.startsWith("- ")) return <p key={i} className="pl-3">• {line.slice(2)}</p>;
        if (line.match(/^\d+\./)) return <p key={i} className="pl-3">{line}</p>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        if (line.startsWith("```")) return null;

        const boldParts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i}>
            {boldParts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**"))
                return <strong key={j} style={{ color: "var(--text)" }}>{part.slice(2, -2)}</strong>;
              if (part.startsWith("`") && part.endsWith("`"))
                return <code key={j} className="px-1 py-0.5 rounded text-[11px] font-mono" style={{ background: "var(--surface)", color: "var(--accent)" }}>{part.slice(1, -1)}</code>;
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function CodeView({ content, lang }: { content: string; lang: string }) {
  const lines = content.split("\n");

  return (
    <div className="font-mono text-[11px] leading-[1.6]">
      {/* Language label */}
      <div className="px-4 py-1.5 text-[10px] font-medium sticky top-0 z-10"
        style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
        {lang}
      </div>
      <div className="px-0 py-2">
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-[var(--surface-hover)] transition-colors">
            <span className="w-10 text-right pr-3 shrink-0 select-none" style={{ color: "var(--text-muted)" }}>
              {i + 1}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-all pr-4" style={{ color: colorize(line, lang) }}>
              {line || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function colorize(line: string, lang: string): string {
  const trimmed = line.trim();
  if (lang === "tcl" || lang === "sdc") {
    if (trimmed.startsWith("#")) return "var(--text-muted)";
    if (trimmed.startsWith("set ") || trimmed.startsWith("proc ") || trimmed.startsWith("foreach ") || trimmed.startsWith("if ")) return "var(--accent)";
  }
  if (lang === "python") {
    if (trimmed.startsWith("#")) return "var(--text-muted)";
    if (trimmed.startsWith("def ") || trimmed.startsWith("class ") || trimmed.startsWith("import ") || trimmed.startsWith("from ")) return "var(--accent)";
  }
  if (lang === "json") {
    if (trimmed.startsWith('"') && trimmed.includes('":')) return "var(--accent)";
  }
  if (lang === "log") {
    if (trimmed.startsWith("*")) return "var(--text-muted)";
    if (trimmed.includes("VIOLATED") || trimmed.includes("ERROR")) return "var(--error)";
    if (trimmed.includes("slack")) return "var(--warning)";
    if (trimmed.startsWith("---")) return "var(--text-muted)";
  }
  if (lang === "verilog") {
    if (trimmed.startsWith("//")) return "var(--text-muted)";
    if (trimmed.startsWith("module ") || trimmed.startsWith("always ") || trimmed.startsWith("assign ")) return "var(--accent)";
  }
  return "var(--text-secondary)";
}
