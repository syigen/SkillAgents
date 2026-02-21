'use client';

import { Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAppSelector } from "@/lib/store/hooks";

export function RunScoreBox({
    runId,
    initialScore,
    evaluation,
    timestamp,
}: any) {
    const liveState = useAppSelector(state => state.runs.runs[runId]);
    const score = liveState?.score ?? initialScore;

    return (
        <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Activity size={14} className="text-indigo-400" /> Current Score
            </div>
            {evaluation ? (
                <>
                    <div className="flex items-end gap-1.5">
                        <span className={`text-3xl font-black leading-none ${evaluation.overall >= evaluation.pass_threshold ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {evaluation.overall}
                        </span>
                        <span className="text-slate-500 font-bold mb-0.5 text-sm">/ 100</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {Object.entries(evaluation.per_skill || {}).map(([skill, s]) => (
                            <div key={skill} className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">{skill}</span>
                                <span className="text-slate-300 font-mono">{s as number}/100</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : score !== null ? (
                <div className="flex items-end gap-1.5">
                    <span className="text-3xl font-black text-yellow-400 leading-none">{score}</span>
                    <span className="text-slate-500 font-bold mb-0.5 text-sm">/ 100</span>
                </div>
            ) : (
                <span className="text-slate-500 italic text-sm mt-1">Pending evaluation...</span>
            )}
            <div className="flex items-center gap-1.5 mt-auto pt-2 text-slate-500 text-xs">
                <Clock size={12} />
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </div>
        </div>
    );
}
