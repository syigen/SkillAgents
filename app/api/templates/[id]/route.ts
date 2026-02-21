import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { templateFormSchema } from "@/lib/validations/template";
import { z } from "zod";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const body = await request.json();

        // Validate incoming data
        const validatedData = templateFormSchema.parse(body);

        // STUB: Replace with real user ID from session when auth is implemented
        const stubUserId = "00000000-0000-0000-0000-000000000000";

        // Check if template exists and belongs to the user
        const existingTemplate = await prisma.template.findUnique({
            where: { id },
        });

        if (!existingTemplate) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        if (existingTemplate.ownerUserId !== stubUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Use a transaction to ensure atomic updates to both Template and its Criteria
        const updatedTemplate = await prisma.$transaction(async (tx) => {
            // 1. Delete existing criteria
            await tx.templateCriterion.deleteMany({
                where: { templateId: id },
            });

            // 2. Update the template and create new criteria
            return tx.template.update({
                where: { id },
                data: {
                    name: validatedData.name,
                    description: validatedData.description || null,
                    difficulty: validatedData.difficulty,
                    skills: validatedData.skills,
                    status: validatedData.status,
                    // Recreate criteria from the fresh form state
                    criteria: {
                        create: validatedData.criteria?.map((c) => ({
                            prompt: c.prompt,
                            expected: c.expected,
                            minScore: c.minScore,
                        })) || [],
                    },
                },
                include: {
                    criteria: true,
                },
            });
        });

        return NextResponse.json(updatedTemplate, { status: 200 });
    } catch (error) {
        console.error("Template Update Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
