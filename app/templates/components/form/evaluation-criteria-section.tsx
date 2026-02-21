"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateFormValues } from "./template-form";
import { CriterionCard } from "./criterion-card";

export function EvaluationCriteriaSection() {
    const { control, watch } = useFormContext<TemplateFormValues>();
    const criteria = watch("criteria");

    const { fields, prepend, remove, insert } = useFieldArray({
        control,
        name: "criteria",
    });

    const totalScore = criteria.reduce((sum, item) => sum + (Number(item.minScore) || 0), 0);

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl pt-6 mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                        Evaluation Criteria
                    </h2>
                    <p className="text-sm text-slate-400">
                        Define the specific questions and expected outcomes for this template.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-slate-400 bg-[#151b27]/80 px-4 py-2.5 rounded-md border border-[#2a364d]">
                        Total Score: <span className="text-white font-bold ml-1">{totalScore}</span>
                    </div>
                    <Button
                        type="button"
                        className="bg-white text-slate-900 hover:bg-slate-200 shadow-sm font-medium tracking-wide py-2.5"
                        onClick={() => prepend({ prompt: "", expected: "", minScore: 10 })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Criteria
                    </Button>
                </div>
            </div>

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
