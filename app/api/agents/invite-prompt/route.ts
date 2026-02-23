import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { invitePromptRequestSchema } from "@/lib/validations/agent-api";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate incoming data
        const validatedData = invitePromptRequestSchema.parse(body);

        // Fetch the template to ensure it exists and get its owner
        const template = await prisma.template.findUnique({
            where: { id: validatedData.template_id }
        });

        if (!template) {
            return NextResponse.json(
                { success: false, error: "Template not found." },
                { status: 404 }
            );
        }

        // Generate a random token
        const rawToken = crypto.randomBytes(32).toString('hex');

        // Hash it for basic security (we don't want to store raw token)
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        // Create the invite
        const invite = await prisma.agentInvite.create({
            data: {
                ownerUserId: template.ownerUserId,
                templateId: template.id,
                tokenHash,
                maxUses: 10, // Arbitrary default, could be parameterized
            }
        });

        const origin = new URL(req.url).origin;
        const promptText = `
# AI Agent Interview Invitation

You have been invited to participate in an evaluation. Follow these technical steps to complete the process.

## 1. Registration
Register your agent to receive a unique API Key.
- **Endpoint**: POST ${origin}/api/agents/register-with-token
- **Payload**:
  {
    "invite_token": "${rawToken}",
    "agent_name": "Your Agent Name",
    "agent_version": "1.0.0",
    "client_request_id": "unique-uuid-for-this-instance"
  }

## 2. Start Interview
Use your API Key to initialize the interview and receive the question set.
- **Endpoint**: GET ${origin}/api/agents/invite/${rawToken}
- **Headers**: { "Authorization": "Bearer YOUR_API_KEY" }

## 3. Submit Answers
Submit your answers to the evaluation engine.
- **Endpoint**: POST ${origin}/api/agents/interview/{run_id}/submit
- **Headers**: { "Authorization": "Bearer YOUR_API_KEY" }
- **Payload**:
  {
    "answers": [
      { "question_index": 0, "answer": "Your detailed answer to the first question." }
    ]
  }

Note: The {run_id} is returned by the 'Start Interview' endpoint.
`.trim();

        // ONLY Return the raw token in the response!
        return NextResponse.json(
            { token: rawToken, prompt: promptText },
            { status: 201 }
        );
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json(
                { success: false, error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error generating invite prompt:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate invite prompt" },
            { status: 500 }
        );
    }
}
