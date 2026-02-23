/**
 * lib/ai/models.ts
 * Gemini models available for AI generation.
 */

export const DEFAULT_MODEL = "gemini-3-flash-preview";

export interface GeminiModel {
    id: string;
    label: string;
    description: string;
    badge?: "fast" | "smart" | "preview";
}

export const GEMINI_MODELS: GeminiModel[] = [
    {
        id: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Default fast model",
        badge: "fast",
    }
];
