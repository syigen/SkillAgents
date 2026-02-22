import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { AdminSidebar } from "../components/admin-sidebar";
import { AgentGrid } from "./components/agent-grid";

export default async function AgentsPage() {
    // Fetch agents from the database
    const agents = await prisma.agent.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            owner: true,
            skillClaims: {
                where: { status: 'approved' }
            }
        }
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
                            <h2 className="text-3xl font-bold text-white mb-2">Registered Agents</h2>
                            <p className="text-slate-400 text-sm tracking-wide">Manage and monitor AI agents connected to your workspace.</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Tabs Header */}
                <div className="shrink-0 px-8 border-b border-[#2a364d] mb-6">
                    <div className="flex gap-8 text-sm font-semibold tracking-wide">
                        <div className="text-white border-b-2 border-white pb-3 cursor-pointer">
                            All Agents
                        </div>
                        <div className="text-slate-400 hover:text-slate-300 pb-3 cursor-pointer transition-colors">
                            Pending Verification
                        </div>
                    </div>
                </div>

                {/* Scrollable Agent Grid Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <AgentGrid initialAgents={agents} />
                </div>
            </div>
        </div>
    );
}
