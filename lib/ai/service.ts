import { getModel } from "./client";
import { DEFAULT_MODEL } from "./models";
import {
    buildQuestionReviewPrompt,
    buildFullEvaluationPrompt,
    buildGenerateCriteriaPrompt,
    buildGenerateDescriptionPrompt,
    type QuestionReviewInput,
    type FullEvaluationInput,
    type GenerateCriteriaInput,
    type GenerateDescriptionInput,
} from "./prompts";

export interface AiGradeResult {
    score: number;
    reasoning: string;
}

export interface FullEvaluationResult {
    overall: number;
    pass_threshold: number;
    skill_threshold: number;
    per_skill: Record<string, number>;
    feedback: string;
}

export interface CriterionItem {
    prompt: string;
    expected: string;
    minScore: number;
}

export class AiService {
    private apiKey: string;
    private defaultModel: string;

    constructor(apiKey: string, defaultModel: string = DEFAULT_MODEL) {
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
    }

    async generateQuestionGrade(
        input: QuestionReviewInput,
        modelName?: string
    ): Promise<AiGradeResult> {
        const model = getModel(this.apiKey, modelName || this.defaultModel);
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

    async generateFullEvaluation(
        input: FullEvaluationInput,
        modelName?: string
    ): Promise<FullEvaluationResult> {
        const model = getModel(this.apiKey, modelName || this.defaultModel);
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

    async generateTemplateCriteria(
        input: GenerateCriteriaInput,
        modelName?: string
    ): Promise<CriterionItem[]> {
        const model = getModel(this.apiKey, modelName || this.defaultModel);
        const prompt = buildGenerateCriteriaPrompt(input);

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let parsed: CriterionItem[];
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new Error(`AI returned invalid JSON:\n${text.substring(0, 300)}`);
        }

        if (!Array.isArray(parsed)) {
            throw new Error("AI response was not a JSON array");
        }

        return parsed.map((item) => ({
            prompt: String(item.prompt ?? ""),
            expected: String(item.expected ?? ""),
            minScore: Math.max(0, Math.round(Number(item.minScore) || 10)),
        }));
    }

    async generateTemplateDescription(
        input: GenerateDescriptionInput,
        modelName?: string
    ): Promise<string> {
        const model = getModel(this.apiKey, modelName || this.defaultModel);
        const prompt = buildGenerateDescriptionPrompt(input);
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }
}
