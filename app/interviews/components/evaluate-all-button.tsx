"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateRunStatus } from "@/lib/store/runsSlice";
import { useAiKey } from "@/lib/ai/use-ai-key";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";

type StepData = {
    id: string;
    role: string;
    content: string;
    score: number | null;
    humanNote: string | null;
    isHumanGraded: boolean;
    timestamp: string;
};

export function EvaluateAllButton({
    runId,
    steps,
}: {
    runId: string;
    steps: StepData[];
}) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { getAuthHeaders } = useAiKey();

    const [loading, setLoading] = useState(false);
    const [progressLabel, setProgressLabel] = useState("");
    const [progressPercent, setProgressPercent] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const abortRef = useRef<boolean>(false);

    const handleEvaluateAll = async () => {
        setLoading(true);
        setError(null);
        setIsOpen(true);
        setProgressPercent(0);
        abortRef.current = false;

        try {
            const agentSteps = steps.filter(s => s.role === 'agent');

            if (agentSteps.length === 0) {
                throw new Error("Cannot evaluate an interview with no agent responses.");
            }

            // Step 1: Grade individual questions sequentially
            for (let i = 0; i < agentSteps.length; i++) {
                if (abortRef.current) {
                    throw new Error("Evaluation aborted by user.");
                }

                const step = agentSteps[i];
                const percent = Math.round((i / agentSteps.length) * 100);
                setProgressPercent(percent);

                if (!step.isHumanGraded && step.score === null) {
                    setProgressLabel(`Grading question ${i + 1} of ${agentSteps.length}...`);

                    const res = await fetch(`/api/ai/evaluate`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeaders(),
                        },
                        body: JSON.stringify({
                            runId,
                            stepId: step.id,
                            questionIndex: i,
                            model: DEFAULT_MODEL,
                        }),
                    });

                    if (!res.ok) {
                        const data = await res.json();
                        if (data.error === "NO_AI_KEY") {
                            throw new Error("Configure your AI key in Settings first.");
                        }
                        throw new Error(data.error || `Failed to grade question ${i + 1}`);
                    }

                    // Force a refresh so the UI updates as it goes
                    router.refresh();
                }
            }

            if (abortRef.current) {
                throw new Error("Evaluation aborted by user.");
            }

            // Step 2: Generate final full evaluation
            setProgressPercent(95);
            setProgressLabel("Generating Final Score...");
            const res = await fetch(`/api/runs/${runId}/ai-evaluate-full`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({})
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.error === "NO_AI_KEY") {
                    throw new Error("Configure your AI key in Settings first.");
                }
                throw new Error(data.error || "Failed to generate full evaluation");
            }

            const data = await res.json();

            // Store updates, but isLocked should remain false
            dispatch(updateRunStatus({
                id: runId,
                status: data.status,
                score: data.score,
                isLocked: data.isLocked
            }));

            setProgressPercent(100);
            router.refresh();
        } catch (err: any) {
            setError(err.message === "Evaluation aborted by user." ? null : err.message);
        } finally {
            setLoading(false);
            setProgressLabel("");
            setIsOpen(false);
        }
    };

    const handleAbort = () => {
        abortRef.current = true;
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <Button
                onClick={handleEvaluateAll}
                disabled={loading}
                variant="outline"
                className="border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 font-semibold flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Evaluate All
            </Button>

            <AlertDialog open={isOpen} onOpenChange={(val) => !loading && setIsOpen(val)}>
                <AlertDialogContent className="bg-[#0f131d] border-[#1f2937] text-white max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Sparkles className="text-violet-400" size={18} />
                            Evaluating Interview
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 text-sm">
                            {progressLabel || "Initializing AI models..."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-[#1a2332] rounded-full overflow-hidden my-4 relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-violet-500 transition-all duration-300 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <AlertDialogFooter className="sm:justify-center">
                        <Button
                            variant="destructive"
                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:hover:text-red-400 w-full flex items-center gap-2"
                            onClick={handleAbort}
                        >
                            <XCircle size={16} /> Stop Evaluation
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {error && <span className="text-red-400 text-[10px]">{error}</span>}
        </div>
    );
}
