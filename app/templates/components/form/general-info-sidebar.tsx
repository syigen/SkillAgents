"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MultipleSelector } from "@/components/ui/multiple-selector";
import { TemplateFormValues } from "@/lib/validations/template";
import { AiGenerateButton } from "@/components/ui/ai-generate-button";
import { AiKeySetupModal } from "@/components/ai/ai-key-setup-modal";
import { useAiKey } from "@/lib/ai/use-ai-key";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

export function GeneralInfoSidebar({ isEditing }: { isEditing?: boolean }) {
    const { control, setValue, watch, formState } = useFormContext<TemplateFormValues>();
    const [descLoading, setDescLoading] = useState(false);
    const [descError, setDescError] = useState<string | null>(null);
    const [showKeyModal, setShowKeyModal] = useState(false);

    const { hasKey, loading: keyLoading, setSessionKey, saveToDb, getAuthHeaders } = useAiKey();

    const currentDifficulty = watch("difficulty");

    async function runGenerateDescription() {
        const name = watch("name");
        const skills = watch("skills");
        const difficulty = watch("difficulty");

        if (!name) {
            setDescError("Enter a template name first.");
            return;
        }

        setDescLoading(true);
        setDescError(null);

        try {
            const res = await fetch("/api/ai/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ name, skills, difficulty }),
            });
            const data = await res.json();

            if (res.status === 401 && data.error === "NO_AI_KEY") {
                setShowKeyModal(true);
                return;
            }

            if (!res.ok) throw new Error(data.error ?? "AI generation failed");
            setValue("description", data.description, { shouldDirty: true });
        } catch (err: any) {
            setDescError(err.message ?? "Something went wrong");
        } finally {
            setDescLoading(false);
        }
    }

    function handleGenerateDescription() {
        if (!hasKey && !keyLoading) {
            setShowKeyModal(true);
        } else {
            runGenerateDescription();
        }
    }

    return (
        <div className="flex flex-col gap-6 pt-8 pb-10 px-6">
            {showKeyModal && (
                <AiKeySetupModal
                    onClose={() => setShowKeyModal(false)}
                    onSessionKey={(k) => { setSessionKey(k); setShowKeyModal(false); runGenerateDescription(); }}
                    onDbKey={async (k) => { await saveToDb(k); setShowKeyModal(false); runGenerateDescription(); }}
                    onSaved={() => { }}
                />
            )}
            <div className="mb-2">
                {/* Internal Breadcrumb matching screen */}
                <div className="mb-4 text-xs font-semibold tracking-wide text-slate-500 flex items-center gap-2">
                    <span className="cursor-pointer hover:text-slate-300 transition-colors">Templates</span>
                    <span className="text-slate-600">&gt;</span>
                    <span className="text-white">{isEditing ? "Edit Template" : "Create New"}</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    General Info
                </h2>
                <p className="text-sm text-slate-400">
                    Configure the core details of your evaluation template.
                </p>
            </div>

            <div className="space-y-6">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-300">Template Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Senior React Developer Assessment"
                                    className="bg-[#1b253c]/50 border-[#2a364d] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-md h-10 shadow-sm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between mb-1">
                                <FormLabel className="text-sm font-semibold text-slate-300">Description</FormLabel>
                                <AiGenerateButton
                                    variant="inline"
                                    onClick={handleGenerateDescription}
                                    loading={descLoading}
                                    label="Generate"
                                />
                            </div>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the purpose and scope of this evaluation..."
                                    className="min-h-[120px] resize-none bg-[#1b253c]/50 border-[#2a364d] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-md shadow-sm"
                                    {...field}
                                />
                            </FormControl>
                            {descError && (
                                <p className="text-xs text-red-400 mt-1">{descError}</p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-3">
                    <FormField
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-semibold text-slate-300">Status</FormLabel>
                                <FormControl>
                                    <div className="flex bg-[#1b253c]/50 rounded-md p-0.5 border border-[#2a364d] overflow-hidden">
                                        {(["Draft", "Private", "Public"] as const).map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => field.onChange(status.toLowerCase())}
                                                className={`flex-1 rounded-sm py-1.5 text-xs tracking-wide font-medium transition-colors ${field.value === status.toLowerCase()
                                                    ? "bg-[#2563ea] text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-300"
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-3">
                    <FormLabel className="text-sm font-semibold text-slate-300">Difficulty Level</FormLabel>
                    <div className="flex bg-[#1b253c]/50 rounded-md p-0.5 border border-[#2a364d] overflow-hidden">
                        {DIFFICULTIES.map((diff) => (
                            <button
                                key={diff}
                                type="button"
                                onClick={() => setValue("difficulty", diff.toLowerCase() as any, { shouldDirty: true })}
                                className={`flex-1 rounded-sm py-1.5 text-xs tracking-wide font-medium transition-colors ${currentDifficulty === diff.toLowerCase()
                                    ? "bg-[#2563ea] text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-300"
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                <FormField
                    control={control}
                    name="skills"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-300">Skills / Tags</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Add..."
                                    className="bg-[#1b253c]/50 border-[#2a364d] focus-within:ring-blue-500 rounded-md shadow-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Fixed bottom controls */}
            <div className="mt-8 pt-6 border-t border-[#1f2937] flex flex-col gap-3">
                <p className="text-xs text-slate-500 mb-1">Last saved: Just now</p>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 bg-transparent border-[#2a364d] text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 dark:hover:text-white rounded-md">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={formState.isSubmitting}
                        className="flex-1 bg-[#2563ea] hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-900/20 rounded-md font-medium tracking-wide disabled:opacity-50"
                    >
                        {formState.isSubmitting ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
