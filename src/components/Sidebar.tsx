"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, Search, LogOut, Pin, PinOff, Pencil, Trash2,
  MessageSquare, Sun, Moon, PanelLeft, Layers,
  MoreVertical, X, CornerDownLeft,
} from "lucide-react";
import { ChatSession } from "@/data/mock";

export type AppView = "chat" | "chats" | "artifacts";

type ContextMenu = { x: number; y: number; sessionId: string } | null;

export default function Sidebar({
  sessions,
  activeSessionId,
  activeView,
  onSelectSession,
  onNavigate,
  onNewChat,
  collapsed,
  onToggleCollapse,
  username,
  darkMode,
  onToggleDarkMode,
  onUpdateSessions,
  onOpenSearch,
  onLogout,
}: {
  sessions: ChatSession[];
  activeSessionId: string;
  activeView: AppView;
  onSelectSession: (id: string) => void;
  onNavigate: (view: AppView) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  username: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateSessions: (sessions: ChatSession[]) => void;
  onOpenSearch: () => void;
  onLogout: () => void;
}) {
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const pinned = sessions.filter((s) => s.pinned);
  const unpinned = sessions.filter((s) => !s.pinned);
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  const handlePin = useCallback((sessionId: string) => {
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, pinned: !s.pinned } : s
    );
    onUpdateSessions(updated);
    setContextMenu(null);
  }, [sessions, onUpdateSessions]);

  const handleDelete = useCallback((sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    onUpdateSessions(updated);
    if (activeSessionId === sessionId && updated.length > 0) {
      onSelectSession(updated[0].id);
    }
    setContextMenu(null);
  }, [sessions, onUpdateSessions, activeSessionId, onSelectSession]);

  const handleRenameStart = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setRenamingId(sessionId);
      setRenameValue(session.title);
    }
    setContextMenu(null);
  }, [sessions]);

  const handleRenameSubmit = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      const updated = sessions.map((s) =>
        s.id === renamingId ? { ...s, title: renameValue.trim() } : s
      );
      onUpdateSessions(updated);
    }
    setRenamingId(null);
  }, [renamingId, renameValue, sessions, onUpdateSessions]);

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sessionId });
  };

  const handleDotsClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.right + 4, y: rect.top, sessionId });
  };

  const contextSession = contextMenu ? sessions.find((s) => s.id === contextMenu.sessionId) : null;

  const navItems: { id: AppView | "new"; icon: typeof Plus; label: string; action: () => void }[] = [
    { id: "new", icon: Plus, label: "New chat", action: onNewChat },
    { id: "chats", icon: MessageSquare, label: "Chats", action: () => onNavigate("chats") },
    { id: "artifacts", icon: Layers, label: "Artifacts", action: () => onNavigate("artifacts") },
  ];

  return (
    <div className="sidebar-animate flex flex-col" style={{ width: collapsed ? 48 : 240, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center px-3 h-[52px] shrink-0" style={{ justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight font-display">PDGuru</span>
        )}
        <div className="flex items-center gap-0.5">
          {!collapsed && (
            <button onClick={onOpenSearch} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              <Search size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          )}
          <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <PanelLeft size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
        </div>
      </div>

      {/* Nav items */}
      {!collapsed && (
        <div className="px-2 mb-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.id !== "new" && activeView === item.id;
            return (
              <button key={item.id} onClick={item.action}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors"
                style={{
                  background: isActive ? "var(--surface-hover)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-hover)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <item.icon size={16} strokeWidth={2} style={{ color: isActive ? "var(--text)" : "var(--icon)" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-1 px-1 mt-1">
          <button onClick={onNewChat} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="New chat">
            <Plus size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
          <button onClick={() => { onToggleCollapse(); setTimeout(onOpenSearch, 250); }} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Search">
            <Search size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
          <button onClick={() => onNavigate("chats")} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Chats"
            style={activeView === "chats" ? { background: "var(--surface-hover)" } : undefined}>
            <MessageSquare size={14} strokeWidth={2} style={{ color: activeView === "chats" ? "var(--text)" : "var(--icon)" }} />
          </button>
          <button onClick={() => onNavigate("artifacts")} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors" title="Artifacts"
            style={activeView === "artifacts" ? { background: "var(--surface-hover)" } : undefined}>
            <Layers size={14} strokeWidth={2} style={{ color: activeView === "artifacts" ? "var(--text)" : "var(--icon)" }} />
          </button>
        </div>
      )}

      {/* Sessions list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 mt-1">
          {pinned.length > 0 && (
            <>
              <div className="px-2 pt-2 pb-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Pinned</div>
              {pinned.map((s) => (
                <SessionItem key={s.id} session={s}
                  active={activeView === "chat" && s.id === activeSessionId}
                  renaming={renamingId === s.id} renameValue={renameValue}
                  onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit}
                  renameRef={renamingId === s.id ? renameRef : undefined}
                  onClick={() => onSelectSession(s.id)}
                  onContextMenu={(e) => handleContextMenu(e, s.id)}
                  onDotsClick={(e) => handleDotsClick(e, s.id)} />
              ))}
            </>
          )}
          {unpinned.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Recents</div>
              {unpinned.map((s) => (
                <SessionItem key={s.id} session={s}
                  active={activeView === "chat" && s.id === activeSessionId}
                  renaming={renamingId === s.id} renameValue={renameValue}
                  onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit}
                  renameRef={renamingId === s.id ? renameRef : undefined}
                  onClick={() => onSelectSession(s.id)}
                  onContextMenu={(e) => handleContextMenu(e, s.id)}
                  onDotsClick={(e) => handleDotsClick(e, s.id)} />
              ))}
            </>
          )}
        </div>
      )}

      {collapsed && <div className="flex-1" />}

      {/* User footer */}
      <div className="px-2 pt-1 mt-auto pb-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <button onClick={onToggleDarkMode} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              {darkMode ? <Sun size={14} strokeWidth={2} style={{ color: "var(--icon)" }} /> : <Moon size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />}
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold cursor-pointer" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
              onClick={onLogout} title="Logout">
              {initials}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium truncate">{username}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggleDarkMode(); }} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors opacity-0 group-hover:opacity-100">
              {darkMode ? <Sun size={12} strokeWidth={2} style={{ color: "var(--icon)" }} /> : <Moon size={12} strokeWidth={2} style={{ color: "var(--icon)" }} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors opacity-0 group-hover:opacity-100" title="Logout">
              <LogOut size={12} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && contextSession && (
        <div ref={menuRef} className="fixed z-50 rounded-xl py-1 shadow-xl animate-pop-in min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          {[
            { icon: Pencil, label: "Rename", action: () => handleRenameStart(contextMenu.sessionId) },
            { icon: contextSession.pinned ? PinOff : Pin, label: contextSession.pinned ? "Unpin" : "Pin", action: () => handlePin(contextMenu.sessionId) },
            { icon: Trash2, label: "Delete", action: () => handleDelete(contextMenu.sessionId), danger: true },
          ].map((item) => (
            <button key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-[var(--surface-hover)] transition-colors"
              style={{ color: item.danger ? "var(--error)" : "var(--text-secondary)" }}
            >
              <item.icon size={12} strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionItem({ session, active, renaming, renameValue, onRenameChange, onRenameSubmit, renameRef, onClick, onContextMenu, onDotsClick }: {
  session: ChatSession; active: boolean;
  renaming: boolean; renameValue: string;
  onRenameChange: (v: string) => void; onRenameSubmit: () => void;
  renameRef?: React.RefObject<HTMLInputElement | null>;
  onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
  onDotsClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div onClick={onClick} onContextMenu={onContextMenu}
      className="w-full text-left px-2 py-1.5 rounded-lg transition-all group relative cursor-pointer hover:bg-[var(--surface-hover)]"
      style={active ? { background: "var(--surface-hover)" } : undefined}
    >
      {renaming ? (
        <div className="flex items-center gap-1">
          <input ref={renameRef} value={renameValue} onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onRenameSubmit(); if (e.key === "Escape") onRenameSubmit(); }}
            onBlur={onRenameSubmit}
            className="flex-1 text-[12px] bg-transparent outline-none px-1 py-0.5 rounded"
            style={{ border: "1px solid var(--accent)" }}
          />
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-[12px] truncate flex-1 pr-6" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
            {session.title}
          </span>
          <button onClick={onDotsClick}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[rgba(255,255,255,0.1)]"
            style={{ color: "var(--icon)" }}
          >
            <MoreVertical size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

export function SpotlightSearch({ sessions, onSelect, onClose }: {
  sessions: ChatSession[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      onSelect(filtered[selectedIndex].id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-[560px] max-h-[420px] flex flex-col rounded-2xl shadow-2xl animate-spotlight overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Search size={16} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search chats and projects"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--text-muted)]" />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <X size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map((s, i) => (
            <button key={s.id}
              onClick={() => { onSelect(s.id); onClose(); }}
              onMouseEnter={() => setSelectedIndex(i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{ background: i === selectedIndex ? "var(--surface-hover)" : "transparent" }}>
              <MessageSquare size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              <span className="text-[13px] flex-1 truncate" style={{ color: "var(--text)" }}>{s.title}</span>
              {i === selectedIndex && (
                <CornerDownLeft size={12} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[13px]" style={{ color: "var(--text-muted)" }}>No results</div>
          )}
        </div>
      </div>
    </div>
  );
}
