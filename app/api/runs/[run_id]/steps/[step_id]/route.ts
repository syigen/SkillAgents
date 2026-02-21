import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";

const updateStepSchema = z.object({
    score: z.number().int().optional(),
    isHumanGraded: z.boolean().optional(),
    humanNote: z.string().optional(),
    gradingHistory: z.array(z.any()).optional(),
    content: z.string().optional(),
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

        // Apply updates
        const updatedStep = await prisma.runStep.update({
            where: { id: step_id },
            data: {
                ...(validatedData.score !== undefined && { score: validatedData.score }),
                ...(validatedData.isHumanGraded !== undefined && { isHumanGraded: validatedData.isHumanGraded }),
                ...(validatedData.humanNote !== undefined && { humanNote: validatedData.humanNote }),
                ...(validatedData.gradingHistory !== undefined && { gradingHistory: validatedData.gradingHistory as any }),
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
