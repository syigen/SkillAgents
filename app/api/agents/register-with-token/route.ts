import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { registerWithTokenRequestSchema } from "@/lib/validations/agent-api";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate incoming data
        const validatedData = registerWithTokenRequestSchema.parse(body);

        // Pre-hash the incoming token to look it up securely
        const tokenHash = crypto.createHash('sha256').update(validatedData.invite_token).digest('hex');

        // Execute transactions to ensure integrity 
        const result = await prisma.$transaction(async (tx) => {
            // Find the active invite
            const invite = await tx.agentInvite.findUnique({
                where: { tokenHash }
            });

            if (!invite) {
                throw new Error("Invalid invite token");
            }
            if (invite.status !== 'active') {
                throw new Error("Invite is no longer active");
            }
            if (invite.maxUses && invite.uses >= invite.maxUses) {
                throw new Error("Invite has reached its maximum usage limit");
            }
            if (invite.expiresAt && invite.expiresAt < new Date()) {
                throw new Error("Invite has expired");
            }

            // Check if this specific agent/client request combination already exists for this owner
            let agent = await tx.agent.findFirst({
                where: {
                    ownerUserId: invite.ownerUserId,
                    clientRequestId: validatedData.client_request_id
                }
            });

            // Generate a secure API key for the agent
            const rawApiKey = crypto.randomBytes(32).toString('hex');
            const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

            if (agent) {
                // Update existing agent
                agent = await tx.agent.update({
                    where: { id: agent.id },
                    data: {
                        name: validatedData.agent_name,
                        version: validatedData.agent_version,
                        fingerprint: validatedData.agent_fingerprint,
                        fingerprintMethod: validatedData.fingerprint_method,
                        toolAccess: validatedData.tool_access,
                        skillMdHash: validatedData.skill_md_hash,
                        apiKeyHash,
                    }
                });
            } else {
                // Generate an agentId (public ID exposed in API)
                const agentId = crypto.randomUUID();

                // Create the agent
                agent = await tx.agent.create({
                    data: {
                        agentId,
                        ownerUserId: invite.ownerUserId,
                        clientRequestId: validatedData.client_request_id,
                        name: validatedData.agent_name,
                        version: validatedData.agent_version,
                        fingerprint: validatedData.agent_fingerprint,
                        fingerprintMethod: validatedData.fingerprint_method,
                        toolAccess: validatedData.tool_access,
                        skillMdHash: validatedData.skill_md_hash,
                        apiKeyHash,
                    }
                });
            }

            return { agent, rawApiKey };
        });

        // The verification URL might point to a public profile or template verification page
        // For now, construct a dummy or base URL placeholder since no specific route was defined
        // We can get the base URL from the request host if needed, or simply hardcode a stub.
        const originUrl = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
        const verificationUrl = `${originUrl}/agents/${result.agent.agentId}/verify`;

        // We only return the `api_key` once!
        return NextResponse.json(
            {
                agent_id: result.agent.agentId,
                api_key: result.rawApiKey,
                verification_url: verificationUrl,
                registration_receipt: {
                    timestamp: new Date().toISOString(),
                    client_request_id: validatedData.client_request_id,
                    agent_name: validatedData.agent_name,
                }
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

        console.error("Error registering agent:", error);

        // Expose sensible error messages for known issues we threw
        const safeErrorMessages = [
            "Invite has reached its maximum usage limit", "Invite has expired"
        ];

        if (safeErrorMessages.includes(error.message)) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to register agent" },
            { status: 500 }
        );
    }
}
