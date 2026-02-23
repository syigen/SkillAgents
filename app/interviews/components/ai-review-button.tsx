"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiKey } from "@/lib/ai/use-ai-key";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export function AiGradeButton({
    runId,
    stepId,
    questionIndex,
    isLocked = false,
}: {
    runId: string;
    stepId: string;
    questionIndex: number;
    isLocked?: boolean;
}) {
    const router = useRouter();
    const { hasKey, getAuthHeaders } = useAiKey();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isLocked) return null;

    const handleGrade = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/ai/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    runId,
                    stepId,
                    questionIndex,
                    model: DEFAULT_MODEL,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.error === "NO_AI_KEY") {
                    throw new Error("Configure your AI key in Settings first.");
                }
                throw new Error(data.error || "AI grading failed");
            }

            // Refresh the page to show updated grades
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <Button
                onClick={handleGrade}
                disabled={loading}
                variant="outline"
                size="sm"
                className="h-8 px-3 border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10 font-semibold text-xs flex items-center gap-1.5"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={13} />
                ) : (
                    <Sparkles size={13} />
                )}
                {loading ? "Grading…" : "AI Grade"}
            </Button>
            {error && (
                <span className="text-red-400 text-[10px] max-w-[180px] text-center">{error}</span>
            )}
        </div>
    );
}
