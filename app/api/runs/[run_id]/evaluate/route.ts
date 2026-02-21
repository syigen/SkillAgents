import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { evaluationPayloadSchema } from "@/lib/validations/agent-api";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const { run_id } = await params;
        const body = await req.json();

        // Validate payload
        const evaluationPayload = evaluationPayloadSchema.parse(body);

        // Fetch run
        const run = await prisma.run.findUnique({
            where: { id: run_id },
            include: { template: true, steps: true }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        if (run.isLocked) {
            return NextResponse.json({ success: false, error: "Run is locked because a certificate has been issued" }, { status: 403 });
        }

        // Determine run_pass
        const runPass = evaluationPayload.overall >= evaluationPayload.pass_threshold;
        const newStatus = runPass ? 'pass' : 'fail';

        // Update run with score and status (no longer stores evaluation as JSON)
        const updatedRun = await prisma.run.update({
            where: { id: run_id },
            data: {
                score: evaluationPayload.overall,
                evaluatedAt: new Date(),
                status: newStatus,
                isLocked: true,
            }
        });

        // Upsert RunEvaluation (one-to-one)
        const upsertedEvaluation = await prisma.runEvaluation.upsert({
            where: { runId: run_id },
            create: {
                runId: run_id,
                overall: evaluationPayload.overall,
                passThreshold: evaluationPayload.pass_threshold,
                skillThreshold: evaluationPayload.skill_threshold,
                model: evaluationPayload.model ?? null,
                version: evaluationPayload.version ?? null,
                skillScores: {
                    create: Object.entries(evaluationPayload.per_skill).map(([skill, score]) => ({
                        skill,
                        score: Math.round(score),
                    })),
                },
                perQuestion: {
                    create: evaluationPayload.per_question.map((q) => ({
                        questionIndex: q.question_index,
                        score: q.score,
                        maxScore: q.max_score,
                        feedback: q.feedback ?? null,
                        skillScores: {
                            create: Object.entries(q.skills ?? {}).map(([skill, score]) => ({
                                skill,
                                score: Math.round(score as number),
                            })),
                        },
                    })),
                },
            },
            update: {
                overall: evaluationPayload.overall,
                passThreshold: evaluationPayload.pass_threshold,
                skillThreshold: evaluationPayload.skill_threshold,
                model: evaluationPayload.model ?? null,
                version: evaluationPayload.version ?? null,
                // Replace skill scores
                skillScores: {
                    deleteMany: {},
                    create: Object.entries(evaluationPayload.per_skill).map(([skill, score]) => ({
                        skill,
                        score: Math.round(score),
                    })),
                },
                // Replace per-question rows
                perQuestion: {
                    deleteMany: {},
                    create: evaluationPayload.per_question.map((q) => ({
                        questionIndex: q.question_index,
                        score: q.score,
                        maxScore: q.max_score,
                        feedback: q.feedback ?? null,
                        skillScores: {
                            create: Object.entries(q.skills ?? {}).map(([skill, score]) => ({
                                skill,
                                score: Math.round(score as number),
                            })),
                        },
                    })),
                },
            },
            include: {
                skillScores: true,
                perQuestion: { include: { skillScores: true } },
            },
        });

        // Determine who graded
        const hasHumanGradedStep = run.steps.some((step) => step.isHumanGraded);
        const decidedBy = hasHumanGradedStep ? "human" : "ai";

        // Collect new claims to upsert
        let templateSkills: string[] = [];
        if (Array.isArray(run.template.skills)) {
            templateSkills = run.template.skills.map((s) => typeof s === 'string' ? s : (s as any).name).filter(Boolean);
        }

        for (const skillName of templateSkills) {
            const skillScore = evaluationPayload.per_skill[skillName] ?? 0;
            const approved = runPass && (skillScore >= evaluationPayload.skill_threshold);
            const status = approved ? 'approved' : 'rejected';

            const evidence = {
                run_id: run.id,
                template_id: run.templateId,
                template_name: run.templateName || run.template.name,
                overall: evaluationPayload.overall,
                per_skill: { [skillName]: skillScore },
                threshold: evaluationPayload.skill_threshold,
                evaluated_at: new Date().toISOString()
            };

            const existingClaim = await prisma.agentSkillClaim.findUnique({
                where: {
                    agentFkId_ownerUserId_skillId: {
                        agentFkId: run.agentFkId,
                        ownerUserId: run.ownerUserId,
                        skillId: skillName
                    }
                }
            });

            let claim;
            let statusChanged = false;
            let fromStatus: string | null = null;

            if (existingClaim) {
                fromStatus = existingClaim.status;
                statusChanged = existingClaim.status !== status;

                claim = await prisma.agentSkillClaim.update({
                    where: { id: existingClaim.id },
                    data: {
                        proficiencyClaim: 'verified',
                        runId: run.id,
                        evidence: evidence as any,
                        status: status,
                        decidedBy: decidedBy
                    }
                });
            } else {
                statusChanged = true;
                claim = await prisma.agentSkillClaim.create({
                    data: {
                        agentFkId: run.agentFkId,
                        ownerUserId: run.ownerUserId,
                        skillId: skillName,
                        proficiencyClaim: 'verified',
                        runId: run.id,
                        evidence: evidence as any,
                        status: status,
                        decidedBy: decidedBy
                    }
                });
            }

            if (statusChanged) {
                await prisma.claimDecision.create({
                    data: {
                        claimId: claim.id,
                        source: decidedBy,
                        fromStatus: fromStatus,
                        toStatus: status,
                        reasoning: `Status changed to ${status} via ${decidedBy} evaluation.`,
                        payload: evidence as any
                    }
                });
            }
        }

        // Build evaluation response shape (mirrors old JSON shape for client compat)
        const evaluationResponse = {
            overall: upsertedEvaluation.overall,
            pass_threshold: upsertedEvaluation.passThreshold,
            skill_threshold: upsertedEvaluation.skillThreshold,
            model: upsertedEvaluation.model,
            version: upsertedEvaluation.version,
            per_skill: Object.fromEntries(upsertedEvaluation.skillScores.map(s => [s.skill, s.score])),
            per_question: upsertedEvaluation.perQuestion.map(q => ({
                question_index: q.questionIndex,
                score: q.score,
                max_score: q.maxScore,
                feedback: q.feedback,
                skills: Object.fromEntries(q.skillScores.map(s => [s.skill, s.score])),
            })),
        };

        return NextResponse.json({
            id: updatedRun.id,
            score: updatedRun.score,
            status: updatedRun.status,
            evaluation: evaluationResponse,
            isLocked: updatedRun.isLocked,
        }, { status: 200 });

    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error updating run evaluation:", error);
        return NextResponse.json({ success: false, error: "Failed to evaluate run" }, { status: 500 });
    }
}
