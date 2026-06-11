"use client";

import { useState, useCallback } from "react";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import ContextBar from "@/components/ContextBar";
import ChatPanel from "@/components/ChatPanel";
import RightPanel from "@/components/RightPanel";
import SessionPicker from "@/components/SessionPicker";
import ArtifactViewer from "@/components/ArtifactViewer";
import {
  mockSessions, mockToolSessions, mockToolCalls, mockMessages, mockMemoryDocs,
  type Message, type BridgeHealth, type Artifact, type MemoryDoc,
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
  const [memoryDocs, setMemoryDocs] = useState<MemoryDoc[]>(mockMemoryDocs);

  const attachedSession = mockToolSessions.find((s) => s.attached);

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
        content: "Analyzing your request. The routing layer determined this should use the knowledge base for a static lookup.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        route: "knowledge",
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
        route: "knowledge",
      }]);
      setIsStreaming(false);
    }, 1500);
  }, []);

  const handleToggleMemory = useCallback((id: string) => {
    setMemoryDocs((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
  }, []);

  if (!username) return <LoginScreen onLogin={setUsername} />;

  return (
    <div className="h-screen flex" style={{ background: "var(--bg)" }}>
      <Sidebar
        sessions={mockSessions} activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId} collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        username={username}
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
            <RightPanel memoryDocs={memoryDocs} toolCalls={mockToolCalls} onToggleMemory={handleToggleMemory} />
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
