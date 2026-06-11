"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Copy, Check, Pencil, X,
  ListOrdered, Maximize2, ArrowUp, Plus, Cpu,
} from "lucide-react";
import { Message, Artifact } from "@/data/mock";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell,
} from "recharts";

const models = [
  { id: "sonnet-4.6", label: "Sonnet 4.6" },
  { id: "opus-4.6", label: "Opus 4.6" },
];

const efforts = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export default function ChatPanel({
  messages, onSendMessage, onEditMessage, queuedMessages, onClearQueue, isStreaming, onOpenArtifact,
}: {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onEditMessage: (id: string, content: string) => void;
  queuedMessages: string[];
  onClearQueue: () => void;
  isStreaming: boolean;
  onOpenArtifact: (artifact: Artifact) => void;
}) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("sonnet-4.6");
  const [selectedEffort, setSelectedEffort] = useState("medium");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModelPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const currentModel = models.find((m) => m.id === selectedModel)!;
  const currentEffort = efforts.find((e) => e.id === selectedEffort)!;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={msg.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.02}s` }}>
              {msg.role === "user" ? (
                <UserMessage message={msg} onEdit={onEditMessage} />
              ) : (
                <AssistantMessage message={msg} onOpenArtifact={onOpenArtifact} />
              )}
            </div>
          ))}
          {isStreaming && <StreamingIndicator />}
        </div>
      </div>

      {queuedMessages.length > 0 && (
        <div className="mx-auto max-w-[680px] w-full px-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] mb-2" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>
            <ListOrdered size={11} strokeWidth={2} />
            <span className="font-medium">{queuedMessages.length} queued</span>
            <button onClick={onClearQueue} className="ml-auto p-0.5 rounded hover:bg-[var(--surface-hover)] transition-colors"><X size={10} /></button>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-2">
        <div className="max-w-[680px] mx-auto">
          <div className="rounded-2xl transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-4 pt-3 pb-1">
              <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Message PDGuru..." rows={1}
                className="w-full bg-transparent text-[13px] outline-none resize-none placeholder:text-[var(--text-muted)] leading-relaxed" style={{ maxHeight: "160px" }} />
            </div>
            <div className="flex items-center justify-between px-2.5 pb-2">
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Attach">
                  <Plus size={16} strokeWidth={2} style={{ color: "var(--icon)" }} />
                </button>

                <div className="relative" ref={modelRef}>
                  <button
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{currentModel.label}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{currentEffort.label}</span>
                    <ChevronDown size={10} style={{ color: "var(--icon)" }} />
                  </button>
                  {showModelPicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-[200px] rounded-xl py-1.5 shadow-xl animate-pop-in"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <div className="px-2.5 pb-1">
                        <p className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>Model</p>
                      </div>
                      {models.map((m) => (
                        <button key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
                          style={{ color: m.id === selectedModel ? "var(--text)" : "var(--text-secondary)" }}
                        >
                          {m.id === selectedModel && <span className="mr-1" style={{ color: "var(--accent)" }}>•</span>}
                          {m.label}
                        </button>
                      ))}
                      <div className="mx-2.5 my-1" style={{ borderTop: "1px solid var(--border)" }} />
                      <div className="px-2.5 pb-1">
                        <p className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>Effort</p>
                      </div>
                      {efforts.map((e) => (
                        <button key={e.id}
                          onClick={() => setSelectedEffort(e.id)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
                          style={{ color: e.id === selectedEffort ? "var(--text)" : "var(--text-secondary)" }}
                        >
                          {e.id === selectedEffort && <span className="mr-1" style={{ color: "var(--accent)" }}>•</span>}
                          {e.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!input.trim()}
                className="p-1.5 rounded-xl transition-all disabled:opacity-20"
                style={{ background: input.trim() ? "var(--accent)" : "transparent" }}>
                <ArrowUp size={16} strokeWidth={2.5} style={{ color: input.trim() ? "#fff" : "var(--icon)" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 animate-glow" style={{ background: "var(--accent-surface)" }}>
        <Cpu size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
      </div>
      <div className="flex gap-1.5 pt-2">
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
      </div>
    </div>
  );
}

function UserMessage({ message, onEdit }: { message: Message; onEdit: (id: string, c: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(message.content);

  if (editing) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] w-full">
          <textarea value={editVal} onChange={(e) => setEditVal(e.target.value)} autoFocus rows={2}
            className="w-full px-3.5 py-2.5 rounded-2xl text-[13px] outline-none resize-none leading-relaxed"
            style={{ background: "var(--surface)", border: "2px solid var(--accent)" }} />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button onClick={() => setEditing(false)} className="px-2.5 py-1 rounded-lg text-[11px]" style={{ color: "var(--text-muted)" }}>Cancel</button>
            <button onClick={() => { if (editVal.trim() !== message.content) onEdit(message.id, editVal.trim()); setEditing(false); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white" style={{ background: "var(--accent)" }}>
              Save & resubmit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end group">
      <div className="flex items-start gap-1.5 max-w-[85%]">
        <button onClick={() => setEditing(true)}
          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:bg-[var(--surface-hover)]">
          <Pencil size={10} style={{ color: "var(--icon)" }} />
        </button>
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed" style={{ background: "var(--surface)", color: "var(--text)" }}>
          {message.content}
          {message.isEdited && <span className="text-[9px] ml-1.5" style={{ color: "var(--text-muted)" }}>(edited)</span>}
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3);
          const langEnd = lines.indexOf("\n");
          const lang = langEnd > 0 ? lines.slice(0, langEnd).trim() : "";
          const code = langEnd > 0 ? lines.slice(langEnd + 1) : lines;
          return (
            <div key={i} className="my-2 rounded-xl overflow-hidden text-[12px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {lang && <div className="px-3 py-1 text-[10px] font-mono" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{lang}</div>}
              <pre className="p-3 overflow-x-auto"><code className="font-mono" style={{ color: "var(--text-secondary)" }}>{code}</code></pre>
            </div>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 rounded text-[12px] font-mono" style={{ background: "var(--surface)", color: "var(--accent)" }}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function AssistantMessage({ message, onOpenArtifact }: { message: Message; onOpenArtifact: (a: Artifact) => void }) {
  const [fcExpanded, setFcExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-start gap-3 group">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--accent-surface)" }}>
        <Cpu size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-relaxed"><MarkdownRenderer content={message.content} /></div>

        {message.artifact && (
          <div className="mt-3 rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{message.artifact.title}</span>
              <button onClick={() => onOpenArtifact(message.artifact!)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                <Maximize2 size={11} strokeWidth={2} style={{ color: "var(--icon)" }} />
              </button>
            </div>
            <div className="p-3">
              <ArtifactRenderer artifact={message.artifact} compact />
            </div>
          </div>
        )}

        {message.fcCommand && (
          <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <button onClick={() => setFcExpanded(!fcExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] transition-colors hover:bg-[var(--surface-hover)]"
              style={{ background: "var(--surface)" }}>
              <span className="font-mono font-medium truncate">{message.fcCommand.command}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span style={{ color: "var(--text-muted)" }}>{message.fcCommand.duration}</span>
                {fcExpanded ? <ChevronDown size={11} style={{ color: "var(--icon)" }} /> : <ChevronRight size={11} style={{ color: "var(--icon)" }} />}
              </div>
            </button>
            {fcExpanded && (
              <div className="px-3 py-2" style={{ borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }}>
                <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {message.fcCommand.output}
                </pre>
              </div>
            )}
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.citations.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[9px] font-mono" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>{c}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            {copied ? <Check size={11} strokeWidth={2} style={{ color: "var(--success)" }} /> : <Copy size={11} strokeWidth={2} style={{ color: "var(--icon)" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArtifactRenderer({ artifact, compact }: { artifact: Artifact; compact?: boolean }) {
  if (artifact.type === "chart") {
    const data = artifact.data as { chartType: string; series: { name: string; value: number; prev?: number }[] };
    const h = compact ? 120 : 260;
    const margin = compact ? { top: 5, right: 5, bottom: 5, left: -15 } : { top: 10, right: 20, bottom: 10, left: 0 };
    const fontSize = compact ? 9 : 11;

    if (data.chartType === "bar") {
      return (
        <div style={{ height: h }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.series} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)" }} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={compact ? 20 : 36}>
                {data.series.map((e, i) => (
                  <Cell key={i} fill={e.value < 0 ? "var(--error)" : "var(--success)"} fillOpacity={0.8} />
                ))}
              </Bar>
              {data.series[0]?.prev !== undefined && (
                <Bar dataKey="prev" radius={[3, 3, 0, 0]} maxBarSize={compact ? 20 : 36} fill="var(--text-muted)" fillOpacity={0.15} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div style={{ height: h }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)" }} />
            <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={{ r: compact ? 3 : 4, fill: "var(--accent)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (artifact.type === "terminal") {
    return (
      <div className="rounded-lg overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: "#222" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "#d9534f" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#e8a838" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#5cb85c" }} />
          <span className="text-[9px] ml-2 font-mono" style={{ color: "#666" }}>fc_shell — tmux</span>
        </div>
        <div className="p-3 font-mono text-[11px] leading-relaxed" style={{ color: "#5cb85c", minHeight: compact ? 80 : 160 }}>
          <p style={{ color: "#666" }}>fc_shell&gt; <span style={{ color: "#e8e8e8" }}>report_timing -max_paths 5</span></p>
          <p className="mt-1" style={{ color: "#999" }}>Loading timing data...</p>
          <p style={{ color: "#999" }}>5 paths reported.</p>
          <p className="mt-1" style={{ color: "#666" }}>fc_shell&gt; <span className="animate-pulse-dot" style={{ color: "var(--accent)" }}>_</span></p>
        </div>
      </div>
    );
  }

  return <div className="text-[11px] p-4 text-center" style={{ color: "var(--text-muted)" }}>Unsupported artifact type</div>;
}
