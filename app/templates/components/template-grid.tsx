"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { TemplateCard } from "./template-card";

export function TemplateGrid({ initialTemplates }: { initialTemplates: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Derived state for filtered templates
    const filteredTemplates = initialTemplates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar Row */}
            <div className="flex items-center justify-between mb-8 gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full bg-[#151b27] border border-[#2a364d] text-slate-200 placeholder:text-slate-500 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[#1b253c]/50 border border-[#2a364d] text-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-[#2a364d]/60 hover:text-white transition-colors">
                        <Filter size={14} /> Filter
                    </button>

                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold tracking-wide rounded-md shadow-sm transition-colors border border-blue-600">
                        All Skills <ChevronDown size={14} />
                    </button>

                    {/* Quick Filters */}
                    <button className="bg-[#1b253c]/50 border border-[#2a364d] text-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-[#2a364d]/60 hover:text-white transition-colors">Java</button>
                    <button className="bg-[#1b253c]/50 border border-[#2a364d] text-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-[#2a364d]/60 hover:text-white transition-colors">React</button>
                    <button className="bg-[#1b253c]/50 border border-[#2a364d] text-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-[#2a364d]/60 hover:text-white transition-colors">Python</button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-[#151b27]/50 rounded-lg border border-dashed border-[#2a364d]">
                        <Search size={32} className="mb-3 text-slate-600" />
                        <p className="font-medium text-slate-400">No templates found.</p>
                        <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
