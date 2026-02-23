import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const { run_id } = await params;

        // Fetch run to get the current score and evaluation
        const run = await prisma.run.findUnique({
            where: { id: run_id },
            include: {
                evaluation: true,
                steps: {
                    where: { role: 'agent' }
                }
            }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        if (run.isLocked) {
            return NextResponse.json({ success: false, error: "Run is already finished/locked" }, { status: 400 });
        }

        // Determine runPass based on dynamically computed score
        const agentSteps = run.steps;
        const sumScores = agentSteps.reduce((acc, step) => acc + (step.score || 0), 0);
        const computedScore = agentSteps.length > 0 ? Math.round(sumScores / agentSteps.length) : (run.score ?? 0);

        let runPass = false;
        if (run.evaluation) {
            runPass = computedScore >= run.evaluation.passThreshold;
        } else {
            runPass = computedScore >= 70;
        }

        const newStatus = runPass ? 'pass' : 'fail';

        // Update run with final status and lock it
        const updatedRun = await prisma.run.update({
            where: { id: run_id },
            data: {
                status: newStatus,
                score: computedScore,
                isLocked: true,
            }
        });

        return NextResponse.json({
            id: updatedRun.id,
            score: updatedRun.score,
            status: updatedRun.status,
            isLocked: updatedRun.isLocked,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error finishing run:", error);
        return NextResponse.json({ success: false, error: "Failed to finish run" }, { status: 500 });
    }
}
