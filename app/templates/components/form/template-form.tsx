"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { GeneralInfoSidebar } from "./general-info-sidebar";
import { EvaluationCriteriaSection } from "./evaluation-criteria-section";

// Zod schema reflecting the `TemplateCreate` Pydantic model
import { useRouter } from "next/navigation";
import { templateFormSchema, type TemplateFormValues } from "@/lib/validations/template";

export function TemplateForm({ initialData }: { initialData?: any }) {
    const form = useForm<z.infer<typeof templateFormSchema>>({
        resolver: zodResolver(templateFormSchema) as any,
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description || "",
            skills: initialData.skills || [],
            difficulty: initialData.difficulty as any,
            status: initialData.status as any,
            criteria: initialData.criteria.map((c: any) => ({
                prompt: c.prompt,
                expected: c.expected,
                minScore: c.minScore,
            })),
        } : {
            name: "",
            description: "",
            skills: [],
            difficulty: "medium",
            status: "draft",
            criteria: [
                {
                    prompt: "Explain the virtual DOM in React.",
                    expected: "Candidate should mention reconciliation, diffing algorithm, and performance benefits over direct DOM manipulation.",
                    minScore: 10,
                },
                {
                    prompt: "Implement a custom hook useFetch.",
                    expected: "Must handle loading, error, and data states. Should include cleanup function for component unmount.",
                    minScore: 15,
                }
            ],
        },
    });

    const router = useRouter();

    async function onSubmit(data: TemplateFormValues) {
        try {
            const url = initialData ? `/api/templates/${initialData.id}` : "/api/templates";
            const method = initialData ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${initialData ? 'update' : 'save'} template`);
            }

            alert(`Template ${initialData ? 'updated' : 'saved'} successfully!`);
            router.push(initialData ? `/templates/${initialData.id}` : "/templates");
            router.refresh();
        } catch (error: any) {
            console.error(`Error ${initialData ? 'updating' : 'saving'} template:`, error);
            alert("Error: " + error.message);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full h-full flex-col lg:flex-row">

                {/* Left Sidebar - General Info */}
                <div className="w-full lg:w-[320px] shrink-0 border-r border-[#1f2937] bg-[#151b27] overflow-y-auto">
                    <GeneralInfoSidebar isEditing={!!initialData} />
                </div>

                {/* Right Content - Evaluation Criteria */}
                <div className="flex-1 bg-[#0f131d] overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <EvaluationCriteriaSection />
                </div>
            </form>
        </Form>
    );
}
