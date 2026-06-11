"use client";

import { Circle, Plug, ChevronDown, PanelRight } from "lucide-react";
import { BridgeHealth, ToolSession, toolLabels } from "@/data/mock";

export default function ContextBar({
  toolSession,
  bridgeHealth,
  onOpenSessionPicker,
  onToggleRightPanel,
  rightPanelOpen,
}: {
  toolSession?: ToolSession;
  bridgeHealth: BridgeHealth;
  onOpenSessionPicker: () => void;
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
}) {
  const healthColor = {
    connected: "var(--success)",
    degraded: "var(--warning)",
    disconnected: "var(--error)",
    "not-attached": "var(--text-muted)",
  }[bridgeHealth];

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        {toolSession ? (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-[var(--glass-hover)]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
          >
            <Circle size={6} fill={healthColor} color={healthColor} className={bridgeHealth === "connected" ? "animate-pulse-dot" : ""} />
            <span className="text-[10px] font-bold" style={{ color: toolLabels[toolSession.tool].color }}>
              {toolLabels[toolSession.tool].short}
            </span>
            <span className="text-[11px] font-medium">{toolSession.design}</span>
            <ChevronDown size={10} color="var(--text-muted)" />
          </button>
        ) : (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all hover:bg-[var(--glass-hover)]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}
          >
            <Plug size={11} /> Connect session
          </button>
        )}
      </div>
      <button
        onClick={onToggleRightPanel}
        className="p-1.5 rounded-lg transition-colors"
        style={{ background: rightPanelOpen ? "var(--accent-surface)" : "transparent", color: rightPanelOpen ? "var(--accent)" : "var(--text-muted)" }}
      >
        <PanelRight size={15} />
      </button>
    </div>
  );
}
