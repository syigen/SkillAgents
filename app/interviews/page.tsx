import prisma from "@/lib/prisma";
import { AdminSidebar } from "../components/admin-sidebar";
import { Activity } from "lucide-react";
import { InterviewGrid } from "./components/interview-grid";

export default async function InterviewsPage() {
    // 1. Fetch runs/interviews from the database containing agent and template info
    const runs = await prisma.run.findMany({
        orderBy: {
            timestamp: "desc",
        },
        include: {
            agent: true,
            template: true,
        },
    });

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Header Section */}
                <div className="shrink-0 px-8 py-8 border-b border-[#2a364d] bg-[#0f131d]/90 backdrop-blur-sm z-10 hidden md:flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                                <Activity className="text-indigo-500" size={28} />
                                Interview Sessions
                            </h2>
                        </div>
                        <p className="text-slate-400 text-sm tracking-wide">
                            Monitor live interview runs, view completed scores, and audit AI agent responses in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-sm border border-[#2a364d] rounded-md px-4 py-2 text-slate-400 font-medium">
                            Total Runs: <span className="text-white ml-2">{runs.length}</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 md:py-10 pb-20">
                    <InterviewGrid runs={runs} />
                </div>
            </div>
        </div>
    );
}
