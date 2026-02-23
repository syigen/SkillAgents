import * as z from "zod";

export const templateFormSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    skills: z.array(z.string()),
    difficulty: z.enum(["easy", "medium", "hard", "expert"]),
    status: z.enum(["private", "public", "draft"]).default("draft"),
    criteria: z.array(
        z.object({
            prompt: z.string().min(1, "Prompt is required"),
            expected: z.string().min(1, "Expected outcome is required"),
            minScore: z.number().min(0, "Min score must be 0 or greater").default(10),
            skills: z.array(z.string()).optional(),
        })
    ).default([]),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
