import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Award, CheckCircle, ShieldCheck, Calendar, Hash, FileJson } from "lucide-react";
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

                        <div className="md:col-span-2">
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                                <Hash size={14} className="text-purple-400" /> Cryptographic Data Hash
                            </div>
                            <div className="text-slate-300 text-xs font-mono bg-[#0f131d] border border-[#2a364d] p-3 rounded-lg overflow-x-auto">
                                {cert.dataHash}
                            </div>
                        </div>
                    </div>

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
