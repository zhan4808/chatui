export type ToolType = "fc" | "sdc" | "redhawk" | "star-rc" | "icv" | "pt" | "dc";
export type BridgeHealth = "connected" | "degraded" | "disconnected" | "not-attached";

export type ToolSession = {
  id: string;
  tool: ToolType;
  name: string;
  design: string;
  node: string;
  status: "active" | "idle" | "batch" | "stale";
  pid: number;
  uptime: string;
  attached: boolean;
  user: string;
};

export type ToolCall = {
  id: string;
  timestamp: string;
  tool: string;
  input: string;
  output: string;
  duration: string;
};

export type Artifact = {
  id: string;
  type: "chart" | "table" | "terminal" | "code" | "image";
  title: string;
  data: Record<string, unknown>;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fcCommand?: { command: string; output: string; duration: string };
  artifact?: Artifact;
  citations?: string[];
  isStreaming?: boolean;
  isEdited?: boolean;
};

export type MemoryDoc = {
  id: string;
  title: string;
  type: "methodology" | "run-context" | "user-pref" | "project";
  summary: string;
  lastUsed: string;
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  pinned?: boolean;
};

export const toolLabels: Record<ToolType, { label: string; short: string; color: string }> = {
  fc: { label: "Fusion Compiler", short: "FC", color: "#a78bfa" },
  sdc: { label: "SDC Constraints", short: "SDC", color: "#22d3ee" },
  redhawk: { label: "RedHawk-SC", short: "RH", color: "#f87171" },
  "star-rc": { label: "StarRC", short: "SRC", color: "#fbbf24" },
  icv: { label: "IC Validator", short: "ICV", color: "#4ade80" },
  pt: { label: "PrimeTime", short: "PT", color: "#60a5fa" },
  dc: { label: "Design Compiler", short: "DC", color: "#f472b6" },
};

export const mockSessions: ChatSession[] = [
  { id: "s1", title: "Timing closure block_ctrl", timestamp: "2m", messageCount: 12, pinned: true },
  { id: "s2", title: "DRC violations top_chip", timestamp: "1h", messageCount: 8 },
  { id: "s3", title: "FC command syntax", timestamp: "3h", messageCount: 4 },
  { id: "s4", title: "Power analysis pmu_block", timestamp: "1d", messageCount: 22 },
  { id: "s5", title: "Clock tree optimization", timestamp: "1d", messageCount: 6 },
];

export const mockToolSessions: ToolSession[] = [
  { id: "ts-1", tool: "fc", name: "fc_shell.42190", design: "block_ctrl", node: "cn-17", status: "active", pid: 42190, uptime: "2h 14m", attached: true, user: "kkverma" },
  { id: "ts-2", tool: "fc", name: "fc_shell.38741", design: "top_chip", node: "cn-23", status: "idle", pid: 38741, uptime: "5h 02m", attached: false, user: "kkverma" },
  { id: "ts-3", tool: "redhawk", name: "rhsc.51002", design: "pmu_block", node: "cn-09", status: "active", pid: 51002, uptime: "1h 30m", attached: false, user: "kkverma" },
  { id: "ts-4", tool: "pt", name: "pt_shell.62010", design: "block_ctrl", node: "cn-17", status: "idle", pid: 62010, uptime: "3h 45m", attached: false, user: "kkverma" },
  { id: "ts-5", tool: "fc", name: "fc_shell.71234", design: "pmu_block", node: "cn-11", status: "batch", pid: 71234, uptime: "12h 30m", attached: false, user: "kkverma" },
];

export const mockMemoryDocs: MemoryDoc[] = [
  { id: "md1", title: "CTS methodology prefs", type: "methodology", summary: "Prefers useful skew optimization before buffer sizing. Target skew < 50ps.", lastUsed: "2m ago" },
  { id: "md2", title: "block_ctrl run context", type: "run-context", summary: "Current run r42, post-route opt iteration 3. 3 failing timing paths on clk_core.", lastUsed: "5m ago" },
  { id: "md3", title: "Report format prefs", type: "user-pref", summary: "Always show slack delta from previous iteration. Prefer table format.", lastUsed: "1h ago" },
  { id: "md4", title: "Tape-out constraints", type: "project", summary: "Tape-out target: July 15. No ECOs after July 1. Block-level freeze June 20.", lastUsed: "3h ago" },
];

export const mockToolCalls: ToolCall[] = [
  { id: "tc1", timestamp: "14:29", tool: "file_read", input: "reports/timing_opt3.rpt", output: "3 failing paths identified", duration: "0.4s" },
  { id: "tc2", timestamp: "14:29", tool: "file_read", input: "reports/timing_opt2.rpt", output: "Baseline comparison loaded", duration: "0.3s" },
  { id: "tc3", timestamp: "14:32", tool: "fc_command", input: "report_clock_timing -type skew -clock clk_core", output: "Skew: 0.087 ns", duration: "1.2s" },
  { id: "tc4", timestamp: "14:33", tool: "knowledge_lookup", input: "create_placement_blockage syntax", output: "FC command reference", duration: "0.2s" },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "I have 3 failing timing paths in block_ctrl after the last route optimization. Can you analyze what changed?",
    timestamp: "14:28",
  },
  {
    id: "m2",
    role: "assistant",
    content: `I found the timing report at \`reports/timing_opt3.rpt\` and compared it with the previous iteration.

**3 failing paths identified**, all through \`clk_core\`. The common factor is route optimization moved clock buffer \`CTS_BUF_12\`, adding ~0.1ns to the clock path.`,
    timestamp: "14:29",
    artifact: {
      id: "a1",
      type: "chart",
      title: "Slack by endpoint (ns)",
      data: {
        chartType: "bar",
        series: [
          { name: "state_reg[2]", value: -0.042, prev: 0.108 },
          { name: "state_reg[0]", value: -0.031, prev: 0.089 },
          { name: "wr_ptr[4]", value: -0.008, prev: 0.082 },
        ],
      },
    },
    citations: ["reports/timing_opt3.rpt", "reports/timing_opt2.rpt"],
  },
  {
    id: "m3",
    role: "user",
    content: "Run report_clock_timing on the live session to check current state",
    timestamp: "14:31",
  },
  {
    id: "m4",
    role: "assistant",
    content: `Clock skew for \`clk_core\` is **0.087 ns** — above your 0.05 ns target.`,
    timestamp: "14:32",
    fcCommand: {
      command: "report_clock_timing -type skew -clock clk_core",
      output: `Clock Skew:
  Longest Path:   0.892 ns (launch)
  Shortest Path:  0.805 ns (capture)
  Skew:           0.087 ns

  Worst Path:
    CTS_BUF_12 -> ctrl_fsm/state_reg[2]/CK
    Latency: 0.892 ns (3 buf, 1 inv)`,
      duration: "1.2s",
    },
    artifact: {
      id: "a2",
      type: "chart",
      title: "Clock skew trend (ns)",
      data: {
        chartType: "line",
        series: [
          { name: "opt1", value: 0.032 },
          { name: "opt2", value: 0.041 },
          { name: "opt3", value: 0.087 },
        ],
      },
    },
  },
  {
    id: "m5",
    role: "user",
    content: "What's the FC command to add a placement blockage for that buffer?",
    timestamp: "14:33",
  },
  {
    id: "m6",
    role: "assistant",
    content: `\`\`\`tcl
create_placement_blockage -name blk_cts12 \\
  -type hard -bbox {120.5 245.0 135.0 260.0}
\`\`\`

Set bbox around \`CTS_BUF_12\`'s original position from opt2. Use \`-type soft\` to discourage instead. Re-run with \`place_opt -incremental\` after.

Want me to execute this on the live session?`,
    timestamp: "14:33",
    citations: ["FC create_placement_blockage reference"],
  },
];
