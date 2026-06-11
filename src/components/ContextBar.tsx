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
    <div className="flex items-center justify-between px-3 py-1.5">
      <div className="flex items-center gap-2">
        {toolSession ? (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] transition-all hover:bg-[var(--surface-hover)]"
          >
            <Circle size={5} fill={healthColor} color={healthColor} className={bridgeHealth === "connected" ? "animate-pulse-dot" : ""} />
            <span className="font-semibold" style={{ color: toolLabels[toolSession.tool].color }}>
              {toolLabels[toolSession.tool].short}
            </span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{toolSession.design}</span>
            <ChevronDown size={10} style={{ color: "var(--icon)" }} />
          </button>
        ) : (
          <button onClick={onOpenSessionPicker}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all hover:bg-[var(--surface-hover)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Plug size={11} strokeWidth={2} /> Connect session
          </button>
        )}
      </div>
      <button
        onClick={onToggleRightPanel}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
      >
        <PanelRight size={15} strokeWidth={2} style={{ color: rightPanelOpen ? "var(--accent)" : "var(--icon)" }} />
      </button>
    </div>
  );
}
