import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const agent = await prisma.agent.findUnique({
            where: { id: id },
            include: {
                owner: { select: { id: true } }
            }
        });

        if (!agent) {
            return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
        }

        // Fetch verified badges: all agent_skill_claims where status='approved' (and not revoked)
        const skillClaims = await prisma.agentSkillClaim.findMany({
            where: {
                agentFkId: id,
                status: 'approved'
            },
            select: {
                skillId: true
            }
        });

        const verified_badges = skillClaims.map(claim => claim.skillId);

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.id,
                agent_id: agent.agentId,
                name: agent.name,
                version: agent.version,
                fingerprint: agent.fingerprint,
                fingerprint_method: agent.fingerprintMethod,
                tool_access: agent.toolAccess,
                skill_md_hash: agent.skillMdHash,
                verified_badges: verified_badges,
                created_at: agent.createdAt
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error retrieving agent profile:", error);
        return NextResponse.json({ success: false, error: "Failed to retrieve agent" }, { status: 500 });
    }
}
