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
      <div className="w-[360px] animate-fade-up">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-surface)", border: "1px solid var(--border)" }}>
            <Cpu size={20} color="var(--accent)" />
          </div>
          <span className="text-xl font-semibold tracking-tight">PDGuru</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. kkverma"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-[13px] outline-none transition-all focus:ring-1 focus:ring-[var(--accent-dim)] placeholder:text-[var(--text-muted)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
            style={{ background: "var(--accent)" }}
          >
            Continue <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center text-[10px] mt-6" style={{ color: "var(--text-muted)" }}>
          Sessions and history are scoped to your username
        </p>
      </div>
    </div>
  );
}
