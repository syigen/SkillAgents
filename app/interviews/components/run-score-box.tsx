'use client';

import { Activity, Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAppSelector } from "@/lib/store/hooks";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function RunScoreBox({
    runId,
    initialScore,
    evaluation,
    timestamp,
}: any) {
    const liveState = useAppSelector(state => state.runs.runs[runId]);
    const score = liveState?.score ?? initialScore;

    const hasSkills = evaluation && evaluation.per_skill && Object.keys(evaluation.per_skill).length > 0;

    const BoxContent = (
        <div className={`bg-[#151b27] border border-[#1f2937] rounded-lg p-4 flex flex-col gap-1 h-full ${hasSkills ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-[#1a2133] transition-all' : ''}`}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <Activity size={14} className="text-indigo-400" /> Current Score
                </div>
                {hasSkills && <ChevronRight size={14} className="text-slate-600" />}
            </div>

            {evaluation ? (
                <div className="flex items-end gap-1.5">
                    <span className={`text-3xl font-black leading-none ${evaluation.overall >= evaluation.pass_threshold ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {evaluation.overall}
                    </span>
                    <span className="text-slate-500 font-bold mb-0.5 text-sm">/ 100</span>
                </div>
            ) : score !== null ? (
                <div className="flex items-end gap-1.5">
                    <span className="text-3xl font-black text-yellow-400 leading-none">{score}</span>
                    <span className="text-slate-500 font-bold mb-0.5 text-sm">/ 100</span>
                </div>
            ) : (
                <span className="text-slate-500 italic text-sm mt-1">Pending evaluation...</span>
            )}

            <div className="flex items-center gap-1.5 mt-auto pt-4 text-slate-500 text-xs">
                <Clock size={12} />
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </div>
        </div>
    );

    if (!hasSkills) {
        return BoxContent;
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {BoxContent}
            </SheetTrigger>
            <SheetContent className="bg-[#0f131d] border-[#1f2937] text-slate-200">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">Score Breakdown</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Detailed performance across evaluated skills.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-6 text-center">
                        <div className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-2">Overall Score</div>
                        <div className="flex items-end justify-center gap-2">
                            <span className={`text-5xl font-black leading-none ${evaluation.overall >= evaluation.pass_threshold ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                {evaluation.overall}
                            </span>
                            <span className="text-slate-500 font-bold mb-1 text-xl">/ 100</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 border-b border-[#1f2937] pb-2">
                            Verified Skills
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(evaluation.per_skill || {}).map(([skill, s]) => {
                                const skillScore = s as number;
                                const isPassingSkill = skillScore >= (evaluation.skill_threshold || 60);
                                return (
                                    <div key={skill} className="bg-[#151b27] border border-[#1f2937] rounded-lg p-4 flex justify-between items-center transition-colors hover:bg-[#1a2133]">
                                        <span className="text-slate-300 font-medium">{skill}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-[#0f131d] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isPassingSkill ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${Math.max(0, Math.min(100, skillScore))}%` }}
                                                />
                                            </div>
                                            <span className={`font-mono font-bold w-8 text-right ${isPassingSkill ? 'text-indigo-400' : 'text-rose-400'}`}>
                                                {skillScore}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
