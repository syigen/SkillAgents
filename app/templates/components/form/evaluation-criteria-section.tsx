"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateFormValues } from "@/lib/validations/template";
import { CriterionCard } from "./criterion-card";
import { AiGenerateButton } from "@/components/ui/ai-generate-button";
import { AiKeySetupModal } from "@/components/ai/ai-key-setup-modal";
import { useAiKey } from "@/lib/ai/use-ai-key";

export function EvaluationCriteriaSection() {
    const { control, watch } = useFormContext<TemplateFormValues>();
    const criteria = watch("criteria");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [showKeyModal, setShowKeyModal] = useState(false);

    const { hasKey, loading: keyLoading, setSessionKey, saveToDb, getAuthHeaders } = useAiKey();

    const { fields, prepend, remove, insert, replace } = useFieldArray({
        control,
        name: "criteria",
    });

    const totalScore = criteria.reduce((sum, item) => sum + (Number(item.minScore) || 0), 0);

    async function runGeneration() {
        const name = watch("name");
        const description = watch("description");
        const skills = watch("skills");
        const difficulty = watch("difficulty");

        if (!name) {
            setAiError("Please enter a template name first.");
            return;
        }

        setAiLoading(true);
        setAiError(null);

        try {
            const res = await fetch("/api/ai/generate-criteria", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ name, description, skills, difficulty, count: 5 }),
            });

            const data = await res.json();

            if (res.status === 401 && data.error === "NO_AI_KEY") {
                setShowKeyModal(true);
                return;
            }

            if (!res.ok) throw new Error(data.error ?? "AI generation failed");

            replace(data.criteria);
        } catch (err: any) {
            setAiError(err.message ?? "Something went wrong");
        } finally {
            setAiLoading(false);
        }
    }

    function handleAiButtonClick() {
        if (!hasKey && !keyLoading) {
            setShowKeyModal(true);
        } else {
            runGeneration();
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl pt-6 mx-auto">
            {showKeyModal && (
                <AiKeySetupModal
                    onClose={() => setShowKeyModal(false)}
                    onSessionKey={(k) => { setSessionKey(k); setShowKeyModal(false); runGeneration(); }}
                    onDbKey={async (k) => { await saveToDb(k); setShowKeyModal(false); runGeneration(); }}
                    onSaved={() => { }}
                />
            )}

            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                        Evaluation Criteria
                    </h2>
                    <p className="text-sm text-slate-400">
                        Define the specific questions and expected outcomes for this template.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-slate-400 bg-[#151b27]/80 px-4 py-2.5 rounded-md border border-[#2a364d]">
                        Total Score: <span className="text-white font-bold ml-1">{totalScore}</span>
                    </div>
                    <AiGenerateButton
                        onClick={handleAiButtonClick}
                        loading={aiLoading}
                        label="Generate with AI"
                    />
                    <Button
                        type="button"
                        className="bg-white text-slate-900 hover:bg-slate-200 shadow-sm font-medium tracking-wide py-2.5"
                        onClick={() => prepend({ prompt: "", expected: "", minScore: 10 })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Criteria
                    </Button>
                </div>
            </div>

            {aiError && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {aiError}
                </div>
            )}

            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => prepend({ prompt: "", expected: "", minScore: 10 })}
                    className="w-full rounded-xl border-2 border-dashed border-[#2a364d] bg-transparent py-4 text-sm font-medium text-slate-400 hover:text-slate-300 hover:bg-[#1b253c]/30 hover:border-[#374563] transition-colors flex items-center justify-center"
                >
                    <Plus className="mr-2 h-4 w-4 bg-slate-600 text-slate-200 rounded-full p-0.5" /> Add another criteria row
                </button>

                {fields.map((field, index) => (
                    <CriterionCard
                        key={field.id}
                        index={index}
                        onDelete={() => remove(index)}
                        onDuplicate={() => {
                            const currentItem = criteria[index];
                            insert(index + 1, { ...currentItem });
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
