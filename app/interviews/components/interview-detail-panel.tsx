"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Activity, Bot, Library, CheckCircle2, CircleDashed, FileText, Lock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { TranscriptTabs } from "./transcript-tabs";
import { IssueCertificateButton } from "./issue-certificate-button";
import { FinishInterviewButton } from "./finish-interview-button";

type StepData = {
    id: string;
    role: string;
    content: string;
    score: number | null;
    humanNote: string | null;
    isHumanGraded: boolean;
    gradingHistory: any;
    timestamp: string;
};

type RunDetail = {
    id: string;
    status: string;
    score: number | null;
    evaluation: any;
    isLocked: boolean;
    timestamp: string;
    agent: { name: string; agentId: string; version: string | null } | null;
    template: { name: string; description: string | null; skills: any } | null;
    templateName: string | null;
    steps: StepData[];
    criteria: { prompt: string; expected: string; minScore: number }[];
};

function getScoreColor(score: number | null, passThreshold?: number) {
    if (score === null || score === undefined) return 'text-slate-400';
    if (passThreshold !== undefined) return score >= passThreshold ? 'text-emerald-400' : 'text-red-400';
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
}

export function InterviewDetailPanel({ runId }: { runId: string }) {
    const [run, setRun] = useState<RunDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRun = () => {
        setLoading(true);
        setError(null);
        fetch(`/api/runs/${runId}/detail`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setRun(data.run);
                else setError(data.error ?? 'Unknown error');
            })
            .catch(() => setError('Failed to load interview details.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRun();
    }, [runId]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="size-8 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-xs">Loading interview...</span>
                </div>
            </div>
        );
    }

    if (error || !run) {
        return (
            <div className="flex flex-1 items-center justify-center text-red-400 text-sm">
                {error ?? 'Interview not found.'}
            </div>
        );
    }

    const systemSteps = run.steps.filter(s => s.role === 'system');
    const interviewerSteps = run.steps.filter(s => s.role === 'interviewer');
    const agentSteps = run.steps.filter(s => s.role === 'agent');
    const questionCount = interviewerSteps.length;
    const evalData = run.evaluation as any;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1f2937] bg-[#0f131d]/80 backdrop-blur-sm">
                {/* Top row: run ID + status */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono bg-[#1f2937]/80 px-1.5 py-0.5 rounded">
                            {run.id.slice(0, 22)}...
                        </span>
                        <span>·</span>
                        <span>{format(new Date(run.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {run.isLocked && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-500/70 border border-amber-500/20 bg-amber-500/5 rounded-full px-2 py-0.5">
                                <Lock size={9} /> Certified
                            </div>
                        )}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${run.status === 'pass' || run.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : run.status === 'fail'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            {run.status === 'pass' || run.status === 'completed'
                                ? <CheckCircle2 size={10} />
                                : <CircleDashed size={10} />}
                            {run.status}
                        </div>
                        {(run.status === 'running' || run.status === 'in_progress') && (
                            <FinishInterviewButton
                                runId={run.id}
                                steps={run.steps}
                                criteria={run.criteria}
                                skills={run.template?.skills ?? []}
                                onSuccess={fetchRun}
                            />
                        )}
                        <IssueCertificateButton runId={run.id} isLocked={run.isLocked} status={run.status} />
                    </div>
                </div>

                {/* Agent name */}
                <h2 className="text-xl font-bold text-white mb-1">{run.agent?.name ?? 'Unknown Agent'}</h2>

                {/* Info cards row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Bot size={10} className="text-indigo-400" /> Agent
                        </div>
                        <p className="text-white text-xs font-semibold truncate">{run.agent?.name ?? '—'}</p>
                        <p className="text-slate-600 text-[10px] font-mono truncate mt-0.5">ID: {run.agent?.agentId.slice(0, 18)}...</p>
                    </div>

                    <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Library size={10} className="text-indigo-400" /> Template
                        </div>
                        <p className="text-white text-xs font-semibold truncate">{run.template?.name ?? run.templateName ?? '—'}</p>
                        <p className="text-slate-600 text-[10px] truncate mt-0.5">{run.template?.description ?? ''}</p>
                    </div>

                    <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Activity size={10} className="text-indigo-400" /> Current Score
                        </div>
                        {evalData ? (
                            <div className={`text-2xl font-black ${getScoreColor(evalData.overall, evalData.pass_threshold)}`}>
                                {evalData.overall}
                                <span className="text-slate-600 text-xs font-bold ml-1">/100</span>
                            </div>
                        ) : run.score !== null ? (
                            <div className={`text-2xl font-black ${getScoreColor(run.score)}`}>
                                {run.score}
                                <span className="text-slate-600 text-xs font-bold ml-1">/100</span>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic text-xs mt-1">Pending evaluation...</p>
                        )}
                        <div className="flex items-center gap-1 text-slate-600 text-[10px] mt-1.5">
                            <Clock size={9} />
                            {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                {/* Transcript label */}
                <div className="flex items-center gap-2 mt-4">
                    <FileText size={11} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Transcript — {questionCount} Question{questionCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── Transcript (sidebar + detail) ──────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                <TranscriptTabs
                    runId={run.id}
                    isLocked={run.isLocked}
                    systemSteps={systemSteps}
                    interviewerSteps={interviewerSteps}
                    agentSteps={agentSteps}
                    criteria={run.criteria}
                />
            </div>
        </div>
    );
}
