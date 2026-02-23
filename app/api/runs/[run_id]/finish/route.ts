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
            include: { evaluation: true }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        if (run.isLocked) {
            return NextResponse.json({ success: false, error: "Run is already finished/locked" }, { status: 400 });
        }

        // Determine runPass depending on whether we have a full evaluation threshold
        let runPass = false;

        if (run.evaluation) {
            runPass = run.evaluation.overall >= run.evaluation.passThreshold;
        } else if (run.score !== null) {
            // Fallback if no full evaluation was run
            runPass = run.score >= 70;
        }

        const newStatus = runPass ? 'pass' : 'fail';

        // Update run with final status and lock it
        const updatedRun = await prisma.run.update({
            where: { id: run_id },
            data: {
                status: newStatus,
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
