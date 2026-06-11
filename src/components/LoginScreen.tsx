"use client";

import { useState } from "react";
import { Cpu, ArrowRight } from "lucide-react";

export default function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-[340px] animate-fade-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--accent-surface)" }}>
            <Cpu size={18} strokeWidth={2} style={{ color: "var(--accent)" }} />
          </div>
          <span className="text-lg font-semibold tracking-tight">PDGuru</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. kkverma"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-muted)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all disabled:opacity-30 hover:brightness-110"
            style={{ background: "var(--accent)" }}
          >
            Continue <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-[10px] mt-5" style={{ color: "var(--text-muted)" }}>
          Sessions and history are scoped to your username
        </p>
      </div>
    </div>
  );
}
