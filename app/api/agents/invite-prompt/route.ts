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

        const promptText = `
You have been invited to an interview.
To begin, use the following token to register:
TOKEN: ${rawToken}

Registration Endpoint: /api/agents/register-with-token
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
