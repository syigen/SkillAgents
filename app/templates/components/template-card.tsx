import { BarChart, Clock, MoreVertical, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TemplateCard({ template }: { template: any }) {
    // Generate some deterministic initials based on ID 
    const hash = template.id.charCodeAt(0) + template.id.charCodeAt(template.id.length - 1);
    const mockInitials = [
        ["JD", "bg-indigo-600"],
        ["RC", "bg-sky-600"],
        ["CS", "bg-rose-600"],
        ["K8", "bg-purple-600"],
        ["DB", "bg-slate-600"],
        ["PY", "bg-amber-600"],
    ][hash % 6];

    return (
        <Link
            href={`/templates/${template.id}`}
            className="bg-[#151b27] border border-[#2a364d] rounded-lg p-5 flex flex-col justify-between hover:border-[#374563] transition-colors group cursor-pointer block"
        >
            <div className="flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[#1b253c]/50 border border-[#2a364d] rounded-full px-2.5 py-1">
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${template.status === "public" ? "bg-emerald-500" :
                                        template.status === "private" ? "bg-amber-500" :
                                            "bg-slate-400"
                                    }`}
                            />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                                {template.status}
                            </span>
                        </div>
                    </div>
                    <button
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        onClick={(e) => { e.preventDefault(); /* Prevent navigation when clicking options */ }}
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>

                {/* Content */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {template.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-[40px]">
                        {template.description || "No description provided for this evaluation template."}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-1 mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <BarChart size={14} className="text-slate-500" />
                        <span className="capitalize">{template.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <Clock size={14} className="text-slate-500" />
                        <span>45 min</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1f2937]/80">
                <div className="flex -space-x-2">
                    <div className={`w-7 h-7 rounded-full ${mockInitials[1]} flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#151b27]`}>
                        {mockInitials[0]}
                    </div>
                    {(hash % 2 === 0) && (
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border-2 border-[#151b27]">
                            +2
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-blue-500 text-sm font-semibold tracking-wide group-hover:gap-2 transition-all">
                    Details <ArrowRight size={16} />
                </div>
            </div>
        </Link>
    );
}
