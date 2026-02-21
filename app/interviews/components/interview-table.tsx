"use client";

import { CheckCircle2, CircleDashed, Bot, Library, ChevronRight, Activity, Calendar, XCircle, Lock, MoreHorizontal, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type RunSummary = {
    id: string;
    status: string;
    score: number | null;
    timestamp: Date | string;
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

export function InterviewTable({ runs }: Props) {
    return (
        <div className="w-full h-full overflow-hidden flex flex-col bg-[#0d121c]">
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10 bg-[#0d121c]/95 backdrop-blur-sm border-b border-[#1f2937]">
                        <tr>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Score</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-32">Status</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40">Date</th>
                            <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2937]/50">
                        {runs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-600 text-sm italic">
                                    No interview sessions found.
                                </td>
                            </tr>
                        ) : (
                            runs.map((run) => {
                                const statusCls = getStatusStyle(run.status);
                                const scoreCls = getScoreColor(run.score);

                                return (
                                    <tr key={run.id} className="group hover:bg-[#151b27]/80 transition-colors">
                                        {/* Score */}
                                        <td className="px-6 py-4">
                                            <div className={`size-10 rounded-full border-2 flex items-center justify-center font-black text-sm
                                                ${run.score !== null
                                                    ? `border-current ${scoreCls}`
                                                    : 'border-[#2a364d] text-slate-600'}`}>
                                                {run.score !== null ? run.score : '—'}
                                            </div>
                                        </td>

                                        {/* Agent */}
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                    {run.agent?.name ?? 'Unknown Agent'}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-600 mt-1 uppercase">
                                                    ID: {run.agent?.agentId?.slice(0, 18) ?? '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Template */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                                <Library size={12} className="text-indigo-400/70" />
                                                <span className="truncate max-w-[180px]">
                                                    {run.template?.name ?? 'Unknown Template'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide shadow-sm ${statusCls}`}>
                                                    {run.status === 'pass' || run.status === 'completed'
                                                        ? <CheckCircle2 size={10} />
                                                        : run.status === 'fail'
                                                            ? <XCircle size={10} />
                                                            : <CircleDashed size={10} className="animate-pulse" />}
                                                    {run.status}
                                                </span>
                                                {run.isLocked && (
                                                    <Lock size={11} className="text-amber-500/50" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                                <Calendar size={12} className="text-slate-600" />
                                                {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/interviews/${run.id}`}
                                                className="inline-flex size-8 items-center justify-center rounded-lg border border-[#1f2937] bg-[#1a2332] text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all shadow-sm group/btn"
                                            >
                                                <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
