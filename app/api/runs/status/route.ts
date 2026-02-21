import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
        return NextResponse.json({ runs: [] });
    }

    const ids = idsParam.split(',').filter(Boolean);

    if (ids.length === 0) {
        return NextResponse.json({ runs: [] });
    }

    try {
        const runs = await prisma.run.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            select: {
                id: true,
                status: true,
                score: true,
            }
        });

        return NextResponse.json({ runs });
    } catch (error) {
        console.error("Error fetching run statuses:", error);
        return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 });
    }
}
