import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";

const updateStepSchema = z.object({
    score: z.number().int().optional(),
    isHumanGraded: z.boolean().optional(),
    humanNote: z.string().optional(),
    content: z.string().optional(),

    // Multi-grading fields
    newGrade: z.object({
        score: z.number().int().min(0).max(100),
        reasoning: z.string(),
        type: z.enum(["Human", "AI"]),
    }).optional(),
    electGradeId: z.string().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ run_id: string, step_id: string }> }
) {
    try {
        const { run_id, step_id } = await params;
        const body = await req.json();

        // Validate payload
        const validatedData = updateStepSchema.parse(body);

        // Fetch the run to ensure it is not locked
        const run = await prisma.run.findUnique({
            where: { id: run_id }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        if (run.isLocked || (run.status !== 'running' && run.status !== 'in_progress')) {
            return NextResponse.json({ success: false, error: "Run is locked or already completed" }, { status: 403 });
        }

        // Fetch step with its grading history
        const step = await prisma.runStep.findUnique({
            where: { id: step_id },
            include: { gradingHistory: { orderBy: { givenAt: 'asc' } } }
        });

        if (!step || step.runId !== run_id) {
            return NextResponse.json({ success: false, error: "Step not found for this run" }, { status: 404 });
        }

        let updatedScore = step.score;
        let updatedHumanNote = step.humanNote;
        let updatedIsHumanGraded = step.isHumanGraded;

        if (validatedData.newGrade) {
            const now = new Date();

            // Demote all existing grades
            await prisma.runStepGrade.updateMany({
                where: { stepId: step_id },
                data: { isElected: false }
            });

            // Create new elected grade
            const newGrade = await prisma.runStepGrade.create({
                data: {
                    stepId: step_id,
                    score: validatedData.newGrade.score,
                    reasoning: validatedData.newGrade.reasoning,
                    type: validatedData.newGrade.type,
                    isElected: true,
                    givenAt: now,
                    electedAt: now,
                }
            });

            updatedScore = newGrade.score;
            updatedHumanNote = newGrade.reasoning;
            updatedIsHumanGraded = newGrade.type === "Human";

        } else if (validatedData.electGradeId) {
            const targetGrade = step.gradingHistory.find(g => g.id === validatedData.electGradeId);
            if (!targetGrade) {
                return NextResponse.json({ success: false, error: "Grade ID not found in history" }, { status: 404 });
            }

            // Demote all, then elect chosen
            await prisma.runStepGrade.updateMany({
                where: { stepId: step_id },
                data: { isElected: false }
            });

            await prisma.runStepGrade.update({
                where: { id: validatedData.electGradeId },
                data: { isElected: true, electedAt: new Date() }
            });

            updatedScore = targetGrade.score;
            updatedHumanNote = targetGrade.reasoning;
            updatedIsHumanGraded = targetGrade.type === "Human";
        }

        // Keep backwards compatibility for direct scalar updates
        if (!validatedData.newGrade && !validatedData.electGradeId) {
            if (validatedData.score !== undefined) updatedScore = validatedData.score;
            if (validatedData.humanNote !== undefined) updatedHumanNote = validatedData.humanNote;
            if (validatedData.isHumanGraded !== undefined) updatedIsHumanGraded = validatedData.isHumanGraded;
        }

        // Apply scalar updates to the step
        const updatedStep = await prisma.runStep.update({
            where: { id: step_id },
            data: {
                score: updatedScore,
                isHumanGraded: updatedIsHumanGraded,
                humanNote: updatedHumanNote,
                ...(validatedData.content !== undefined && { content: validatedData.content }),
            },
            include: {
                gradingHistory: { orderBy: { givenAt: 'asc' } }
            }
        });

        // Serialize gradingHistory to match the old JSON shape for client compatibility
        const stepWithHistory = {
            ...updatedStep,
            gradingHistory: updatedStep.gradingHistory.map(g => ({
                id: g.id,
                score: g.score,
                reasoning: g.reasoning,
                type: g.type,
                isElected: g.isElected,
                givenAt: g.givenAt.toISOString(),
                electedAt: g.electedAt.toISOString(),
            })),
        };

        return NextResponse.json({
            success: true,
            step: stepWithHistory
        }, { status: 200 });

    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error updating run step:", error);
        return NextResponse.json({ success: false, error: "Failed to update step" }, { status: 500 });
    }
}
