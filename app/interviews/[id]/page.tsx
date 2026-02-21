import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminSidebar } from "../../components/admin-sidebar";
import { ArrowLeft, Clock, Activity, Bot, Library, FileText, CheckCircle2, CircleDashed, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from 'react-markdown';

export default async function InterviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const run = await prisma.run.findUnique({
        where: { id },
        include: {
            agent: true,
            template: true,
            steps: {
                orderBy: { timestamp: 'asc' }
            }
        },
    });

    if (!run) {
        notFound();
    }

    // Separate steps by role
    const interviewerSteps = run.steps.filter(step => step.role === 'interviewer');
    const agentSteps = run.steps.filter(step => step.role === 'agent');

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Header Section */}
                <div className="shrink-0 px-8 pt-8 pb-6 border-b border-[#2a364d] bg-[#0f131d]/90 backdrop-blur-sm z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/interviews" className="text-slate-400 hover:text-white transition-colors bg-[#1b253c]/50 p-2 rounded-md inline-flex items-center gap-2 text-sm font-medium">
                            <ArrowLeft size={16} /> Back to Interviews
                        </Link>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold tracking-wide uppercase ${run.status === 'completed'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            {run.status === 'completed' ? <CheckCircle2 size={14} /> : <CircleDashed size={14} className="animate-spin-slow" />}
                            {run.status}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-6">Interview Evaluation</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Agent Info Box */}
                        <div className="bg-[#151b27] border border-[#2a364d] rounded-lg p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
                                <Bot size={16} className="text-indigo-400" />
                                Assigned Agent
                            </div>
                            <h3 className="text-white font-bold text-lg">{run.agent?.name || "Unknown Agent"}</h3>
                            <p className="text-slate-500 text-sm font-mono truncate">ID: {run.agent?.agentId}</p>
                            {run.agent?.version && (
                                <div className="mt-2 inline-flex bg-[#1b253c] text-slate-300 text-xs px-2 py-1 rounded w-fit border border-[#2a364d]">
                                    v{run.agent.version}
                                </div>
                            )}
                        </div>

                        {/* Template Info Box */}
                        <div className="bg-[#151b27] border border-[#2a364d] rounded-lg p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
                                <Library size={16} className="text-indigo-400" />
                                Template Assessed
                            </div>
                            <h3 className="text-white font-bold text-lg">{run.template?.name || run.templateName || "Unknown Template"}</h3>
                            <p className="text-slate-500 text-sm truncate">{run.template?.description || "No description provided."}</p>
                        </div>

                        {/* Score/Timing Box */}
                        <div className="bg-[#151b27] border border-[#2a364d] rounded-lg p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
                                <Activity size={16} className="text-indigo-400" />
                                Performance
                            </div>

                            {run.score !== null ? (
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-emerald-400 leading-none">{run.score}</span>
                                    <span className="text-slate-500 font-bold mb-1">/ 100 PTS</span>
                                </div>
                            ) : (
                                <span className="text-slate-400 italic">Pending human review.</span>
                            )}

                            <div className="flex items-center gap-2 mt-auto text-slate-500 text-sm">
                                <Clock size={14} />
                                {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversation/Steps Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 md:py-10 pb-20">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="text-indigo-400" /> Transcript ({interviewerSteps.length} Questions)
                    </h3>

                    {interviewerSteps.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 border border-dashed border-[#2a364d] rounded-xl bg-[#151b27]/30">
                            No transcript data available for this run.
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-4xl">
                            {interviewerSteps.map((qStep, index) => {
                                // Find the corresponding answer from the agent
                                // We match roughly by array index since the mock script sends them iteratively
                                const aStep = agentSteps[index];

                                return (
                                    <div key={qStep.id} className="relative">
                                        {/* Connector Line */}
                                        {index !== interviewerSteps.length - 1 && (
                                            <div className="absolute left-6 top-16 bottom-[-2rem] w-px bg-[#2a364d]" />
                                        )}

                                        <div className="flex gap-4">
                                            {/* Human/System Avatar */}
                                            <div className="shrink-0 w-12 h-12 rounded-full border border-[#2a364d] bg-[#1b253c] flex items-center justify-center text-slate-400 z-10 shadow-lg">
                                                <User size={20} />
                                            </div>

                                            {/* Question Card */}
                                            <div className="flex-1">
                                                <div className="bg-[#151b27] border border-[#2a364d] rounded-2xl rounded-tl-sm p-5 shadow-md">
                                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Question {index + 1}</div>
                                                    <div className="text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
                                                        <ReactMarkdown>{qStep.content}</ReactMarkdown>
                                                    </div>
                                                </div>

                                                {/* Answer Card */}
                                                {aStep ? (
                                                    <div className="mt-4 flex gap-4 pl-4">
                                                        {/* Connector branch */}
                                                        <div className="w-8 h-8 rounded-bl-xl border-b border-l border-[#2a364d] mt-4 shrink-0" />

                                                        <div className="flex-1 relative">
                                                            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl rounded-tr-sm p-5 shadow-md">
                                                                <div className="absolute -right-3 -top-3 w-8 h-8 bg-[#0f131d] rounded-full border border-[#2a364d] flex items-center justify-center text-indigo-400 shadow-lg">
                                                                    <Sparkles size={14} />
                                                                </div>
                                                                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400/70 mb-2">Agent Response</div>
                                                                <div className="text-slate-300 text-sm leading-relaxed font-mono prose prose-invert max-w-none">
                                                                    {aStep.content}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 flex gap-4 pl-4 opacity-50">
                                                        <div className="w-8 h-8 rounded-bl-xl border-b border-l border-dashed border-[#2a364d] mt-4 shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="bg-[#151b27]/50 border border-dashed border-[#2a364d] rounded-xl p-4 text-slate-500 text-sm italic">
                                                                Waiting for agent response...
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
