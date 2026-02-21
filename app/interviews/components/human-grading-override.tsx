"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PencilLine, Loader2, Check, Sparkles, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function HumanGradingOverride({
    runId,
    stepId,
    currentScore,
    currentNote,
    isLocked,
    isHumanGraded,
    gradingHistory
}: {
    runId: string,
    stepId: string,
    currentScore?: number | null,
    currentNote?: string | null,
    isLocked: boolean,
    isHumanGraded?: boolean,
    gradingHistory?: any
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [score, setScore] = useState(currentScore ?? "");
    const [note, setNote] = useState(currentNote ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsedHistory = Array.isArray(gradingHistory) ? gradingHistory : [];

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                newGrade: {
                    score: score !== "" ? Number(score) : 0,
                    reasoning: note,
                    type: "Human"
                }
            };

            const res = await fetch(`/api/runs/${runId}/steps/${stepId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save override");
            }

            setIsOpen(false);
            setScore("");
            setNote("");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleElectGrade = async (gradeId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/runs/${runId}/steps/${stepId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ electGradeId: gradeId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to elect grade");
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Compute pill color based on score
    const scoreColor = (() => {
        if (currentScore === null || currentScore === undefined) return null;
        if (currentScore >= 85) return {
            bg: 'bg-[#0c2e16]', border: 'border-emerald-500/30', text: 'text-emerald-400', divider: 'bg-emerald-500/20'
        };
        if (currentScore >= 70) return {
            bg: 'bg-[#2e1d05]', border: 'border-yellow-500/30', text: 'text-yellow-400', divider: 'bg-yellow-500/20'
        };
        return {
            bg: 'bg-[#2c0b0e]', border: 'border-red-500/30', text: 'text-red-400', divider: 'bg-red-500/20'
        };
    })();

    if (isLocked && scoreColor) {
        return (
            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-lg ${scoreColor.bg} ${scoreColor.border} ${scoreColor.text}`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    {isHumanGraded ? <PencilLine size={14} /> : <Sparkles size={14} />}
                    {isHumanGraded ? 'Human Graded' : 'AI Graded'}
                </span>
                <div className={`w-px h-3 ${scoreColor.divider}`} />
                <span className="font-mono font-bold">{currentScore}/100</span>
                <span className="text-[11px] text-current/60 italic ml-1">locked</span>
            </div>
        );
    }

    if (!isOpen) {
        if (scoreColor) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-lg relative transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${scoreColor.bg} ${scoreColor.border} ${scoreColor.text}`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        {isHumanGraded ? <PencilLine size={14} /> : <Sparkles size={14} />}
                        {isHumanGraded ? 'Human Graded' : 'AI Graded'}
                    </span>
                    <div className={`w-px h-3 ${scoreColor.divider} opacity-60`} />
                    <span className="font-mono font-bold">{currentScore}/100</span>
                    <ChevronDown size={16} className="transition-transform duration-300" />
                </button>
            );
        }

        // No score yet — just a quiet "add grade" link
        if (!isLocked) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f2937] text-slate-500 hover:text-slate-300 hover:border-[#2a364d] text-xs transition-all"
                >
                    <PencilLine size={12} /> Add Grade
                </button>
            );
        }

        return null;
    }

    return (
        <div className="mt-4 border border-[#2a364d]/60 bg-[#151b27]/80 rounded-xl overflow-hidden shadow-sm">
            {/* History List Header */}
            <div className="bg-[#1b253c]/50 p-4 border-b border-[#2a364d]/60 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Evaluation History</h4>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronDown size={16} className="rotate-180" />
                </button>
            </div>

            {/* History Items */}
            {parsedHistory.length > 0 ? (
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {parsedHistory.map((item: any) => (
                        <div key={item.id} className={`p-4 rounded-lg border ${item.isElected ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-[#2a364d]/60 bg-[#0f131d]/50'} relative`}>
                            {item.isElected && (
                                <div className="absolute -top-2.5 -right-2.5 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Elected
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
                                    {/* Badge */}
                                    {item.type === 'AI' ? (
                                        <div className="inline-flex items-center gap-1.5 text-[#eab308] text-[10px] font-bold uppercase tracking-wider bg-[#3F2B00]/40 border border-[#b48600]/30 rounded-full px-2.5 py-1">
                                            <Sparkles size={12} /> AI Graded
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                                            <PencilLine size={12} /> Human Graded
                                        </div>
                                    )}
                                    <div className="text-slate-200 font-bold">{item.score !== null && item.score !== undefined ? `${item.score}/100 PTS` : 'No Score'}</div>
                                </div>

                                {!item.isElected && !isLocked && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[10px] px-2.5 bg-transparent border-[#2a364d] text-slate-400 hover:text-white hover:bg-[#2a364d]"
                                        onClick={() => handleElectGrade(item.id)}
                                        disabled={loading}
                                    >
                                        Select Grade
                                    </Button>
                                )}
                            </div>

                            <div className="text-[11px] text-slate-500 mb-3 flex flex-wrap gap-x-4 gap-y-1 bg-[#0f131d]/50 p-2 rounded-md font-mono">
                                <span>Given: {new Date(item.givenAt).toLocaleString()}</span>
                                {item.isElected && (
                                    <span>Elected: {new Date(item.electedAt).toLocaleString()}</span>
                                )}
                            </div>

                            <div className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                                <ReactMarkdown>{item.reasoning}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-slate-500 text-sm border-b border-[#2a364d]/60">
                    No grading history exists for this response.
                </div>
            )}

            {/* Add New Grade Form */}
            {!isLocked && (
                <div className="p-5 border-t border-[#2a364d]/60 bg-[#0f131d]/30">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Add Manual Override</h4>
                    <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="w-full md:w-32 shrink-0">
                            <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider mb-1.5 block">Score</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="bg-[#151b27] border-[#2a364d] text-white h-[38px] px-3 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-lg placeholder-slate-500"
                                placeholder="e.g. 80"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider mb-1.5 block">Reasoning (Markdown)</label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="bg-[#151b27] border-[#2a364d] text-white resize-none h-[38px] min-h-[80px] py-2 px-3 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-lg placeholder-slate-500"
                                placeholder="Write your assessment (supports markdown)..."
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-xs px-1 mt-3">{error}</div>}

                    <div className="flex justify-end items-center mt-4">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={loading || (!score && score !== '0')}
                            className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold px-4 h-9 rounded-md transition-colors shadow-sm"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Check size={16} className="mr-1.5 stroke-[3]" />}
                            Save New Grade
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
