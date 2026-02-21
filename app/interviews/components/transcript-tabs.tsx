"use client";

import { useState } from "react";
import { User, Bot, Terminal, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { HumanGradingOverride } from "./human-grading-override";
import { useAppSelector } from "@/lib/store/hooks";


type StepData = {
    id: string;
    role: string;
    content: string;
    score: number | null;
    humanNote: string | null;
    isHumanGraded: boolean;
    gradingHistory: any;
    timestamp: string | Date;
};

type Props = {
    runId: string;
    isLocked: boolean;
    initialStatus: string;
    systemSteps: StepData[];
    interviewerSteps: StepData[];
    agentSteps: StepData[];
    criteria?: { prompt: string; expected: string; minScore: number }[];
};

function getScoreStyle(score: number | null | undefined, isHumanGraded?: boolean) {
    if (score === null || score === undefined) return { pill: "bg-[#1a2332] border-[#1f2937] text-slate-500", text: "text-slate-500" };
    if (score >= 85) return { pill: "bg-[#0c2e16] border-emerald-500/30 text-emerald-400", text: "text-emerald-400" };
    if (score >= 70) return { pill: "bg-[#2e1d05] border-yellow-500/30 text-yellow-400", text: "text-yellow-400" };
    return { pill: "bg-[#2c0b0e] border-red-500/30 text-red-400", text: "text-red-400" };
}

export function TranscriptTabs({ runId, isLocked, initialStatus, systemSteps, interviewerSteps, agentSteps, criteria = [] }: Props) {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const liveState = useAppSelector(state => state.runs.runs[runId]);

    const status = liveState?.status ?? initialStatus;
    const isTerminalStatus = status !== 'running' && status !== 'in_progress';
    const locked = (liveState?.isLocked ?? isLocked) || isTerminalStatus;

    const activeQuestion = interviewerSteps[activeIndex];
    const activeAnswer = agentSteps[activeIndex];
    const activeCriterion = criteria[activeIndex];

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* ── Left Sidebar ─────────────────────────────────────── */}
            <div className="w-64 shrink-0 flex flex-col border-r border-[#1f2937] overflow-y-auto bg-[#0d121c]">

                {/* System messages */}
                {systemSteps.length > 0 && (
                    <div className="p-3 border-b border-[#1f2937]">
                        {systemSteps.map(s => (
                            <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                                <div className="size-4 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                                    <Terminal size={9} className="text-white" />
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono truncate">{s.content}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Question list */}
                <div className="flex-1 p-2 space-y-1">
                    {interviewerSteps.length === 0 ? (
                        <div className="px-3 py-6 text-center text-slate-600 text-xs">No questions</div>
                    ) : interviewerSteps.map((q, i) => {
                        const ans = agentSteps[i];
                        const style = getScoreStyle(ans?.score, ans?.isHumanGraded);
                        const isActive = activeIndex === i;

                        return (
                            <button
                                key={q.id}
                                onClick={() => setActiveIndex(i)}
                                className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg border transition-all duration-150 group
                                    ${isActive
                                        ? "bg-[#1b253c] border-indigo-500/30 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-[#151b27] hover:border-[#1f2937]"
                                    }`}
                            >
                                {/* Number badge */}
                                <div className={`shrink-0 size-6 rounded-full border flex items-center justify-center text-[10px] font-black mt-0.5
                                    ${isActive ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-[#151b27] border-[#1f2937] text-slate-500 group-hover:border-[#2a364d]"}`}>
                                    {i + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Question excerpt */}
                                    <p className={`text-xs leading-snug line-clamp-2 ${isActive ? "text-white" : "text-slate-400"}`}>
                                        {q.content}
                                    </p>

                                    {/* Score pill */}
                                    <div className="mt-2 flex items-center gap-1.5">
                                        {ans?.score !== null && ans?.score !== undefined ? (
                                            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${style.pill}`}>
                                                {ans.isHumanGraded ? "H " : "AI "}{ans.score}/100
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 italic">ungraded</span>
                                        )}
                                    </div>
                                </div>

                                {isActive && <ChevronRight size={14} className="shrink-0 text-indigo-400 mt-1" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Right Detail Panel ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-b from-[#0f131d] to-[#0d121c]">
                {interviewerSteps.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 border border-dashed border-[#1f2937] rounded-xl text-sm">
                        No questions found for this run.
                    </div>
                ) : activeQuestion ? (
                    <div className="max-w-3xl space-y-6">

                        {/* Question Metadata Card (from user screenshot) */}
                        <div className="bg-[#151b27] border border-[#2a364d] rounded-xl overflow-hidden flex shadow-lg">
                            {/* Left Side: Prompt & Expected */}
                            <div className="flex-1 p-5 border-r border-[#2a364d] space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prompt / Question</span>
                                        <span className="text-[10px] font-mono text-slate-600">#{activeIndex + 1}</span>
                                    </div>
                                    <div className="bg-[#0f131d] border border-[#2a364d] rounded-lg p-3 text-sm text-slate-300 leading-relaxed">
                                        {activeQuestion.content}
                                    </div>
                                </div>
                                {activeCriterion?.expected && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Outcome</span>
                                        <div className="bg-[#0f131d] border border-[#2a364d] rounded-lg p-3 text-sm text-slate-400 leading-relaxed italic">
                                            {activeCriterion.expected}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Right Side: Score */}
                            <div className="w-48 p-5 flex flex-col justify-between bg-[#1b253c]/30">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 italic">Max Score</span>
                                    <div className="bg-[#0f131d] border border-[#2a364d] rounded-lg h-12 flex items-center justify-center relative">
                                        <span className="text-lg font-black text-white">100</span>
                                        <span className="absolute right-3 text-[10px] text-slate-600 font-mono italic">pts</span>
                                    </div>
                                    {activeCriterion?.minScore !== undefined && (
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Pass Score:</span>
                                            <span className="text-xs font-bold text-emerald-500/80 font-mono">{activeCriterion.minScore}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section label (Timeline style) */}
                        <div className="flex items-center gap-3 pt-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Interactive Transcript
                            </span>
                            <div className="flex-1 h-px bg-[#1f2937]" />
                        </div>

                        {/* Question bubble */}
                        <div className="flex gap-3 items-start">
                            <div className="size-8 rounded-full border-2 border-emerald-500 bg-[#0f131d] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                                <User size={14} className="text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Interviewer</div>
                                <div className="bg-[#1a2332] border border-[#1f2937] rounded-xl rounded-tl-sm p-4 text-sm text-white leading-relaxed whitespace-pre-wrap shadow-sm">
                                    {activeQuestion.content}
                                </div>
                            </div>
                        </div>

                        {/* Agent answer bubble */}
                        {activeAnswer ? (
                            <>
                                <div className="flex gap-3 items-start">
                                    <div className="size-8 rounded-full border-2 border-indigo-500 bg-[#0f131d] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                                        <Bot size={14} className="text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Agent Response</div>
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl rounded-tl-sm p-4 text-sm text-slate-200 leading-relaxed shadow-sm">
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-pre:bg-[#0f131d] prose-pre:border prose-pre:border-[#2a364d]">
                                                <ReactMarkdown>{activeAnswer.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grade row */}
                                <div className="flex justify-center py-1 relative">
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#1f2937]" />
                                    <div className="relative z-10">
                                        <HumanGradingOverride
                                            runId={runId}
                                            stepId={activeAnswer.id}
                                            currentScore={activeAnswer.score}
                                            currentNote={activeAnswer.humanNote}
                                            isLocked={locked}
                                            isHumanGraded={activeAnswer.isHumanGraded}
                                            gradingHistory={activeAnswer.gradingHistory}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-3 items-start opacity-50 pl-11">
                                <div className="flex-1">
                                    <div className="bg-[#151b27] border border-dashed border-[#1f2937] rounded-xl p-4 text-sm text-slate-500 italic">
                                        Waiting for agent response...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
