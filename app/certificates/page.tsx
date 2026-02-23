import prisma from "@/lib/prisma";
import { AdminSidebar } from "../components/admin-sidebar";
import { Award } from "lucide-react";
import { CertificateTable } from "../interviews/components/certificate-table";

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
    const certificates = await prisma.certificate.findMany({
        orderBy: { issuedAt: "desc" },
    });

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Page header */}
                <div className="shrink-0 px-6 py-4 border-b border-[#1f2937] bg-[#0d121c] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-amber-400" />
                        <h2 className="text-sm font-bold text-white tracking-wide">Issued Certificates</h2>
                        <span className="text-[10px] text-slate-500 border border-[#1f2937] rounded px-1.5 py-0.5 font-mono">{certificates.length}</span>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-hidden">
                    <CertificateTable
                        certificates={certificates.map(c => ({
                            ...c,
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
