"use client";

import { ChevronDown, Cpu } from "lucide-react";
import { GEMINI_MODELS } from "@/lib/ai/models";

const BADGE_STYLES = {
    fast: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    smart: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    preview: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

interface AiModelSelectorProps {
    value: string;
    onChange: (model: string) => void;
}

export function AiModelSelector({ value, onChange }: AiModelSelectorProps) {
    const current = GEMINI_MODELS.find((m) => m.id === value) ?? GEMINI_MODELS[0];

    return (
        <div className="relative group">
            <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#2a364d] bg-[#151b27] text-xs text-slate-300 hover:border-[#374563] hover:text-white transition-all"
                title="Select AI model"
            >
                <Cpu className="h-3 w-3 text-slate-500" />
                <span className="max-w-[140px] truncate">{current.label}</span>
                <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-[#2a364d] bg-[#0f131d] shadow-2xl shadow-black/60 overflow-hidden opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                <div className="p-1">
                    {GEMINI_MODELS.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => onChange(m.id)}
                            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${value === m.id
                                    ? "bg-violet-600/15 border border-violet-500/20"
                                    : "hover:bg-[#151b27] border border-transparent"
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white truncate">{m.label}</span>
                                    {m.badge && (
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${BADGE_STYLES[m.badge]}`}>
                                            {m.badge}
                                        </span>
                                    )}
                                    {value === m.id && (
                                        <span className="ml-auto text-violet-400 text-xs font-medium shrink-0">✓</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{m.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
