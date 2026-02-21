"use client";

import { useFormContext } from "react-hook-form";
import { Copy, Trash2 } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TemplateFormValues } from "./template-form";

interface CriterionCardProps {
    index: number;
    onDelete: () => void;
    onDuplicate: () => void;
}

export function CriterionCard({ index, onDelete, onDuplicate }: CriterionCardProps) {
    const { control } = useFormContext<TemplateFormValues>();

    return (
        <div className="rounded-xl border border-[#2a364d] bg-[#151b27] overflow-hidden">
            <div className="flex flex-col lg:flex-row p-6 gap-6">

                {/* Left main text inputs */}
                <div className="flex-1 space-y-6">
                    <FormField
                        control={control}
                        name={`criteria.${index}.prompt`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel className="text-xs font-semibold tracking-widest text-[#94a3b8] uppercase">
                                        Prompt / Question
                                    </FormLabel>
                                    <span className="text-xs text-[#94a3b8] font-bold tracking-wider">#{index + 1}</span>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter the question or prompt here..."
                                        className="min-h-[50px] resize-none bg-[#1F2937]/50 border-[#2a364d] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-md shadow-sm"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`criteria.${index}.expected`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="mb-2">
                                    <FormLabel className="text-xs font-semibold tracking-widest text-[#94a3b8] uppercase">
                                        Expected Outcome
                                    </FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe what a correct answer includes..."
                                        className="min-h-[50px] resize-none bg-[#1F2937]/50 border-[#2a364d] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500 rounded-md shadow-sm"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Right side constraints & actions */}
                <div className="w-full lg:w-[220px] shrink-0 border-t border-[#1f2937] lg:border-t-0 lg:border-l lg:border-[#1f2937] lg:pl-6 pt-6 lg:pt-0 flex flex-col justify-between">
                    <div>
                        <FormField
                            control={control}
                            name={`criteria.${index}.minScore`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="mb-2">
                                        <FormLabel className="text-xs font-semibold tracking-widest text-[#94a3b8] uppercase">
                                            Max Score
                                        </FormLabel>
                                    </div>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={1}
                                                className="bg-[#1b253c]/50 border-[#2a364d] text-slate-100 focus-visible:ring-blue-500 text-center font-bold pr-8 rounded-md h-10 shadow-sm"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
                                            pts
                                        </span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 lg:mt-0">
                        <button
                            type="button"
                            onClick={onDuplicate}
                            className="p-2 text-slate-400 hover:text-white hover:bg-[#1b253c] rounded transition-colors"
                            title="Duplicate"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-[#1b253c] rounded transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
