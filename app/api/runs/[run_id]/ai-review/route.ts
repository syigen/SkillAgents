import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveAiKey } from "@/lib/ai/resolve-key";
import { AiService } from "@/lib/ai/service";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const apiKey = await resolveAiKey(req);
        if (!apiKey) {
            return NextResponse.json(
                { error: "NO_AI_KEY", message: "AI key not configured. Please set up your Google AI Studio key." },
                { status: 401 }
            );
        }

        const { run_id } = await params;
        const body = await req.json();
        const { stepId, questionIndex, model: requestModel } = body;
        const model = requestModel || DEFAULT_MODEL;

        if (!stepId) {
            return NextResponse.json({ error: "stepId is required" }, { status: 400 });
        }

        // Fetch run with template, criteria, and the target step
        const run = await prisma.run.findUnique({
            where: { id: run_id },
            include: {
                template: {
                    include: { criteria: { orderBy: { createdAt: "asc" } } },
                },
                steps: { orderBy: { timestamp: "asc" } },
            },
        });

        if (!run) {
            return NextResponse.json({ error: "Run not found" }, { status: 404 });
        }

        // Find the question (interviewer step) and agent answer
        const interviewerSteps = run.steps.filter((s) => s.role === "interviewer");
        const agentSteps = run.steps.filter((s) => s.role === "agent");
        const qIdx = questionIndex ?? 0;

        const question = interviewerSteps[qIdx];
        const answer = agentSteps[qIdx];

        if (!answer) {
            return NextResponse.json({ error: "No agent response found for this question" }, { status: 400 });
        }

        const templateSkills: string[] = Array.isArray(run.template.skills)
            ? (run.template.skills as any[]).map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean)
            : [];

        const criterion = run.template.criteria[qIdx];

        // Call Gemini for single-question grading
        const aiService = new AiService(apiKey, model);
        const grade = await aiService.generateQuestionGrade({
            templateName: run.template.name,
            templateDescription: run.template.description ?? undefined,
            skills: templateSkills,
            difficulty: run.template.difficulty,
            questionIndex: qIdx,
            prompt: question?.content ?? "",
            expected: criterion?.expected ?? undefined,
            agentAnswer: answer.content,
        });

        // Save the grade via the existing grading mechanism
        const now = new Date();

        // Demote existing grades
        await prisma.runStepGrade.updateMany({
            where: { stepId },
            data: { isElected: false },
        });

        // Create new elected AI grade
        const newGrade = await prisma.runStepGrade.create({
            data: {
                stepId,
                score: grade.score,
                reasoning: grade.reasoning,
                type: "AI",
                isElected: true,
                givenAt: now,
                electedAt: now,
            },
        });

        // Update step's scalar fields
        await prisma.runStep.update({
            where: { id: stepId },
            data: {
                score: grade.score,
                isHumanGraded: false,
                humanNote: grade.reasoning,
            },
        });

        return NextResponse.json({
            grade: {
                id: newGrade.id,
                score: grade.score,
                reasoning: grade.reasoning,
                type: "AI",
                isElected: true,
                givenAt: now.toISOString(),
                electedAt: now.toISOString(),
            },
        }, { status: 200 });
    } catch (error: any) {
        console.error("[AI] question grade error:", error);
        return NextResponse.json(
            { error: error.message ?? "AI grading failed" },
            { status: 500 }
        );
    }
}
