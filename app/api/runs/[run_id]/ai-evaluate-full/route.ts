import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveAiKey } from "@/lib/ai/resolve-key";
import { AiService } from "@/lib/ai/service";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ run_id: string }> }
) {
    try {
        const apiKey = await resolveAiKey(req);
        if (!apiKey) {
            return NextResponse.json(
                { error: "NO_AI_KEY", message: "AI key not configured. Please set up your Google AI Studio key." },
                { status: 401 }
            );
        }

        const { run_id } = await params;
        const body = await req.json();
        const model = body.model || DEFAULT_MODEL;

        // Fetch run with template and steps
        const run = await prisma.run.findUnique({
            where: { id: run_id },
            include: {
                template: {
                    include: { criteria: { orderBy: { createdAt: "asc" } } },
                },
                steps: { orderBy: { timestamp: "asc" } }
            }
        });

        if (!run) {
            return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 });
        }

        if (run.isLocked) {
            return NextResponse.json({ success: false, error: "Run is locked because a certificate has been issued" }, { status: 403 });
        }

        // 1. Gather transcript for AI evaluation
        const transcript = run.steps.map(s => ({
            role: s.role,
            content: s.content
        }));

        let templateSkills: string[] = [];
        if (Array.isArray(run.template.skills)) {
            templateSkills = run.template.skills.map((s) => typeof s === 'string' ? s : (s as any).name).filter(Boolean);
        }

        // 2. Call Gemini for full evaluation
        const aiService = new AiService(apiKey, model);
        const aiEvaluation = await aiService.generateFullEvaluation({
            templateName: run.template.name,
            templateDescription: run.template.description ?? undefined,
            skills: templateSkills,
            difficulty: run.template.difficulty,
            transcript: transcript
        });

        // 3. Gather per-question scores (from existing steps)
        const agentSteps = run.steps.filter(s => s.role === 'agent');
        const perQuestion = agentSteps.map((step, idx) => ({
            question_index: idx,
            score: step.score ?? 0,
            max_score: 100,
            feedback: step.humanNote ?? "",
            skills: {}, // keeping it simple
        }));

        // 4. Update the DB
        const updatedRun = await prisma.run.update({
            where: { id: run_id },
            data: {
                score: aiEvaluation.overall,
                evaluatedAt: new Date()
            }
        });

        // Upsert RunEvaluation
        const upsertedEvaluation = await prisma.runEvaluation.upsert({
            where: { runId: run_id },
            create: {
                runId: run_id,
                overall: aiEvaluation.overall,
                passThreshold: aiEvaluation.pass_threshold,
                skillThreshold: aiEvaluation.skill_threshold,
                model: model,
                version: "1.0",
                skillScores: {
                    create: Object.entries(aiEvaluation.per_skill).map(([skill, score]) => ({
                        skill,
                        score: Math.round(score),
                    })),
                },
                perQuestion: {
                    create: perQuestion.map((q) => ({
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
                overall: aiEvaluation.overall,
                passThreshold: aiEvaluation.pass_threshold,
                skillThreshold: aiEvaluation.skill_threshold,
                model: model,
                version: "1.0",
                skillScores: {
                    deleteMany: {},
                    create: Object.entries(aiEvaluation.per_skill).map(([skill, score]) => ({
                        skill,
                        score: Math.round(score),
                    })),
                },
                perQuestion: {
                    deleteMany: {},
                    create: perQuestion.map((q) => ({
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
        for (const skillName of templateSkills) {
            const skillScore = aiEvaluation.per_skill[skillName] ?? 0;

            // Note: Since the interview is not finished yet, we will just record the score
            // The final status of the claim (approved/rejected) will be determined when the interview is explicitly finished.
            // For now, we will mark it as "evaluated" or keep it "verified" if evidence already existed.
            const approved = skillScore >= aiEvaluation.skill_threshold;
            const status = approved ? 'approved' : 'rejected';

            const evidence = {
                run_id: run.id,
                template_id: run.templateId,
                template_name: run.templateName || run.template.name,
                overall: aiEvaluation.overall,
                per_skill: { [skillName]: skillScore },
                threshold: aiEvaluation.skill_threshold,
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

        // Build evaluation response shape
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
            feedback: aiEvaluation.feedback
        };

        return NextResponse.json({
            id: updatedRun.id,
            score: updatedRun.score,
            status: updatedRun.status,
            evaluation: evaluationResponse,
            isLocked: updatedRun.isLocked,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating run evaluation:", error);
        return NextResponse.json({ success: false, error: error.message ?? "Failed to evaluate run" }, { status: 500 });
    }
}
