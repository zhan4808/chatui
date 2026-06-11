"use client";

import { useState, useCallback, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import ContextBar from "@/components/ContextBar";
import ChatPanel from "@/components/ChatPanel";
import RightPanel from "@/components/RightPanel";
import SessionPicker from "@/components/SessionPicker";
import ArtifactViewer from "@/components/ArtifactViewer";
import {
  mockSessions, mockToolSessions, mockToolCalls, mockMessages, mockMemoryDocs,
  type Message, type BridgeHealth, type Artifact,
} from "@/data/mock";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("s1");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [bridgeHealth] = useState<BridgeHealth>("connected");
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const attachedSession = mockToolSessions.find((s) => s.attached);

  const artifacts = messages.filter((m) => m.artifact).map((m) => m.artifact!);

  const handleSendMessage = useCallback((content: string) => {
    if (isStreaming) { setQueuedMessages((p) => [...p, content]); return; }
    const userMsg: Message = {
      id: `m${Date.now()}`, role: "user", content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    setMessages((p) => [...p, userMsg]);
    setIsStreaming(true);
    setTimeout(() => {
      setMessages((p) => [...p, {
        id: `m${Date.now() + 1}`, role: "assistant",
        content: "Analyzing your request. I'll pull the relevant data and get back to you.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }]);
      setIsStreaming(false);
    }, 2000);
  }, [isStreaming]);

  const handleEditMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), { ...prev[idx], content, isEdited: true }];
    });
    setIsStreaming(true);
    setTimeout(() => {
      setMessages((p) => [...p, {
        id: `m${Date.now()}`, role: "assistant",
        content: "Reprocessing with updated context...",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      }]);
      setIsStreaming(false);
    }, 1500);
  }, []);

  if (!username) return <LoginScreen onLogin={setUsername} />;

  return (
    <div className="h-screen flex" style={{ background: "var(--bg)" }}>
      <Sidebar
        sessions={mockSessions} activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId} collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        username={username} darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <ContextBar
          toolSession={attachedSession} bridgeHealth={bridgeHealth}
          onOpenSessionPicker={() => setShowSessionPicker(true)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          rightPanelOpen={rightPanelOpen}
        />

        <div className="flex-1 flex min-h-0">
          <ChatPanel
            messages={messages} onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage} queuedMessages={queuedMessages}
            onClearQueue={() => setQueuedMessages([])} isStreaming={isStreaming}
            onOpenArtifact={setActiveArtifact}
          />
          {rightPanelOpen && (
            <RightPanel memoryDocs={mockMemoryDocs} toolCalls={mockToolCalls} artifacts={artifacts} />
          )}
        </div>
      </div>

      {showSessionPicker && (
        <SessionPicker sessions={mockToolSessions} username={username}
          onAttach={(id) => { console.log("Attach", id); setShowSessionPicker(false); }}
          onClose={() => setShowSessionPicker(false)} />
      )}

      {activeArtifact && (
        <ArtifactViewer artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />
      )}
    </div>
  );
}
