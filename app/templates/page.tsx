import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { AdminSidebar } from "../components/admin-sidebar";
import { TemplateGrid } from "./components/template-grid";

export default async function TemplatesPage() {
    // Fetch templates from the database
    const templates = await prisma.template.findMany({
        orderBy: { lastUpdated: 'desc' },
        include: { criteria: true },
    });

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            {/* Left Nav */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Fixed Top Header */}
                <div className="shrink-0 px-8 pt-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Template Management</h2>
                            <p className="text-slate-400 text-sm tracking-wide">Manage and organize your evaluation templates.</p>
                        </div>
                        <a
                            href="/templates/create"
                            className="bg-[#2563ea] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center text-sm tracking-wide"
                        >
                            + Create New
                        </a>
                    </div>
                </div>

                {/* Sub-Tabs Header (also fixed at top of content area) */}
                <div className="shrink-0 px-8 border-b border-[#2a364d] mb-6">
                    <div className="flex gap-8 text-sm font-semibold tracking-wide">
                        <div className="text-white border-b-2 border-white pb-3 cursor-pointer">
                            My Templates
                        </div>
                        <div className="text-slate-400 hover:text-slate-300 pb-3 cursor-pointer transition-colors">
                            Public Templates
                        </div>
                        <div className="text-slate-400 hover:text-slate-300 pb-3 cursor-pointer transition-colors">
                            Drafts
                        </div>
                    </div>
                </div>

                {/* Scrollable Template Grid Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <TemplateGrid initialTemplates={templates} />
                </div>
            </div>
        </div>
    );
}
