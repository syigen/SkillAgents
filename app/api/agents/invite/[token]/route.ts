import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        // Extract API key from the Authorization header (Bearer token)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, error: "Missing or invalid Authorization header. Expected 'Bearer <api_key>'" },
                { status: 401 }
            );
        }

        const rawApiKey = authHeader.split(" ")[1];
        const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

        // Look up the agent securely
        const agent = await prisma.agent.findFirst({
            where: { apiKeyHash }
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access or invalid API key" },
                { status: 401 }
            );
        }

        // Hash the invite token from URL to find invite
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const invite = await prisma.agentInvite.findUnique({
            where: { tokenHash },
            include: {
                template: {
                    include: {
                        criteria: true // We need the questions
                    }
                }
            }
        });

        if (!invite) {
            return NextResponse.json(
                { success: false, error: "Invalid invite token" },
                { status: 404 }
            );
        }

        if (invite.status !== 'active' || (invite.maxUses && invite.uses >= invite.maxUses)) {
            return NextResponse.json(
                { success: false, error: "This invite is no longer valid for starting runs" },
                { status: 400 }
            );
        }

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: "This invite has expired" },
                { status: 400 }
            );
        }

        // Gather questions from the template
        // By default we use the 'prompt' field of the criteria as the questions
        const questions = invite.template.criteria.map((c: any) => c.prompt);

        const run = await prisma.$transaction(async (tx) => {
            // Increment the invite uses
            await tx.agentInvite.update({
                where: { id: invite.id },
                data: { uses: { increment: 1 } }
            });

            // Create the run and immediately map the questions to interviewer run_steps
            return await tx.run.create({
                data: {
                    ownerUserId: invite.ownerUserId,
                    agentFkId: agent.id,
                    templateId: invite.templateId,
                    inviteId: invite.id,
                    status: 'running',
                    questions: questions,
                    questionSource: 'static',
                    templateName: invite.template.name,
                    steps: {
                        create: questions.map((q: string) => ({
                            role: 'interviewer',
                            content: q
                        }))
                    }
                }
            });
        });

        // Construct the submission endpoint URL
        const originUrl = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
        const submissionEndpoint = `${originUrl}/api/agents/interview/${run.id}/submit`;

        return NextResponse.json(
            {
                run_id: run.id,
                template_name: run.templateName || "Unknown Template",
                questions: questions,
                submission_endpoint: submissionEndpoint
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error starting invite interview:", error);
        return NextResponse.json(
            { success: false, error: "Failed to start interview" },
            { status: 500 }
        );
    }
}
