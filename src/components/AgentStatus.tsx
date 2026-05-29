import React from 'react';
import { Agent } from '../lib/agents';

export default function AgentStatus({ agent }: { agent: Agent }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg bg-slate-900/60 border border-white/5 backdrop-blur-md">
      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      <div className="text-xs font-bold text-slate-300">
        Active Node: <span className="text-blue-400 font-extrabold uppercase tracking-wide">{agent.name}</span>
      </div>
    </div>
  );
}
