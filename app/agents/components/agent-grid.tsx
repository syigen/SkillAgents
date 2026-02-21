"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, Terminal, CalendarDays, Key, Settings2 } from "lucide-react";

export function AgentGrid({ initialAgents }: { initialAgents: any[] }) {
    const [agents, setAgents] = useState(initialAgents);

    if (agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#2a364d] rounded-xl bg-[#151b27]/50 mt-8">
                <div className="w-16 h-16 rounded-full bg-[#1b253c] flex items-center justify-center mb-4">
                    <Bot className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Agents Registered</h3>
                <p className="text-slate-400 text-center max-w-sm mb-6">
                    You haven't registered any agents yet. Agents will appear here once they authenticate using an invite token.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
            ))}
        </div>
    );
}

function AgentCard({ agent }: { agent: any }) {
    const timeAgo = formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true });

    // Parse tool access if it's a JSON string or already an array
    const toolAccess = Array.isArray(agent.toolAccess)
        ? agent.toolAccess
        : (typeof agent.toolAccess === 'string' ? JSON.parse(agent.toolAccess) : []);

    return (
        <div className="bg-[#151b27] border border-[#2a364d] rounded-xl overflow-hidden hover:border-[#3b4b6b] transition-colors relative group flex flex-col h-full">
            <div className="p-5 border-b border-[#1f2937]">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1b253c] flex items-center justify-center shrink-0 border border-[#2a364d]">
                            <Terminal className="text-[#3b82f6]" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">{agent.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e293b] text-slate-300">
                                    v{agent.version}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-400 font-mono text-[11px] truncate" title={agent.agentId}>
                    ID: {agent.agentId}
                </p>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 bg-[#0d1117]/50">
                {/* Tools Section */}
                <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Settings2 size={12} /> Tool Access
                    </div>
                    {toolAccess.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {toolAccess.map((tool: string, i: number) => (
                                <span key={i} className="text-xs bg-[#1f2937] text-slate-300 px-2 py-1 rounded-md border border-[#374151]">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 italic">No tools declared</div>
                    )}
                </div>

                {/* Meta details */}
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-[#1f2937]/50">
                    <div>
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                            <Key size={12} /> Client Request
                        </div>
                        <div className="text-sm tracking-wide text-slate-300 font-mono text-xs truncate" title={agent.clientRequestId}>
                            {agent.clientRequestId}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                            <CalendarDays size={12} /> Registered
                        </div>
                        <div className="text-xs text-slate-300">
                            {timeAgo}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
