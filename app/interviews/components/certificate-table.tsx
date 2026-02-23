"use client";

import { Award, Calendar, ExternalLink, Bot, Library } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type CertificateSummary = {
    id: string;
    agentName: string;
    templateName: string | null;
    score: number;
    issuedAt: Date | string;
};

interface Props {
    certificates: CertificateSummary[];
}

function getScoreColor(score: number) {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
}

export function CertificateTable({ certificates }: Props) {
    return (
        <div className="w-full h-full overflow-hidden flex flex-col bg-[#0d121c]">
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10 bg-[#0d121c]/95 backdrop-blur-sm border-b border-[#1f2937]">
                        <tr>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20">Score</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template</th>
                            <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-40">Issued Date</th>
                            <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2937]/50">
                        {certificates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-600 text-sm italic">
                                    No issued certificates found.
                                </td>
                            </tr>
                        ) : (
                            certificates.map((cert) => {
                                const scoreCls = getScoreColor(cert.score);

                                return (
                                    <tr key={cert.id} className="group hover:bg-[#151b27]/80 transition-colors">
                                        {/* Score */}
                                        <td className="px-6 py-4">
                                            <div className={`size-10 rounded-full border-2 flex items-center justify-center font-black text-sm border-current ${scoreCls}`}>
                                                {cert.score}
                                            </div>
                                        </td>

                                        {/* Agent */}
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <Award size={12} className="text-amber-500" />
                                                    <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                                                        {cert.agentName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Template */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                                <Library size={12} className="text-indigo-400/70" />
                                                <span className="truncate max-w-[180px]">
                                                    {cert.templateName ?? 'Unknown Template'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                                <Calendar size={12} className="text-slate-600" />
                                                {formatDistanceToNow(new Date(cert.issuedAt), { addSuffix: true })}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/certificates/${cert.id}`}
                                                target="_blank"
                                                className="inline-flex size-8 items-center justify-center rounded-lg border border-[#1f2937] bg-[#1a2332] text-slate-400 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-sm group/btn"
                                            >
                                                <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
