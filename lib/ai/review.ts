import { getModel } from "./client";
import {
    buildQuestionReviewPrompt,
    type QuestionReviewInput,
} from "./prompts";
import { DEFAULT_MODEL } from "./models";

export interface AiGradeResult {
    score: number;
    reasoning: string;
}

export async function generateQuestionGrade(
    input: QuestionReviewInput,
    apiKey: string,
    modelName: string = DEFAULT_MODEL
): Promise<AiGradeResult> {
    const model = getModel(apiKey, modelName);
    const prompt = buildQuestionReviewPrompt(input);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip possible markdown fences
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed: AiGradeResult;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`AI returned invalid JSON:\n${text.substring(0, 500)}`);
    }

    return {
        score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
        reasoning: String(parsed.reasoning ?? ""),
    };
}

export interface FullEvaluationResult {
    overall: number;
    pass_threshold: number;
    skill_threshold: number;
    per_skill: Record<string, number>;
    feedback: string;
}

export async function generateFullEvaluation(
    input: import("./prompts").FullEvaluationInput,
    apiKey: string,
    modelName: string = DEFAULT_MODEL
): Promise<FullEvaluationResult> {
    const { buildFullEvaluationPrompt } = await import("./prompts");
    const model = getModel(apiKey, modelName);
    const prompt = buildFullEvaluationPrompt(input);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip possible markdown fences
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`AI returned invalid JSON for full evaluation:\n${text.substring(0, 500)}`);
    }

    return {
        overall: Math.max(0, Math.min(100, Math.round(Number(parsed.overall) || 0))),
        pass_threshold: Math.max(0, Math.min(100, Math.round(Number(parsed.pass_threshold) || 70))),
        skill_threshold: Math.max(0, Math.min(100, Math.round(Number(parsed.skill_threshold) || 60))),
        per_skill: Object.fromEntries(
            Object.entries(parsed.per_skill || {}).map(([k, v]) => [k, Math.max(0, Math.min(100, Math.round(Number(v) || 0)))])
        ),
        feedback: String(parsed.feedback ?? ""),
    };
}
