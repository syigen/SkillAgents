import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { AdminSidebar } from "../components/admin-sidebar";
import { Activity } from "lucide-react";
import { InterviewTable } from "./components/interview-table";

export default async function InterviewsPage() {
    const runs = await prisma.run.findMany({
        orderBy: { timestamp: "desc" },
        include: { agent: true, template: true, certificate: true },
    });

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Compact page header */}
                <div className="shrink-0 px-6 py-4 border-b border-[#1f2937] bg-[#0d121c] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-indigo-400" />
                        <h2 className="text-sm font-bold text-white tracking-wide">Interview Sessions</h2>
                        <span className="text-[10px] text-slate-500 border border-[#1f2937] rounded px-1.5 py-0.5 font-mono">{runs.length}</span>
                    </div>
                </div>

                {/* Full-width Table */}
                <div className="flex-1 overflow-hidden">
                    <InterviewTable
                        runs={runs.map(r => ({
                            ...r,
                            timestamp: r.timestamp,
                            hasCertificate: !!r.certificate
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
