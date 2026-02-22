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
