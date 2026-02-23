import { NextResponse } from "next/server";
import { AiService } from "@/lib/ai/service";
import { resolveAiKey } from "@/lib/ai/resolve-key";
import { z } from "zod";
import { DEFAULT_MODEL } from "@/lib/ai/models";

const requestSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    difficulty: z.string().optional(),
    count: z.number().int().min(1).max(20).optional(),
    model: z.string().optional(),
});

export async function POST(req: Request) {
    // Clone before resolveAiKey reads the body (it only reads headers, but clone is safe practice)
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
        input.model = DEFAULT_MODEL;
        const aiService = new AiService(apiKey, input.model);
        const criteria = await aiService.generateTemplateCriteria(input);
        return NextResponse.json({ criteria }, { status: 200 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
        }
        console.error("[AI] generate-criteria error:", error);
        return NextResponse.json({ error: error.message ?? "AI generation failed" }, { status: 500 });
    }
}
