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

export type ThinkingStep = {
  id: string;
  type: "skill" | "knowledge" | "command" | "reasoning" | "file_read";
  label: string;
  detail?: string;
  duration?: string;
  status: "running" | "done" | "error";
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fcCommand?: { command: string; output: string; duration: string };
  artifact?: Artifact;
  citations?: string[];
  thinkingSteps?: ThinkingStep[];
  isStreaming?: boolean;
  isEdited?: boolean;
};

export type FileType = "markdown" | "tcl" | "log" | "csv" | "python" | "verilog" | "sdc" | "text" | "json";

export type MemoryDoc = {
  id: string;
  title: string;
  type: "methodology" | "run-context" | "user-pref" | "project";
  summary: string;
  content: string;
  fileType: FileType;
  fileName: string;
  lastUsed: string;
};

export type SkillDoc = {
  id: string;
  title: string;
  type: "skill" | "knowledge";
  source: string;
  summary: string;
  content: string;
  fileType: FileType;
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  pinned?: boolean;
  messages?: Message[];
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

export const mockSessionMessages: Record<string, Message[]> = {
  s1: [], // will be filled with mockMessages at runtime
  s2: [
    { id: "s2m1", role: "user", content: "Run DRC on top_chip — I need a summary of all violations by category.", timestamp: "10:15" },
    { id: "s2m2", role: "assistant", content: "Running DRC check on `top_chip`...\n\n**47 violations found** across 4 categories:\n- **Metal spacing:** 22 violations (M4, M5)\n- **Via enclosure:** 14 violations\n- **Min width:** 8 violations (M3)\n- **Antenna:** 3 violations\n\nMetal spacing on M4/M5 accounts for most issues — likely caused by the recent route_opt run.", timestamp: "10:16",
      thinkingSteps: [
        { id: "s2ts1", type: "command", label: "Running verify_drc on fc_shell", detail: "47 violations found", duration: "3.2s", status: "done" },
        { id: "s2ts2", type: "reasoning", label: "Categorizing violations", detail: "4 categories identified", duration: "0.5s", status: "done" },
      ],
    },
    { id: "s2m3", role: "user", content: "Can you fix the metal spacing ones automatically?", timestamp: "10:18" },
    { id: "s2m4", role: "assistant", content: "I can run incremental route optimization targeting the M4/M5 spacing violations:\n\n```tcl\nroute_opt -incremental -effort high\n```\n\nThis should resolve most of the 22 spacing violations. Want me to execute?", timestamp: "10:18" },
  ],
  s3: [
    { id: "s3m1", role: "user", content: "What's the syntax for report_timing with multiple path groups?", timestamp: "08:30" },
    { id: "s3m2", role: "assistant", content: "```tcl\nreport_timing -path_group {clk_core clk_io} \\\n  -max_paths 10 -path_type full_clock\n```\n\nYou can specify multiple path groups in curly braces. Add `-sort_by slack` to sort by worst slack first.", timestamp: "08:30",
      thinkingSteps: [
        { id: "s3ts1", type: "knowledge", label: "Loaded knowledge/fc_commands.json", detail: "report_timing reference", duration: "0.1s", status: "done" },
      ],
    },
  ],
  s4: [
    { id: "s4m1", role: "user", content: "Analyze power consumption for pmu_block. I need static and dynamic breakdown.", timestamp: "Yesterday" },
    { id: "s4m2", role: "assistant", content: "Running power analysis on `pmu_block`...\n\n**Total Power: 12.4 mW**\n- **Dynamic:** 8.1 mW (65%)\n  - Switching: 5.2 mW\n  - Internal: 2.9 mW\n- **Leakage:** 4.3 mW (35%)\n\nThe switching power is dominated by the clock network (62% of dynamic). Consider clock gating on idle blocks.", timestamp: "Yesterday",
      thinkingSteps: [
        { id: "s4ts1", type: "command", label: "Running report_power on rhsc.51002", detail: "Total: 12.4 mW", duration: "4.5s", status: "done" },
        { id: "s4ts2", type: "skill", label: "Using skills/power_analysis.md", detail: "Power breakdown methodology", duration: "0.2s", status: "done" },
      ],
    },
  ],
  s5: [
    { id: "s5m1", role: "user", content: "The clock tree for clk_io has too many levels. Can we optimize?", timestamp: "Yesterday" },
    { id: "s5m2", role: "assistant", content: "Current `clk_io` tree has **7 buffer levels** — that's high for this frequency. Recommended approach:\n\n```tcl\nset_app_options -name cts.compile.max_fanout -value 32\nclock_opt -from build_clock -to route_clock\n```\n\nIncreasing max fanout reduces buffer levels at the cost of slightly higher skew. Your current skew budget of 0.08ns should accommodate this.", timestamp: "Yesterday" },
  ],
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
  { id: "md1", title: "cts_opt.tcl", type: "methodology", fileName: "cts_opt.tcl", fileType: "tcl", summary: "CTS optimization script with useful skew.", content: `# CTS Optimization Script — block_ctrl
# Owner: kkverma | Last modified: 2026-06-08

set_app_options -name cts.compile.enable_local_skew -value true
set_app_options -name cts.optimize.enable_buffer_sizing -value false

# Target skew constraint
set TARGET_SKEW 0.050

# NDR rules for clock nets
create_routing_rule cts_ndr_rule \\
  -widths  {M4 0.1 M5 0.1 M6 0.1} \\
  -spacings {M4 0.1 M5 0.1 M6 0.1}

set_clock_routing_rules -rules cts_ndr_rule \\
  -min_routing_layer M4 -max_routing_layer M6

# Run CTS
clock_opt -from build_clock -to route_clock

# Check results
report_clock_timing -type skew -clock clk_core
report_clock_timing -type latency -clock clk_core`, lastUsed: "2m ago" },
  { id: "md2", title: "timing_opt3.rpt", type: "run-context", fileName: "timing_opt3.rpt", fileType: "log", summary: "Timing report — 3 failing paths on clk_core.", content: `****************************************
Report : timing
Design : block_ctrl
Version: FC-2026.06
Date   : Wed Jun 11 14:29:03 2026
****************************************

  Startpoint: ctrl_fsm/state_reg[2]
  Endpoint:   data_out_reg[7]
  Path Group: clk_core
  Path Type:  max

  Point                          Incr      Path
  ---------------------------------------------------
  clock clk_core (rise edge)     0.000     0.000
  CTS_BUF_12/Z (BUFX4)          0.892     0.892
  ctrl_fsm/state_reg[2]/CK       0.034     0.926
  ctrl_fsm/state_reg[2]/Q        0.118     1.044
  U234/Z (NAND2X1)               0.045     1.089
  data_out_reg[7]/D              0.012     1.101

  data required time                       1.059
  data arrival time                        1.101
  ---------------------------------------------------
  slack (VIOLATED)                        -0.042

  3 paths with negative slack found.`, lastUsed: "5m ago" },
  { id: "md3", title: "user_prefs.json", type: "user-pref", fileName: "user_prefs.json", fileType: "json", summary: "Report format and display preferences.", content: `{
  "report_format": {
    "show_slack_delta": true,
    "format": "table",
    "include_path_group": true,
    "color_coding": {
      "negative_slack": "red",
      "positive_slack": "green"
    },
    "default_paths": 10
  },
  "display": {
    "chart_type": "bar",
    "show_previous_iteration": true,
    "compact_mode": false
  },
  "notifications": {
    "slack_threshold": -0.01,
    "alert_on_violation": true
  }
}`, lastUsed: "1h ago" },
  { id: "md4", title: "tapeout_schedule.md", type: "project", fileName: "tapeout_schedule.md", fileType: "markdown", summary: "Tape-out target: July 15. Block freeze June 20.", content: `## Tape-out Schedule

**Tape-out Date:** July 15, 2026
**ECO Freeze:** July 1, 2026
**Block-level Freeze:** June 20, 2026

### Critical Milestones
- All timing clean by June 18
- Final DRC/LVS sign-off by June 25
- Metal fill insertion: June 26-28
- Final GDS merge: July 10

### Sign-off Checklist
- [ ] Timing clean (setup + hold)
- [ ] DRC clean
- [ ] LVS clean
- [ ] ERC clean
- [ ] Antenna clean
- [ ] IR drop within budget`, lastUsed: "3h ago" },
];

export const mockSkillDocs: SkillDoc[] = [
  { id: "sk1", title: "FC Timing Analysis", type: "skill", source: "skills/fc_timing.md", fileType: "markdown", summary: "report_timing, report_clock_timing, check_timing commands and analysis workflows", content: `## FC Timing Analysis Skill

### Commands
- \`report_timing\` — Setup/hold timing reports
- \`report_clock_timing\` — Clock latency and skew
- \`check_timing\` — Constraint completeness check

### Workflows

**Setup Analysis:**
\`\`\`tcl
report_timing -max_paths 10 -path_type full_clock
\`\`\`

**Clock Skew Diagnosis:**
\`\`\`tcl
report_clock_timing -type skew -clock [all_clocks]
report_clock_timing -type latency -clock clk_core
\`\`\`

**Multi-corner Comparison:**
\`\`\`tcl
foreach scenario [all_scenarios] {
  current_scenario \$scenario
  report_timing -max_paths 5
}
\`\`\`` },
  { id: "sk2", title: "Placement Optimization", type: "skill", source: "skills/placement_opt.md", fileType: "markdown", summary: "place_opt, create_placement_blockage, legalize_placement commands", content: `## Placement Optimization Skill

### Commands
- \`place_opt\` — Run placement optimization
- \`create_placement_blockage\` — Define placement blockages
- \`legalize_placement\` — Legalize cell placement

### Usage Patterns

**Incremental placement after ECO:**
\`\`\`tcl
place_opt -incremental
legalize_placement
\`\`\`

**Blockage for sensitive cells:**
\`\`\`tcl
create_placement_blockage -name blk_name \\
  -type hard -bbox {x1 y1 x2 y2}
\`\`\`` },
  { id: "sk3", title: "FC Command Reference", type: "knowledge", source: "knowledge/fc_commands.json", fileType: "json", summary: "Complete FC shell command reference with syntax and examples", content: `{
  "version": "FC-2026.06",
  "total_commands": 1247,
  "last_updated": "2026-06-01",
  "categories": {
    "timing": ["report_timing", "report_clock_timing", "check_timing", "set_timing_derate"],
    "placement": ["place_opt", "create_placement_blockage", "legalize_placement"],
    "routing": ["route_opt", "route_auto", "create_routing_rule"],
    "cts": ["clock_opt", "set_clock_routing_rules", "report_clock_tree"],
    "power": ["report_power", "set_power_derate", "create_power_domain"],
    "drc": ["check_legality", "check_routes", "verify_drc"]
  }
}` },
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
    thinkingSteps: [
      { id: "ts1", type: "file_read", label: "Reading reports/timing_opt3.rpt", detail: "3 failing paths found", duration: "0.4s", status: "done" },
      { id: "ts2", type: "file_read", label: "Reading reports/timing_opt2.rpt", detail: "Baseline comparison loaded", duration: "0.3s", status: "done" },
      { id: "ts3", type: "reasoning", label: "Comparing timing iterations", detail: "Identified CTS_BUF_12 movement as root cause", duration: "1.1s", status: "done" },
    ],
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
    thinkingSteps: [
      { id: "ts4", type: "command", label: "Running report_clock_timing on fc_shell.42190", detail: "Skew: 0.087 ns", duration: "1.2s", status: "done" },
      { id: "ts5", type: "knowledge", label: "Loaded knowledge/fc_commands.json", detail: "Clock timing reference", duration: "0.1s", status: "done" },
    ],
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
    thinkingSteps: [
      { id: "ts6", type: "skill", label: "Using skills/placement_opt.md", detail: "Placement blockage syntax", duration: "0.2s", status: "done" },
      { id: "ts7", type: "knowledge", label: "Loaded knowledge/fc_commands.json", detail: "create_placement_blockage reference", duration: "0.2s", status: "done" },
    ],
    citations: ["FC create_placement_blockage reference"],
  },
];
