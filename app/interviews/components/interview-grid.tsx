"use client";

import { CheckCircle2, CircleDashed, Calendar, Bot, Library, FileText, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAppSelector } from "../../../lib/store/hooks";
import { RunLiveTracker } from "../../../lib/store/RunLiveTracker";


type RunWithRelations = {
    id: string;
    status: string;
    score: number | null;
    timestamp: Date;
    agent: { name: string; agentId: string } | null;
    template: { name: string; id: string } | null;
};

interface InterviewGridProps {
    runs: RunWithRelations[];
}

export function InterviewGrid({ runs }: InterviewGridProps) {
    if (runs.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#2a364d] rounded-2xl bg-[#151b27]/30">
                <div className="w-20 h-20 bg-[#1b253c]/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Activity className="text-indigo-400/50" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Interviews Yet</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
                    Your platform hasn't hosted any agent interviews yet. Generate an invite from a Template and have an AI agent register to get started!
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/templates"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-medium transition-all shadow-md shadow-indigo-900/20 text-sm tracking-wide"
                    >
                        Go to Templates
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#151b27] border border-[#2a364d] rounded-xl overflow-hidden shadow-lg shadow-black/20">
            <RunLiveTracker runIds={runs.map(r => r.id)} />
            {/* Table Header */}

            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#2a364d] bg-[#1b253c]/50 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <div className="col-span-4">Evaluation Info</div>
                <div className="col-span-3">Agent</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1 text-right">Details</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#2a364d]">
                {runs.map((baseRun) => {
                    const liveState = useAppSelector(state => state.runs.runs[baseRun.id]);
                    const run = { ...baseRun, status: liveState?.status ?? baseRun.status, score: liveState?.score ?? baseRun.score };
                    return (
                        <div key={run.id} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-[#1b253c]/40 transition-colors group items-center">
                            {/* Area 1: Evaluation */}

                            <div className="col-span-4 flex items-start flex-col gap-1">
                                <div className="flex items-center gap-2 text-white font-medium group-hover:text-indigo-400 transition-colors">
                                    <Library size={16} className="text-slate-500" />
                                    {run.template?.name || "Unknown Template"}
                                </div>
                                <span className="text-xs text-slate-500 font-mono tracking-wide">
                                    ID: {run.id.split('-')[0]}...
                                </span>
                            </div>

                            {/* Area 2: Agent */}
                            <div className="col-span-3 flex items-start flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-300 font-medium">
                                    <Bot size={16} className="text-slate-500" />
                                    {run.agent?.name || "Unknown Agent"}
                                </div>
                                <span className="text-xs text-slate-500 font-mono tracking-wide">
                                    P-ID: {run.agent?.agentId.split('-')[0]}...
                                </span>
                            </div>

                            {/* Area 3: Status / Score */}
                            <div className="col-span-2 flex flex-col justify-center items-start">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-1 ${run.status === 'completed'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                    {run.status === 'completed' ? <CheckCircle2 size={12} /> : <CircleDashed size={12} className="animate-spin-slow" />}
                                    <span className="capitalize">{run.status}</span>
                                </div>
                                {run.score !== null && (
                                    <span className="text-xs text-slate-400 font-medium ml-1">Score: {run.score}%</span>
                                )}
                            </div>

                            {/* Area 4: Date */}
                            <div className="col-span-2 flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar size={14} />
                                {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                            </div>

                            {/* Area 5: Actions */}
                            <div className="col-span-1 flex justify-end">
                                <Link
                                    href={`/interviews/${run.id}`}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                                    title="View Details"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
