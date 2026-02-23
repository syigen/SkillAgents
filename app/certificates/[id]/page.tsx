import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Award, CheckCircle, ShieldCheck, Calendar, Hash, FileJson, Bot, Activity, Target } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const cert = await prisma.certificate.findUnique({
        where: { id },
    });

    if (!cert || cert.status !== 'active') {
        notFound();
    }

    const run = await prisma.run.findUnique({
        where: { id: cert.runId },
        include: { steps: { orderBy: { timestamp: 'asc' } } }
    });

    const snapshotData = cert.snapshot as any;
    const evaluation = snapshotData?.evaluation;

    // Dynamically calculate skills based on per-question snapshot data
    const skillTotals: Record<string, { sum: number, count: number }> = {};
    if (evaluation?.per_question) {
        evaluation.per_question.forEach((q: any) => {
            if (q.skills) {
                Object.entries(q.skills).forEach(([skill, score]) => {
                    const sName = String(skill);
                    if (!skillTotals[sName]) {
                        skillTotals[sName] = { sum: 0, count: 0 };
                    }
                    skillTotals[sName].sum += Number(score);
                    skillTotals[sName].count += 1;
                });
            }
        });
    }

    // Default to the old global per_skill if no question level skills are tracked
    let skills = Object.entries(skillTotals).map(([skill, data]) => [skill, Math.round(data.sum / data.count)]);
    if (skills.length === 0 && evaluation?.per_skill) {
        skills = Object.entries(evaluation.per_skill);
    }

    return (
        <div className="min-h-screen bg-[#0f131d] flex flex-col items-center justify-center p-6 font-sans">

            {/* Certificate Container */}
            <div className="max-w-4xl w-full bg-[#151b27] border-2 border-[#2a364d] rounded-2xl overflow-hidden shadow-2xl relative">

                {/* Decorative Accents */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="p-12 text-center relative z-10">

                    {/* Header Logo Area */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                            <Award strokeWidth={1.5} size={40} />
                        </div>
                    </div>

                    <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-slate-400 mb-4">
                        Certificate of Excellence
                    </h1>

                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                        This document verifies that the Artificial Intelligence Agent known as
                    </p>

                    <h2 className="text-5xl font-black text-white mb-8 tracking-tight">
                        {cert.agentName}
                    </h2>

                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                        has successfully completed the grueling evaluation template
                        <br />
                        <span className="text-slate-300 font-semibold mt-2 inline-block">"{cert.templateName || "Unknown Template"}"</span>
                    </p>

                    <div className="flex justify-center gap-12 mb-12">
                        <div className="text-center">
                            <div className="text-[3rem] font-black leading-none text-emerald-400 mb-2">
                                {cert.score}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-center items-center gap-1">
                                <CheckCircle size={14} /> Overall Score
                            </div>
                        </div>
                    </div>

                    {/* Skills Assessment Meta Data */}
                    {skills.length > 0 && (
                        <div className="mb-12 max-w-2xl mx-auto">
                            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6 border-b border-[#2a364d] pb-2 text-left flex items-center justify-between">
                                <span>Platform Verification Metadata</span>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Verified Skills</span>
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {skills.map(([skill, score]) => (
                                    <div key={skill} className="bg-[#0f131d] border border-[#2a364d] rounded-xl p-3 text-center transition-transform hover:-translate-y-1">
                                        <div className="text-xl font-black text-indigo-400 mb-1">{String(score)}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={String(skill)}>
                                            {String(skill)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left border-t border-[#2a364d] pt-8 max-w-2xl mx-auto">

                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <Calendar size={14} className="text-indigo-400" /> Issued On
                            </div>
                            <div className="text-slate-300 text-sm">
                                {format(new Date(cert.issuedAt), "MMMM do, yyyy")}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-400" /> Certificate ID
                            </div>
                            <div className="text-slate-300 text-sm font-mono truncate" title={cert.id}>
                                {cert.id}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <Bot size={14} className="text-blue-400" /> Agent ID
                            </div>
                            <div className="text-slate-300 text-sm font-mono truncate" title={cert.agentFkId}>
                                {cert.agentFkId}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <Activity size={14} className="text-rose-400" /> Run ID
                            </div>
                            <div className="text-slate-300 text-sm font-mono truncate" title={cert.runId}>
                                {cert.runId}
                            </div>
                        </div>

                        {evaluation && (
                            <>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                        <Target size={14} className="text-amber-400" /> Pass Threshold
                                    </div>
                                    <div className="text-slate-300 text-sm font-mono truncate">
                                        {evaluation.pass_threshold}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                        <Target size={14} className="text-orange-400" /> Skill Threshold
                                    </div>
                                    <div className="text-slate-300 text-sm font-mono truncate">
                                        {evaluation.skill_threshold}%
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <Hash size={14} className="text-purple-400" /> Cryptographic Data Hash
                            </div>
                            <div className="text-slate-300 text-xs font-mono bg-[#0f131d] border border-[#2a364d] p-3 rounded-lg overflow-x-auto">
                                {cert.dataHash}
                            </div>
                        </div>
                    </div>

                    {/* Interview Summary List */}
                    {evaluation?.per_question && evaluation.per_question.length > 0 && (
                        <div className="mt-12 text-left border-t border-[#2a364d] pt-8 max-w-3xl mx-auto">
                            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6 flex items-center justify-between">
                                <span>Interview Summary</span>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{evaluation.per_question.length} Questions</span>
                            </h3>

                            <div className="space-y-4">
                                {evaluation.per_question.map((q: any, i: number) => {
                                    // Try to find the actual question text from the run steps if we included them
                                    const questionStep = run?.steps.filter(s => s.role === 'interviewer')[i];
                                    const questionText = questionStep?.content || `Question ${i + 1}`;

                                    const isPass = parseFloat(q.score) >= (parseFloat(q.max_score) / 2); // basic heuristic

                                    return (
                                        <div key={i} className="bg-[#0f131d] border border-[#2a364d] rounded-xl p-5 relative overflow-hidden">
                                            {/* Status indicator line */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPass ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`} />

                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <div className="text-sm text-slate-200 font-medium leading-relaxed">
                                                    <span className="text-slate-500 font-mono mr-2">{i + 1}.</span>
                                                    {questionText}
                                                </div>
                                                <div className="shrink-0 text-center bg-[#151b27] px-3 py-1.5 rounded-lg border border-[#2a364d]">
                                                    <div className={`text-lg font-black leading-none ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {q.score}
                                                    </div>
                                                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 font-bold">
                                                        / {q.max_score}
                                                    </div>
                                                </div>
                                            </div>

                                            {q.feedback && (
                                                <div className="mt-4 bg-[#151b27] rounded-lg p-3 text-sm text-slate-400 border border-[#1f2937]/50">
                                                    <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">AI Assessor Feedback</div>
                                                    {q.feedback}
                                                </div>
                                            )}

                                            {q.skills && Object.keys(q.skills).length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {Object.entries(q.skills).map(([skill, sScore]) => (
                                                        <div key={skill} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 flex gap-1.5">
                                                            <span>{skill}</span>
                                                            <span className="font-bold text-indigo-400 text-opacity-80 md:border-l border-indigo-500/30 pl-1.5">{String(sScore)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Verify Note */}
            <div className="mt-8 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
                <p>This certificate represents an immutable snapshot of agent evaluation performance.</p>

                <Link
                    href={`/api/public/certificates/${cert.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 transition-colors"
                >
                    <FileJson size={16} /> View Raw Snapshot Data
                </Link>
            </div>

        </div>
    );
}
