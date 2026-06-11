"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, BookOpen, FileSearch, Zap, ChevronDown, ChevronRight,
  Copy, Check, Pencil, X, ListOrdered, Sparkles, Maximize2,
  Paperclip, Globe, ArrowUp, Cpu, Wrench, ChevronUp,
} from "lucide-react";
import { Message, RouteSource, Artifact } from "@/data/mock";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell,
} from "recharts";

const routeConfig: Record<RouteSource, { icon: typeof BookOpen; color: string; label: string }> = {
  knowledge: { icon: BookOpen, color: "var(--kb)", label: "Knowledge" },
  "log-analysis": { icon: FileSearch, color: "var(--log)", label: "Logs" },
  "live-fc": { icon: Zap, color: "var(--live)", label: "Live" },
};

const models = [
  { id: "pdguru-1", label: "PDGuru-1", desc: "Balanced speed & accuracy" },
  { id: "pdguru-1-pro", label: "PDGuru-1 Pro", desc: "Best for complex analysis" },
  { id: "pdguru-1-mini", label: "PDGuru-1 Mini", desc: "Fast responses" },
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
  const [selectedModel, setSelectedModel] = useState("pdguru-1");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModelPicker(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setShowTools(false);
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

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-4 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={msg.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
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
        <div className="mx-auto max-w-[700px] w-full px-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] mb-2" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>
            <ListOrdered size={12} />
            <span className="font-medium">{queuedMessages.length} queued</span>
            <button onClick={onClearQueue} className="ml-auto p-0.5 rounded hover:bg-[var(--surface)] transition-colors"><X size={11} /></button>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-2">
        <div className="max-w-[700px] mx-auto">
          <div className="rounded-2xl transition-all focus-within:ring-1 focus-within:ring-[var(--accent-dim)]"
            style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}>

            <div className="px-4 pt-3 pb-1">
              <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Ask anything..." rows={1}
                className="w-full bg-transparent text-[13px] outline-none resize-none placeholder:text-[var(--text-muted)] leading-relaxed" style={{ maxHeight: "160px" }} />
            </div>

            <div className="flex items-center justify-between px-3 pb-2.5">
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-colors" title="Attach file">
                  <Paperclip size={14} color="var(--text-muted)" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-colors" title="Web search">
                  <Globe size={14} color="var(--text-muted)" />
                </button>
                <div className="relative" ref={toolsRef}>
                  <button
                    onClick={() => { setShowTools(!showTools); setShowModelPicker(false); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--glass-hover)] transition-colors"
                    title="Tools"
                  >
                    <Wrench size={14} color="var(--text-muted)" />
                  </button>
                  {showTools && (
                    <div className="absolute bottom-full left-0 mb-2 w-[200px] rounded-xl py-1 shadow-xl animate-pop-in"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}>
                      {["Knowledge Lookup", "Log Analysis", "Live FC Command", "Run Script"].map((t) => (
                        <button key={t} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[var(--glass-hover)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-4 mx-1" style={{ background: "var(--glass-border)" }} />

                <div className="relative" ref={modelRef}>
                  <button
                    onClick={() => { setShowModelPicker(!showModelPicker); setShowTools(false); }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--glass-hover)] transition-colors"
                  >
                    <Cpu size={12} color="var(--text-muted)" />
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{currentModel.label}</span>
                    <ChevronUp size={10} color="var(--text-muted)" />
                  </button>
                  {showModelPicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-[220px] rounded-xl py-1 shadow-xl animate-pop-in"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}>
                      {models.map((m) => (
                        <button key={m.id}
                          onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--glass-hover)] transition-colors"
                          style={m.id === selectedModel ? { background: "var(--accent-surface)" } : undefined}
                        >
                          <div className="text-[11px] font-medium" style={{ color: m.id === selectedModel ? "var(--accent)" : "var(--text)" }}>{m.label}</div>
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {input.trim() && isStreaming && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "var(--accent-surface)", color: "var(--accent)" }}>queue</span>
                )}
                <button onClick={handleSubmit} disabled={!input.trim()}
                  className="p-1.5 rounded-xl transition-all disabled:opacity-20"
                  style={{ background: input.trim() ? "var(--accent)" : "transparent", color: input.trim() ? "#fff" : "var(--text-muted)" }}>
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] mt-2" style={{ color: "var(--text-muted)" }}>
            PDGuru may make mistakes. Verify critical commands before execution.
          </p>
        </div>
      </div>
    </div>
  );
}

function StreamingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 animate-glow" style={{ background: "var(--accent-surface)" }}>
        <Sparkles size={12} color="var(--accent)" />
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
            className="w-full px-4 py-3 rounded-2xl text-[13px] outline-none resize-none leading-relaxed"
            style={{ background: "var(--surface)", border: "2px solid var(--accent)" }} />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-lg text-[11px]" style={{ color: "var(--text-secondary)" }}>Cancel</button>
            <button onClick={() => { if (editVal.trim() !== message.content) onEdit(message.id, editVal.trim()); setEditing(false); }}
              className="px-3 py-1 rounded-lg text-[11px] font-medium text-white" style={{ background: "var(--accent)" }}>
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
          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:bg-[var(--surface)]">
          <Pencil size={10} color="var(--text-muted)" />
        </button>
        <div className="px-4 py-2.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed" style={{ background: "var(--surface-alt)", color: "var(--text)" }}>
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
            <div key={i} className="my-2 rounded-xl overflow-hidden text-[12px]" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-border)" }}>
              {lang && <div className="px-3 py-1 text-[10px] font-mono" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--glass-border)" }}>{lang}</div>}
              <pre className="p-3 overflow-x-auto"><code className="font-mono" style={{ color: "var(--text-secondary)" }}>{code}</code></pre>
            </div>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 rounded-md text-[12px] font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "var(--accent)" }}>{part.slice(1, -1)}</code>;
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
  const route = message.route ? routeConfig[message.route] : null;
  const RouteIcon = route?.icon;

  return (
    <div className="flex items-start gap-3 group">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--accent-surface)" }}>
        <Sparkles size={12} color="var(--accent)" />
      </div>
      <div className="flex-1 min-w-0">
        {route && RouteIcon && (
          <div className="flex items-center gap-1 mb-1.5">
            <RouteIcon size={11} color={route.color} />
            <span className="text-[10px] font-medium" style={{ color: route.color }}>{route.label}</span>
          </div>
        )}

        <div className="text-[13px] leading-relaxed"><MarkdownRenderer content={message.content} /></div>

        {message.artifact && (
          <div className="mt-3 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{message.artifact.title}</span>
              <button onClick={() => onOpenArtifact(message.artifact!)}
                className="p-1 rounded-lg hover:bg-[var(--glass-hover)] transition-colors" title="Expand">
                <Maximize2 size={11} color="var(--text-muted)" />
              </button>
            </div>
            <div className="p-3">
              <ArtifactRenderer artifact={message.artifact} compact />
            </div>
          </div>
        )}

        {message.fcCommand && (
          <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
            <button onClick={() => setFcExpanded(!fcExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] transition-colors hover:bg-[var(--glass-hover)]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-1.5 font-mono">
                <Zap size={10} color="var(--live)" />
                <span className="font-medium">{message.fcCommand.command}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--text-muted)" }}>{message.fcCommand.duration}</span>
                {fcExpanded ? <ChevronDown size={11} color="var(--text-muted)" /> : <ChevronRight size={11} color="var(--text-muted)" />}
              </div>
            </button>
            {fcExpanded && (
              <div className="px-3 py-2" style={{ borderTop: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.2)" }}>
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
              <span key={i} className="px-2 py-0.5 rounded-lg text-[9px] font-mono" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>{c}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="p-1 rounded-lg hover:bg-[var(--glass-hover)] transition-colors">
            {copied ? <Check size={11} color="var(--success)" /> : <Copy size={11} color="var(--text-muted)" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArtifactRenderer({ artifact, compact }: { artifact: Artifact; compact?: boolean }) {
  if (artifact.type === "chart") {
    const data = artifact.data as { chartType: string; series: { name: string; value: number; prev?: number }[] };
    const h = compact ? 130 : 280;
    const margin = compact ? { top: 5, right: 5, bottom: 5, left: -15 } : { top: 10, right: 20, bottom: 10, left: 0 };
    const fontSize = compact ? 9 : 11;

    if (data.chartType === "bar") {
      return (
        <div style={{ height: h }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.series} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="name" tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)", borderRadius: 12, fontSize: 11, color: "var(--text)" }} />
              <ReferenceLine y={0} stroke="var(--glass-border)" />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={compact ? 24 : 40}>
                {data.series.map((e, i) => (
                  <Cell key={i} fill={e.value < 0 ? "var(--error)" : "var(--success)"} fillOpacity={0.85} />
                ))}
              </Bar>
              {data.series[0]?.prev !== undefined && (
                <Bar dataKey="prev" radius={[4, 4, 0, 0]} maxBarSize={compact ? 24 : 40} fill="var(--text-muted)" fillOpacity={0.15} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis dataKey="name" tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)", borderRadius: 12, fontSize: 11, color: "var(--text)" }} />
            <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={{ r: compact ? 3 : 5, fill: "var(--accent)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (artifact.type === "terminal") {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: "#0d0d0d", border: "1px solid var(--glass-border)" }}>
        <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: "#1a1a1a" }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#f87171" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#fbbf24" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#4ade80" }} />
          <span className="text-[10px] ml-2 font-mono" style={{ color: "#6b6b73" }}>fc_shell — tmux</span>
        </div>
        <div className="p-3 font-mono text-[11px] leading-relaxed" style={{ color: "#4ade80", minHeight: compact ? 100 : 200 }}>
          <p style={{ color: "#6b6b73" }}>fc_shell&gt; <span style={{ color: "#ececef" }}>report_timing -max_paths 5</span></p>
          <p className="mt-1" style={{ color: "#a0a0a8" }}>Loading timing data...</p>
          <p style={{ color: "#a0a0a8" }}>5 paths reported.</p>
          <p className="mt-1" style={{ color: "#6b6b73" }}>fc_shell&gt; <span className="animate-pulse-dot" style={{ color: "#818cf8" }}>_</span></p>
        </div>
      </div>
    );
  }

  return <div className="text-[11px] p-4 text-center" style={{ color: "var(--text-muted)" }}>Unsupported artifact type</div>;
}
