import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminSidebar } from "../../components/admin-sidebar";
import { ArrowLeft, Clock, Activity, Bot, Library, CheckCircle2, CircleDashed, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { IssueCertificateButton } from "../components/issue-certificate-button";
import { FinishInterviewButton } from "../components/finish-interview-button";
import { TranscriptTabs } from "../components/transcript-tabs";
import { RunStatusActions } from "../components/run-status-actions";
import { RunScoreBox } from "../components/run-score-box";


export default async function InterviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const run = await prisma.run.findUnique({
        where: { id },
        include: {
            agent: true,
            template: {
                include: {
                    criteria: { orderBy: { createdAt: 'asc' } }
                }
            },
            steps: {
                orderBy: { timestamp: 'asc' },
                include: {
                    gradingHistory: { orderBy: { givenAt: 'asc' } }
                }
            },
            evaluation: {
                include: {
                    skillScores: true,
                    perQuestion: { include: { skillScores: true } }
                }
            }
        },
    });

    if (!run) {
        notFound();
    }

    const transcriptSteps = run.steps;
    const questionCount = run.steps.filter(s => s.role === 'interviewer').length;

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Header Section */}
                <div className="shrink-0 px-8 pt-8 pb-6 border-b border-[#1f2937] bg-[#0f131d]/90 backdrop-blur-sm z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/interviews" className="text-slate-400 hover:text-white transition-colors bg-[#1b253c]/50 p-2 rounded-md inline-flex items-center gap-2 text-sm font-medium">
                            <ArrowLeft size={16} /> Back to Interviews
                        </Link>

                        <RunStatusActions
                            runId={run.id}
                            initialStatus={run.status}
                            isLocked={run.isLocked}
                            steps={run.steps.map(s => ({
                                ...s,
                                timestamp: s.timestamp.toISOString(),
                            })) as any}
                            criteria={(run.template?.criteria as any) ?? []}
                            skills={(run.template?.skills as any) ?? []}
                        />
                    </div>

                    <div className="mb-2">
                        <h2 className="text-2xl font-bold text-white">{run.agent?.name ?? 'Unknown Agent'}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <span className="font-mono bg-[#1f2937]/80 px-1.5 rounded text-xs">{run.id.slice(0, 24)}</span>
                            <span>•</span>
                            <span>{format(new Date(run.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                        {/* Agent Info */}
                        <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                                <Bot size={14} className="text-indigo-400" /> Agent
                            </div>
                            <h3 className="text-white font-bold">{run.agent?.name || 'Unknown'}</h3>
                            <p className="text-slate-500 text-xs font-mono truncate">ID: {run.agent?.agentId}</p>
                        </div>

                        {/* Template */}
                        <div className="bg-[#151b27] border border-[#1f2937] rounded-lg p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                                <Library size={14} className="text-indigo-400" /> Template
                            </div>
                            <h3 className="text-white font-bold">{run.template?.name || run.templateName || 'Unknown'}</h3>
                            <p className="text-slate-500 text-xs truncate">{run.template?.description || 'No description'}</p>
                        </div>

                        {/* Score */}
                        <RunScoreBox
                            runId={run.id}
                            initialScore={run.score}
                            evaluation={run.evaluation ? {
                                overall: run.evaluation.overall,
                                pass_threshold: run.evaluation.passThreshold,
                                per_skill: Object.fromEntries(
                                    run.evaluation.skillScores.map(s => [s.skill, s.score])
                                ),
                            } : null}
                            timestamp={run.timestamp.toISOString()}
                        />
                    </div>
                </div>

                {/* Transcript — Tabbed */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#0f131d] to-[#0d121c]">
                    <div className="shrink-0 px-6 pt-5 pb-0 flex items-center gap-2">
                        <FileText size={13} className="text-indigo-400" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Transcript — {questionCount} Question{questionCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <TranscriptTabs
                        runId={run.id}
                        isLocked={run.isLocked}
                        initialStatus={run.status}
                        systemSteps={run.steps.filter(s => s.role === 'system').map(s => ({
                            ...s,
                            timestamp: s.timestamp.toISOString(),
                            gradingHistory: s.gradingHistory.map(g => ({
                                id: g.id,
                                score: g.score,
                                reasoning: g.reasoning,
                                type: g.type,
                                isElected: g.isElected,
                                givenAt: g.givenAt.toISOString(),
                                electedAt: g.electedAt.toISOString(),
                            })),
                        }))}
                        interviewerSteps={run.steps.filter(s => s.role === 'interviewer').map(s => ({
                            ...s,
                            timestamp: s.timestamp.toISOString(),
                            gradingHistory: s.gradingHistory.map(g => ({
                                id: g.id,
                                score: g.score,
                                reasoning: g.reasoning,
                                type: g.type,
                                isElected: g.isElected,
                                givenAt: g.givenAt.toISOString(),
                                electedAt: g.electedAt.toISOString(),
                            })),
                        }))}
                        agentSteps={run.steps.filter(s => s.role === 'agent').map(s => ({
                            ...s,
                            timestamp: s.timestamp.toISOString(),
                            gradingHistory: s.gradingHistory.map(g => ({
                                id: g.id,
                                score: g.score,
                                reasoning: g.reasoning,
                                type: g.type,
                                isElected: g.isElected,
                                givenAt: g.givenAt.toISOString(),
                                electedAt: g.electedAt.toISOString(),
                            })),
                        }))}
                        criteria={(run.template?.criteria as any) ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
