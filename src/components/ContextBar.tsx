"use client";

import { useState, useRef, useEffect } from "react";
import { Circle, Plug, ChevronDown, FileText, Download, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { BridgeHealth, ToolSession, ChatSession, toolLabels } from "@/data/mock";

export default function ContextBar({
  toolSession,
  bridgeHealth,
  onOpenSessionPicker,
  onToggleRightPanel,
  rightPanelOpen,
  activeSession,
  onUpdateSession,
  onDeleteSession,
  onDownloadChat,
  hasMessages,
  sideViewerOpen,
}: {
  toolSession?: ToolSession;
  bridgeHealth: BridgeHealth;
  onOpenSessionPicker: () => void;
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
  activeSession?: ChatSession;
  onUpdateSession?: (session: ChatSession) => void;
  onDeleteSession?: (id: string) => void;
  onDownloadChat?: () => void;
  hasMessages?: boolean;
  sideViewerOpen?: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const healthColor = {
    connected: "var(--success)",
    degraded: "var(--warning)",
    disconnected: "var(--error)",
    "not-attached": "var(--text-muted)",
  }[bridgeHealth];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (renaming && renameRef.current) renameRef.current.focus();
  }, [renaming]);

  const handleRename = () => {
    setRenameValue(activeSession?.title || "");
    setRenaming(true);
    setShowDropdown(false);
  };

  const handleRenameSubmit = () => {
    if (activeSession && renameValue.trim() && onUpdateSession) {
      onUpdateSession({ ...activeSession, title: renameValue.trim() });
    }
    setRenaming(false);
  };

  const handlePin = () => {
    if (activeSession && onUpdateSession) {
      onUpdateSession({ ...activeSession, pinned: !activeSession.pinned });
    }
    setShowDropdown(false);
  };

  const handleDelete = () => {
    if (activeSession && onDeleteSession) {
      onDeleteSession(activeSession.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 shrink-0 relative z-10">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Chat title with dropdown */}
        <div className="relative" ref={dropdownRef}>
          {renaming ? (
            <input
              ref={renameRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setRenaming(false); }}
              onBlur={handleRenameSubmit}
              className="text-[13px] font-semibold bg-transparent outline-none px-1 py-0.5 rounded"
              style={{ border: "1px solid var(--accent)", minWidth: 120 }}
            />
          ) : (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 px-1 py-0.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors max-w-[240px]"
            >
              <span className="text-[13px] font-semibold truncate">{activeSession?.title || "New chat"}</span>
              <ChevronDown size={12} strokeWidth={2} style={{ color: "var(--icon)" }} className="shrink-0" />
            </button>
          )}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-[160px] rounded-xl py-1 shadow-xl animate-pop-in z-50"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <button onClick={handleRename}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
                style={{ color: "var(--text-secondary)" }}>
                <Pencil size={12} strokeWidth={2} /> Rename
              </button>
              <button onClick={handlePin}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
                style={{ color: "var(--text-secondary)" }}>
                {activeSession?.pinned ? <PinOff size={12} strokeWidth={2} /> : <Pin size={12} strokeWidth={2} />}
                {activeSession?.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
                style={{ color: "var(--error)" }}>
                <Trash2 size={12} strokeWidth={2} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Session chip */}
        {toolSession ? (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] transition-all hover:bg-[var(--surface-hover)]"
          >
            <Circle size={4} fill={healthColor} color={healthColor} className={bridgeHealth === "connected" ? "animate-pulse-dot" : ""} />
            <span className="font-semibold" style={{ color: toolLabels[toolSession.tool].color }}>
              {toolLabels[toolSession.tool].short}
            </span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{toolSession.design}</span>
          </button>
        ) : (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all hover:bg-[var(--surface-hover)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Plug size={10} strokeWidth={2} /> Connect
          </button>
        )}
      </div>

      {!sideViewerOpen && (
        <div className="flex items-center gap-0.5">
          {hasMessages && onDownloadChat && (
            <button
              onClick={onDownloadChat}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
              title="Download chat as markdown"
            >
              <Download size={15} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          )}
          <button
            onClick={onToggleRightPanel}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
          >
            <FileText size={15} strokeWidth={2} style={{ color: rightPanelOpen ? "var(--accent)" : "var(--icon)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
