"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, CircleDashed, Bot, Library, ChevronRight, Activity, Calendar, XCircle, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InterviewDetailPanel } from "./interview-detail-panel";

type RunSummary = {
    id: string;
    status: string;
    score: number | null;
    timestamp: Date;
    isLocked: boolean;
    agent: { name: string; agentId: string } | null;
    template: { name: string } | null;
};

interface Props {
    runs: RunSummary[];
}

function getStatusStyle(status: string) {
    if (status === 'pass' || status === 'completed') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'fail') return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
}

function getScoreColor(score: number | null) {
    if (score === null) return 'text-slate-500';
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
}

export function InterviewListPanel({ runs }: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(runs.length > 0 ? runs[0].id : null);

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* ── Left List Panel ──────────────────────────────────── */}
            <div className="w-80 shrink-0 flex flex-col border-r border-[#1f2937] bg-[#0d121c] overflow-hidden">
                {/* List header */}
                <div className="shrink-0 px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} className="text-indigo-400" />
                        {runs.length} Run{runs.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {runs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Activity size={28} className="text-slate-700 mb-3" />
                        <p className="text-slate-600 text-xs">No interview sessions yet.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-[#1f2937]">
                        {runs.map((run) => {
                            const isActive = selectedId === run.id;
                            const statusCls = getStatusStyle(run.status);
                            const scoreCls = getScoreColor(run.score);

                            return (
                                <button
                                    key={run.id}
                                    onClick={() => setSelectedId(run.id)}
                                    className={`w-full text-left px-4 py-4 flex items-start gap-3 transition-colors group
                                        ${isActive ? 'bg-[#1b253c]' : 'hover:bg-[#151b27]'}`}
                                >
                                    {/* Score circle */}
                                    <div className={`shrink-0 size-10 rounded-full border-2 flex items-center justify-center font-black text-sm mt-0.5
                                        ${run.score !== null
                                            ? `border-current ${scoreCls}`
                                            : 'border-[#2a364d] text-slate-600'}`}>
                                        {run.score !== null ? run.score : '—'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Agent name */}
                                        <div className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {run.agent?.name ?? 'Unknown Agent'}
                                        </div>
                                        {/* Template */}
                                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                                            <Library size={10} className="shrink-0" />
                                            {run.template?.name ?? 'Unknown Template'}
                                        </div>
                                        {/* Bottom row: status + date */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusCls}`}>
                                                {run.status === 'pass' || run.status === 'completed'
                                                    ? <CheckCircle2 size={9} />
                                                    : run.status === 'fail'
                                                        ? <XCircle size={9} />
                                                        : <CircleDashed size={9} />}
                                                {run.status}
                                            </span>
                                            {run.isLocked && (
                                                <Lock size={10} className="text-amber-500/60" />
                                            )}
                                            <span className="text-[10px] text-slate-600 ml-auto flex items-center gap-1">
                                                <Calendar size={9} />
                                                {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight size={14} className={`shrink-0 mt-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-700 group-hover:text-slate-500'}`} />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Right Detail Panel ───────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-[#0f131d] to-[#0d121c]">
                {selectedId ? (
                    <InterviewDetailPanel runId={selectedId} key={selectedId} />
                ) : (
                    <div className="flex flex-1 items-center justify-center text-slate-600 text-sm">
                        Select an interview from the list to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
