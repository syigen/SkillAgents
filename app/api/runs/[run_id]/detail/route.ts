import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const { run_id } = await params;

        const run = await prisma.run.findUnique({
            where: { id: run_id },
            include: {
                agent: true,
                template: {
                    include: {
                        criteria: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                },
                steps: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        // Serialise the run (convert Dates → ISO strings for client components)
        const serialised = {
            ...run,
            timestamp: run.timestamp.toISOString(),
            evaluatedAt: run.evaluatedAt?.toISOString() ?? null,
            criteria: (run.template?.criteria ?? []).map((c: any) => ({
                prompt: c.prompt,
                expected: c.expected,
                minScore: c.minScore,
            })),
            steps: run.steps.map(s => ({
                ...s,
                timestamp: s.timestamp.toISOString(),
            }))
        };

        return NextResponse.json({ success: true, run: serialised });
    } catch (error) {
        console.error("Error fetching run detail:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch run detail" }, { status: 500 });
    }
}
