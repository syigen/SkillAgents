/**
 * lib/ai/models.ts
 * Gemini models available for AI generation.
 */

export const DEFAULT_MODEL = "gemini-2.0-flash";

export const GEMINI_MODELS = [
    {
        id: "gemini-2.0-flash",
        label: "Gemini 2.0 Flash",
        description: "Fast and efficient model for most tasks",
        badge: "fast" as const,
    },
    {
        id: "gemini-2.0-flash-thinking-exp",
        label: "Gemini 2.0 Flash Thinking",
        description: "Flash model with enhanced reasoning capabilities",
        badge: "smart" as const,
    },
    {
        id: "gemini-2.5-pro-preview-03-25",
        label: "Gemini 2.5 Pro Preview",
        description: "Most capable model for complex tasks",
        badge: "preview" as const,
    },
];
