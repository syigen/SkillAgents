import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ cert_id: string }> }
) {
    try {
        const { cert_id } = await params;

        const certificate = await prisma.certificate.findUnique({
            where: { id: cert_id },
        });

        if (!certificate) {
            return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
        }

        if (certificate.status !== 'active') {
            return NextResponse.json({ success: false, error: "This certificate is not active or has been revoked" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            certificate: {
                id: certificate.id,
                agent_name: certificate.agentName,
                template_name: certificate.templateName,
                score: certificate.score,
                issued_at: certificate.issuedAt,
                data_hash: certificate.dataHash,
                snapshot: certificate.snapshot,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error retrieving certificate:", error);
        return NextResponse.json({ success: false, error: "Failed to retrieve certificate" }, { status: 500 });
    }
}
