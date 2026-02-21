import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminSidebar } from "../../components/admin-sidebar";
import { ArrowLeft, Clock, BarChart, FileEdit } from "lucide-react";
import Link from "next/link";
import { InviteAgentButton } from "../components/invite-agent-button";

export default async function TemplateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Fetch template by ID
    const { id } = await params;

    const template = await prisma.template.findUnique({
        where: { id },
        include: { criteria: true },
    });

    if (!template) {
        notFound();
    }

    // 2. Mock Current User ID (Must match the stub used in the POST route: 00000000-0000-0000-0000-000000000000)
    // Change this to anything else to test the "Viewer only" state!
    const currentUserId = "00000000-0000-0000-0000-000000000000";

    // 3. Determine if the current user owns this template
    const isOwner = template.ownerUserId === currentUserId;

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Header */}
                <div className="shrink-0 px-8 pt-8 pb-6 border-b border-[#2a364d]">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/templates" className="text-slate-400 hover:text-white transition-colors bg-[#1b253c]/50 p-2 rounded-md">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-[#1b253c]/50 border border-[#2a364d] rounded-full px-2.5 py-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${template.status === "public" ? "bg-emerald-500" :
                                    template.status === "private" ? "bg-amber-500" :
                                        "bg-slate-400"
                                    }`} />
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                                    {template.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{template.name}</h2>
                            <p className="text-slate-400 text-sm tracking-wide max-w-2xl leading-relaxed">
                                {template.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <BarChart size={16} className="text-slate-500" />
                                    <span className="capitalize">{template.difficulty}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <Clock size={16} className="text-slate-500" />
                                    <span>45 min estimated</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Action Buttons */}
                        <div className="flex items-center gap-3">
                            <InviteAgentButton templateId={template.id} />

                            {isOwner && (
                                <Link
                                    href={`/templates/${template.id}/edit`}
                                    className="bg-[#1b253c] hover:bg-[#2a364d] border border-[#2a364d] text-white px-5 py-2.5 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
                                >
                                    <FileEdit size={16} /> Edit
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Criteria Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <h3 className="text-xl font-bold text-white mb-6">Evaluation Criteria ({template.criteria.length})</h3>

                    <div className="space-y-4 max-w-4xl">
                        {template.criteria.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-500 bg-[#151b27]/50 rounded-lg border border-dashed border-[#2a364d]">
                                <p className="font-medium text-slate-400">No evaluation criteria defined.</p>
                            </div>
                        ) : (
                            template.criteria.map((criterion, idx) => (
                                <div key={criterion.id} className="bg-[#151b27] border border-[#2a364d] rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded bg-[#1b253c] text-xs font-bold text-slate-300">
                                                {idx + 1}
                                            </span>
                                            <h4 className="text-white font-medium">Question / Prompt</h4>
                                        </div>
                                        <div className="bg-[#1b253c]/50 border border-[#2a364d] px-3 py-1 rounded text-xs text-slate-300 font-semibold">
                                            {criterion.minScore} pts max
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-[#0f131d]/50 p-4 rounded border border-[#1f2937]">
                                        {criterion.prompt}
                                    </p>

                                    <h4 className="text-slate-400 font-medium text-sm mb-2">Expected Outcome</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed bg-[#0f131d]/50 p-4 rounded border border-[#1f2937]">
                                        {criterion.expected}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
