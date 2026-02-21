"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateRunStatus } from "@/lib/store/runsSlice";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
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

type Criterion = {
    prompt: string;
    expected: string;
    minScore: number;
};

export function FinishInterviewButton({
    runId,
    steps,
    criteria,
    skills,
    onSuccess
}: {
    runId: string;
    steps: StepData[];
    criteria: Criterion[];
    skills: any[];
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFinish = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Separate agent steps to get their scores
            const agentSteps = steps.filter(s => s.role === 'agent');

            if (agentSteps.length === 0) {
                throw new Error("Cannot evaluate an interview with no agent responses.");
            }

            // 2. Prepare evaluation payload
            const perQuestion = agentSteps.map((step, idx) => ({
                question_index: idx,
                score: step.score ?? 0,
                max_score: 100,
                feedback: step.humanNote ?? ""
            }));

            const overall = Math.round(
                perQuestion.reduce((sum, q) => sum + q.score, 0) / perQuestion.length
            );

            // Populate per_skill scores
            // For now, we apply the overall score to all template skills
            const perSkill: Record<string, number> = {};
            skills.forEach(skill => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                if (skillName) {
                    perSkill[skillName] = overall;
                }
            });

            const payload = {
                overall,
                pass_threshold: 70, // Default pass threshold
                per_skill: perSkill,
                skill_threshold: 70,
                per_question: perQuestion
            };

            const res = await fetch(`/api/runs/${runId}/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to finalize evaluation");
            }

            const data = await res.json();

            // Update local Redux state immediately
            dispatch(updateRunStatus({
                id: runId,
                status: data.status,
                score: data.score,
                isLocked: data.isLocked
            }));

            // Successfully evaluated
            if (onSuccess) onSuccess();
            else router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        disabled={loading}
                        variant="outline"
                        className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 font-semibold flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Flag size={16} />}
                        Finish & Evaluate
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0f131d] border-[#1f2937] text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Finish and evaluate interview?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 text-sm">
                            This will calculate the final aggregate score across all questions and lock the transcript.
                            If the candidate passes, you'll be able to issue a digital certificate.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-transparent border-[#1f2937] text-slate-300 hover:bg-[#1a2332] hover:text-white">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleFinish}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                        >
                            Yes, Finish Evaluation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {error && <span className="text-red-400 text-[10px]">{error}</span>}
        </div>
    );
}
