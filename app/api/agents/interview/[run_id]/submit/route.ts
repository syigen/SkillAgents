import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { submitAnswersRequestSchema } from "@/lib/validations/agent-api";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const { run_id } = await params;
        const body = await req.json();

        // Validate payload
        const validatedData = submitAnswersRequestSchema.parse(body);

        // Extract API key from the Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, error: "Missing or invalid Authorization header. Expected 'Bearer <api_key>'" },
                { status: 401 }
            );
        }

        const rawApiKey = authHeader.split(" ")[1];
        const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

        // Look up the agent
        const agent = await prisma.agent.findFirst({
            where: { apiKeyHash }
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access or invalid API key" },
                { status: 401 }
            );
        }

        // Look up the run, ensure it belongs to this agent
        const run = await prisma.run.findUnique({
            where: { id: run_id }
        });

        if (!run) {
            return NextResponse.json(
                { success: false, error: "Run not found" },
                { status: 404 }
            );
        }

        if (run.agentFkId !== agent.id) {
            return NextResponse.json(
                { success: false, error: "You do not have permission to submit answers for this run" },
                { status: 403 }
            );
        }

        if (run.status !== 'running' && run.status !== 'in_progress') {
            return NextResponse.json(
                { success: false, error: `Cannot submit answers. Run status is '${run.status}'` },
                { status: 400 }
            );
        }

        // Map submissions to RunStep creations sequentially
        // This simulates saving each question and its agent answer
        const runStepsData = validatedData.answers.map(ans => ({
            runId: run.id,
            role: 'agent',
            content: `[Question Index: ${ans.question_index}] ${ans.answer}`
        }));

        await prisma.$transaction([
            prisma.runStep.createMany({
                data: runStepsData
            }),
            prisma.run.update({
                where: { id: run.id },
                data: { status: 'in_progress' } // Optionally update status or completed logic based on length
            })
        ]);

        return NextResponse.json(
            {
                status: "success",
                message: `Successfully processed ${validatedData.answers.length} answers.`
            },
            { status: 200 }
        );

    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json(
                { success: false, error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error submitting answers:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit answers" },
            { status: 500 }
        );
    }
}
