import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";
import { randomUUID } from "crypto";

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

        if (run.isLocked) {
            return NextResponse.json({ success: false, error: "Run is locked because a certificate has been issued" }, { status: 403 });
        }

        // Check if the step exists and belongs to the run
        const step = await prisma.runStep.findUnique({
            where: { id: step_id }
        });

        if (!step || step.runId !== run_id) {
            return NextResponse.json({ success: false, error: "Step not found for this run" }, { status: 404 });
        }

        let currentHistory: any[] = Array.isArray(step.gradingHistory) ? step.gradingHistory : (
            typeof step.gradingHistory === 'string' ? JSON.parse(step.gradingHistory) : []
        );
        let updatedScore = step.score;
        let updatedHumanNote = step.humanNote;
        let updatedIsHumanGraded = step.isHumanGraded;
        let historyModified = false;

        if (validatedData.newGrade) {
            // Demote others
            currentHistory = currentHistory.map(g => ({ ...g, isElected: false }));

            // Generate ID
            const newId = randomUUID();
            const gradeItem = {
                id: newId,
                score: validatedData.newGrade.score,
                reasoning: validatedData.newGrade.reasoning,
                type: validatedData.newGrade.type,
                givenTime: new Date().toISOString(),
                electedTime: new Date().toISOString(),
                isElected: true
            };

            // Append
            currentHistory.push(gradeItem);

            // Update scalar fields safely
            updatedScore = gradeItem.score;
            updatedHumanNote = gradeItem.reasoning;
            updatedIsHumanGraded = gradeItem.type === "Human";
            historyModified = true;
        } else if (validatedData.electGradeId) {
            // Find grade
            const targetGrade = currentHistory.find(g => g.id === validatedData.electGradeId);
            if (!targetGrade) {
                return NextResponse.json({ success: false, error: "Grade ID not found in history" }, { status: 404 });
            }

            // Update election status
            currentHistory = currentHistory.map(g => {
                if (g.id === validatedData.electGradeId) {
                    return { ...g, isElected: true, electedTime: new Date().toISOString() };
                }
                return { ...g, isElected: false };
            });

            // Update scalar fields safely
            updatedScore = targetGrade.score;
            updatedHumanNote = targetGrade.reasoning;
            updatedIsHumanGraded = targetGrade.type === "Human";
            historyModified = true;
        }

        // Keep backwards comp for direct scalar updates if no newGrade/electGradeId is specified
        if (!validatedData.newGrade && !validatedData.electGradeId) {
            if (validatedData.score !== undefined) updatedScore = validatedData.score;
            if (validatedData.humanNote !== undefined) updatedHumanNote = validatedData.humanNote;
            if (validatedData.isHumanGraded !== undefined) updatedIsHumanGraded = validatedData.isHumanGraded;
        }

        // Apply updates
        const updatedStep = await prisma.runStep.update({
            where: { id: step_id },
            data: {
                score: updatedScore,
                isHumanGraded: updatedIsHumanGraded,
                humanNote: updatedHumanNote,
                ...(historyModified && { gradingHistory: currentHistory as any }),
                ...(validatedData.content !== undefined && { content: validatedData.content }),
            }
        });

        return NextResponse.json({
            success: true,
            step: updatedStep
        }, { status: 200 });

    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error updating run step:", error);
        return NextResponse.json({ success: false, error: "Failed to update step" }, { status: 500 });
    }
}
