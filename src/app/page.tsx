"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import LoginScreen from "@/components/LoginScreen";
import Sidebar, { SpotlightSearch, type AppView } from "@/components/Sidebar";
import ContextBar from "@/components/ContextBar";
import ChatPanel from "@/components/ChatPanel";
import RightPanel from "@/components/RightPanel";
import ChatsPage from "@/components/ChatsPage";
import ArtifactsPage from "@/components/ArtifactsPage";
import SessionPicker from "@/components/SessionPicker";
import SideViewer, { type SideViewerContent } from "@/components/SideViewer";
import {
  mockSessions, mockToolSessions, mockMessages, mockSessionMessages, mockMemoryDocs, mockSkillDocs,
  type Message, type BridgeHealth, type Artifact, type ChatSession,
} from "@/data/mock";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("chat");
  const [activeSessionId, setActiveSessionId] = useState("s1");
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [bridgeHealth] = useState<BridgeHealth>("connected");
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [showSpotlightSearch, setShowSpotlightSearch] = useState(false);
  const [sideViewerContent, setSideViewerContent] = useState<SideViewerContent | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const sessionMessagesRef = useRef<Record<string, Message[]>>({
    s1: mockMessages,
    ...mockSessionMessages,
  });
  const streamingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSpotlightSearch((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    sessionMessagesRef.current[activeSessionId] = messages;
  }, [messages, activeSessionId]);

  const attachedSession = mockToolSessions.find((s) => s.attached);
  const artifacts = messages.filter((m) => m.artifact).map((m) => m.artifact!);
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleSendMessage = useCallback((content: string) => {
    if (isStreaming) { setQueuedMessages((p) => [...p, content]); return; }
    const userMsg: Message = {
      id: `m${Date.now()}`, role: "user", content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    setMessages((p) => [...p, userMsg]);
    setIsStreaming(true);
    streamingTimerRef.current = setTimeout(() => {
      setMessages((p) => [...p, {
        id: `m${Date.now() + 1}`, role: "assistant",
        content: "Analyzing your request. I'll pull the relevant data and get back to you.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        thinkingSteps: [
          { id: `ts${Date.now()}`, type: "file_read", label: "Reading context files", detail: "4 files loaded", duration: "0.3s", status: "done" as const },
          { id: `ts${Date.now() + 1}`, type: "reasoning", label: "Processing query", detail: "Analysis complete", duration: "1.2s", status: "done" as const },
        ],
      }]);
      setIsStreaming(false);
      streamingTimerRef.current = null;
    }, 2000);
  }, [isStreaming]);

  const handleStopStreaming = useCallback(() => {
    if (streamingTimerRef.current) {
      clearTimeout(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((p) => [...p, {
      id: `m${Date.now()}`, role: "assistant",
      content: "*Response stopped by user.*",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    }]);
  }, []);

  const handleDownloadChat = useCallback(() => {
    const lines = messages.map((m) => {
      const role = m.role === "user" ? "**You**" : "**PDGuru**";
      let text = `${role} (${m.timestamp}):\n${m.content}`;
      if (m.fcCommand) text += `\n\n\`\`\`\n$ ${m.fcCommand.command}\n${m.fcCommand.output}\n\`\`\``;
      if (m.citations?.length) text += `\n\nSources: ${m.citations.join(", ")}`;
      return text;
    });
    const md = `# Chat: ${sessions.find((s) => s.id === activeSessionId)?.title || "Untitled"}\n\n${lines.join("\n\n---\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pdguru-chat-${activeSessionId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, sessions, activeSessionId]);

  const handleEditMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), { ...prev[idx], content, isEdited: true }];
    });
    setIsStreaming(true);
    streamingTimerRef.current = setTimeout(() => {
      setMessages((p) => [...p, {
        id: `m${Date.now()}`, role: "assistant",
        content: "Reprocessing with updated context...",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }]);
      setIsStreaming(false);
      streamingTimerRef.current = null;
    }, 1500);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    sessionMessagesRef.current[activeSessionId] = messages;
    const sessionMsgs = sessionMessagesRef.current[id] || [];
    setMessages(sessionMsgs);
    setActiveSessionId(id);
    setActiveView("chat");
    setSideViewerContent(null);
  }, [activeSessionId, messages]);

  const handleSelectFromSearch = useCallback((id: string) => {
    handleSelectSession(id);
    setShowSpotlightSearch(false);
  }, [handleSelectSession]);

  const handleNewChat = useCallback(() => {
    sessionMessagesRef.current[activeSessionId] = messages;
    const newId = `s${Date.now()}`;
    const newSession: ChatSession = {
      id: newId, title: "New chat", timestamp: "now", messageCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveView("chat");
    setMessages([]);
  }, [activeSessionId, messages]);

  const handleNavigate = useCallback((view: AppView) => {
    setActiveView(view);
    setSideViewerContent(null);
  }, []);

  const handleLogout = useCallback(() => {
    setUsername(null);
    setActiveView("chat");
    setActiveSessionId("s1");
    setSessions(mockSessions);
    setMessages(mockMessages);
    setRightPanelOpen(false);
    setShowSpotlightSearch(false);
    setSideViewerContent(null);
    sessionMessagesRef.current = { s1: mockMessages, ...mockSessionMessages };
  }, []);

  const handleOpenArtifact = useCallback((artifact: Artifact) => {
    setSideViewerContent({ kind: "artifact", artifact });
    setRightPanelOpen(false);
  }, []);

  const handleOpenViewer = useCallback((content: SideViewerContent) => {
    setSideViewerContent(content);
    setRightPanelOpen(false);
  }, []);

  const handleViewerBack = useCallback(() => {
    setSideViewerContent(null);
    setRightPanelOpen(true);
  }, []);

  const handleViewerClose = useCallback(() => {
    setSideViewerContent(null);
  }, []);

  const handleUpdateSession = useCallback((updated: ChatSession) => {
    setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (id === activeSessionId && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(sessionMessagesRef.current[filtered[0].id] || []);
      }
      return filtered;
    });
  }, [activeSessionId]);

  if (!username) return <LoginScreen onLogin={setUsername} />;

  return (
    <div className="h-screen flex" style={{ background: "var(--bg)" }}>
      <Sidebar
        sessions={sessions} activeSessionId={activeSessionId}
        activeView={activeView}
        onSelectSession={handleSelectSession}
        onNavigate={handleNavigate}
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        username={username} darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onUpdateSessions={setSessions}
        onOpenSearch={() => setShowSpotlightSearch(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex min-w-0 min-h-0 relative">
        {/* Main content column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {activeView === "chat" && (
            <ContextBar
              toolSession={attachedSession} bridgeHealth={bridgeHealth}
              onOpenSessionPicker={() => setShowSessionPicker(true)}
              onToggleRightPanel={() => {
                if (sideViewerContent) {
                  setSideViewerContent(null);
                  setRightPanelOpen(false);
                } else {
                  setRightPanelOpen(!rightPanelOpen);
                }
              }}
              rightPanelOpen={rightPanelOpen || !!sideViewerContent}
              activeSession={activeSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
              onDownloadChat={handleDownloadChat}
              hasMessages={messages.length > 0}
              sideViewerOpen={!!sideViewerContent}
            />
          )}

          <div className="flex-1 flex min-h-0">
            {activeView === "chat" && (
              <>
                <ChatPanel
                  messages={messages} onSendMessage={handleSendMessage}
                  onEditMessage={handleEditMessage} queuedMessages={queuedMessages}
                  onClearQueue={() => setQueuedMessages([])} isStreaming={isStreaming}
                  onOpenArtifact={handleOpenArtifact}
                  onStopStreaming={handleStopStreaming}
                  onDownloadChat={handleDownloadChat}
                />
                {rightPanelOpen && !sideViewerContent && (
                  <RightPanel memoryDocs={mockMemoryDocs} skillDocs={mockSkillDocs} artifacts={artifacts} onOpenViewer={handleOpenViewer} />
                )}
              </>
            )}

            {activeView === "chats" && (
              <ChatsPage sessions={sessions} onSelectChat={handleSelectSession} />
            )}

            {activeView === "artifacts" && (
              <ArtifactsPage artifacts={artifacts} onOpenArtifact={handleOpenArtifact} />
            )}
          </div>
        </div>

        {/* SideViewer - full height, overlays the context bar */}
        {sideViewerContent && (
          <SideViewer content={sideViewerContent} onClose={handleViewerClose} onBack={handleViewerBack} />
        )}
      </div>

      {showSessionPicker && (
        <SessionPicker sessions={mockToolSessions} username={username}
          onAttach={(id) => { console.log("Attach", id); setShowSessionPicker(false); }}
          onClose={() => setShowSessionPicker(false)} />
      )}

      {showSpotlightSearch && (
        <SpotlightSearch sessions={sessions} onSelect={handleSelectFromSearch} onClose={() => setShowSpotlightSearch(false)} />
      )}
    </div>
  );
}
