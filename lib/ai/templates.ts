import { getModel } from "./client";
import {
    buildGenerateCriteriaPrompt,
    buildGenerateDescriptionPrompt,
    type GenerateCriteriaInput,
    type GenerateDescriptionInput,
} from "./prompts";
import { DEFAULT_MODEL } from "./models";

export interface CriterionItem {
    prompt: string;
    expected: string;
    minScore: number;
}

export async function generateTemplateCriteria(
    input: GenerateCriteriaInput,
    apiKey: string,
    modelName: string = DEFAULT_MODEL
): Promise<CriterionItem[]> {
    const model = getModel(apiKey, modelName);
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

export async function generateTemplateDescription(
    input: GenerateDescriptionInput,
    apiKey: string,
    modelName: string = DEFAULT_MODEL
): Promise<string> {
    const model = getModel(apiKey, modelName);
    const prompt = buildGenerateDescriptionPrompt(input);
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}
