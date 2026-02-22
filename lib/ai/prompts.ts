/**
 * lib/ai/prompts.ts
 * All AI prompt builders live here — pure string functions, no AI calls.
 * Edit this file to tune how Gemini responds.
 */

export interface GenerateCriteriaInput {
    name: string;
    description?: string;
    skills?: string[];
    difficulty?: string;
    count?: number;
}

export interface GenerateDescriptionInput {
    name: string;
    skills?: string[];
    difficulty?: string;
}

/**
 * Builds the prompt for generating evaluation criteria (questions + expected answers).
 * Gemini must return a JSON array — nothing else.
 */
export function buildGenerateCriteriaPrompt(input: GenerateCriteriaInput): string {
    const { name, description, skills, difficulty, count = 5 } = input;

    const parts: string[] = [
        `You are an expert technical interviewer designing an evaluation template.`,
        ``,
        `Template Name: "${name}"`,
    ];

    if (description) parts.push(`Description: ${description}`);
    if (skills && skills.length > 0) parts.push(`Skills being assessed: ${skills.join(", ")}`);
    if (difficulty) parts.push(`Difficulty level: ${difficulty}`);

    parts.push(
        ``,
        `Generate exactly ${count} evaluation criteria (interview questions with expected answers).`,
        ``,
        `Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Example format:`,
        `[`,
        `  {`,
        `    "prompt": "Explain the virtual DOM in React.",`,
        `    "expected": "Candidate should mention reconciliation, diffing algorithm, and performance benefits over direct DOM manipulation.",`,
        `    "minScore": 10`,
        `  }`,
        `]`,
        ``,
        `Rules:`,
        `- Each "prompt" should be a clear, concise technical question or task.`,
        `- Each "expected" should describe what a strong answer includes (key concepts, techniques, examples).`,
        `- "minScore" should be between 5 and 25, scaled by question complexity.`,
        `- Questions should be progressive in complexity if possible.`,
        `- Make questions specific and practical, not generic.`,
    );

    return parts.join("\n");
}

/**
 * Builds the prompt for generating a template description paragraph.
 * Gemini must return plain text — 2-3 sentences only.
 */
export function buildGenerateDescriptionPrompt(input: GenerateDescriptionInput): string {
    const { name, skills, difficulty } = input;

    const parts: string[] = [
        `You are writing a concise evaluation template description for a technical interview platform.`,
        ``,
        `Template Name: "${name}"`,
    ];

    if (skills && skills.length > 0) parts.push(`Skills: ${skills.join(", ")}`);
    if (difficulty) parts.push(`Difficulty: ${difficulty}`);

    parts.push(
        ``,
        `Write a professional 2-3 sentence description of what this evaluation template assesses.`,
        `Focus on the purpose, target role, and what competencies will be measured.`,
        `Return ONLY the description text. No titles, no bullet points, no extra formatting.`,
    );

    return parts.join("\n");
}
