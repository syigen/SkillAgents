import { NextResponse } from "next/server";
import { generateTemplateDescription } from "@/lib/ai/templates";
import { resolveAiKey } from "@/lib/ai/resolve-key";
import { z } from "zod";

const requestSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    skills: z.array(z.string()).optional(),
    difficulty: z.string().optional(),
    model: z.string().optional(),
});

export async function POST(req: Request) {
    const apiKey = await resolveAiKey(req);

    if (!apiKey) {
        return NextResponse.json(
            { error: "NO_AI_KEY", message: "AI key not configured. Please set up your Google AI Studio key." },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const input = requestSchema.parse(body);
        input.model = "gemini-3-flash-preview";
        const description = await generateTemplateDescription(input, apiKey, input.model);
        return NextResponse.json({ description }, { status: 200 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
        }
        console.error("[AI] generate-description error:", error);
        return NextResponse.json({ error: error.message ?? "AI generation failed" }, { status: 500 });
    }
}
