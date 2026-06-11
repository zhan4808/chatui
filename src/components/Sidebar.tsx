"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, LogOut, Pin, Pencil, Trash2,
  MessageSquare, Sun, Moon, PanelLeft,
} from "lucide-react";
import { ChatSession } from "@/data/mock";

type ContextMenu = { x: number; y: number; sessionId: string } | null;

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  collapsed,
  onToggleCollapse,
  username,
  darkMode,
  onToggleDarkMode,
}: {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  username: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinned = filtered.filter((s) => s.pinned);
  const unpinned = filtered.filter((s) => !s.pinned);
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sessionId });
  };

  return (
    <div className="sidebar-animate flex flex-col py-2" style={{ width: collapsed ? 48 : 240, background: "var(--bg)", borderRight: "1px solid var(--border)" }}>
      {/* Top bar */}
      <div className="flex items-center px-2 mb-1" style={{ height: 36, justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] hover:bg-[var(--surface-hover)] transition-colors" style={{ color: "var(--text-muted)" }}>
            <Plus size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
            <span>New chat</span>
          </button>
        )}
        <div className="flex items-center gap-0.5" style={collapsed ? { flexDirection: "column", gap: 4 } : undefined}>
          {!collapsed && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Search size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
            </button>
          )}
          <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <PanelLeft size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
        </div>
      </div>

      {collapsed && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <Plus size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
          <button onClick={() => { onToggleCollapse(); setTimeout(() => setSearchOpen(true), 200); }} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            <Search size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />
          </button>
        </div>
      )}

      {/* Search */}
      {!collapsed && searchOpen && (
        <div className="px-2 mb-2 animate-fade-up">
          <input
            ref={searchRef}
            type="text" placeholder="Search chats..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg outline-none placeholder:text-[var(--text-muted)]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          />
        </div>
      )}

      {/* Sessions */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-1.5 space-y-px">
          {pinned.length > 0 && (
            <>
              <div className="px-2 pt-2 pb-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Pinned</div>
              {pinned.map((s) => (
                <SessionItem key={s.id} session={s} active={s.id === activeSessionId}
                  onClick={() => onSelectSession(s.id)} onContextMenu={(e) => handleContextMenu(e, s.id)} />
              ))}
            </>
          )}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <div className="px-2 pt-3 pb-1 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Recent</div>}
              {unpinned.map((s) => (
                <SessionItem key={s.id} session={s} active={s.id === activeSessionId}
                  onClick={() => onSelectSession(s.id)} onContextMenu={(e) => handleContextMenu(e, s.id)} />
              ))}
            </>
          )}
        </div>
      )}

      {collapsed && <div className="flex-1" />}

      {/* User footer */}
      <div className="px-1.5 pt-1 mt-auto">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <button onClick={onToggleDarkMode} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
              {darkMode ? <Sun size={14} strokeWidth={2} style={{ color: "var(--icon)" }} /> : <Moon size={14} strokeWidth={2} style={{ color: "var(--icon)" }} />}
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
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
            <LogOut size={12} style={{ color: "var(--icon)" }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div ref={menuRef} className="fixed z-50 rounded-xl py-1 shadow-xl animate-pop-in min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          {[
            { icon: Pencil, label: "Rename", action: () => {} },
            { icon: Pin, label: "Pin", action: () => {} },
            { icon: Trash2, label: "Delete", action: () => {}, danger: true },
          ].map((item) => (
            <button key={item.label}
              onClick={() => { item.action(); setContextMenu(null); }}
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

function SessionItem({ session, active, onClick, onContextMenu }: {
  session: ChatSession; active: boolean; onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <button onClick={onClick} onContextMenu={onContextMenu}
      className="w-full text-left px-2.5 py-1.5 rounded-lg transition-all group"
      style={active ? { background: "var(--surface-hover)" } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] truncate pr-2" style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}>
          {session.pinned && <Pin size={9} className="inline mr-1 -mt-px" style={{ color: "var(--text-muted)" }} />}
          {session.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{session.timestamp}</span>
        <span className="flex items-center gap-0.5 text-[9px]" style={{ color: "var(--text-muted)" }}>
          <MessageSquare size={8} strokeWidth={2} /> {session.messageCount}
        </span>
      </div>
    </button>
  );
}
