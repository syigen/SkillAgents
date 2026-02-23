import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { templateFormSchema } from "@/lib/validations/template";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate incoming data
        const validatedData = templateFormSchema.parse(body);

        // Ensure a dummy user exists for foreign key constraints (since auth isn't fully wired for this stub)
        const stubUserId = "00000000-0000-0000-0000-000000000000";
        await prisma.user.upsert({
            where: { id: stubUserId },
            update: {},
            create: { id: stubUserId },
        });

        // Create the template and criteria in a transaction
        const template = await prisma.template.create({
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                difficulty: validatedData.difficulty,
                skills: validatedData.skills,
                status: validatedData.status,
                ownerUserId: stubUserId,
                criteria: {
                    create: validatedData.criteria.map((c) => ({
                        prompt: c.prompt,
                        expected: c.expected,
                        minScore: c.minScore,
                        skills: c.skills || [],
                    })),
                },
            },
            include: {
                criteria: true,
            },
        });

        return NextResponse.json({ success: true, template }, { status: 201 });
    } catch (error: any) {
        console.error("Error saving template:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to save template" },
            { status: 500 }
        );
    }
}
