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

export interface QuestionReviewInput {
    templateName: string;
    templateDescription?: string;
    skills: string[];
    difficulty?: string;
    questionIndex: number;
    prompt: string;
    expected?: string;
    agentAnswer: string;
}

/**
 * Builds the prompt for AI-powered single-question review.
 * Gemini must return a JSON object with score and reasoning.
 */
export function buildQuestionReviewPrompt(input: QuestionReviewInput): string {
    const { templateName, templateDescription, skills, difficulty, questionIndex, prompt, expected, agentAnswer } = input;

    const parts: string[] = [
        `You are an expert technical interviewer evaluating a single interview answer.`,
        `Your job is to carefully score the answer and provide detailed reasoning.`,
        ``,
        `## Interview Context`,
        `Template: "${templateName}"`,
    ];

    if (templateDescription) parts.push(`Description: ${templateDescription}`);
    if (skills.length > 0) parts.push(`Skills assessed: ${skills.join(", ")}`);
    if (difficulty) parts.push(`Difficulty: ${difficulty}`);

    parts.push(
        ``,
        `## Question ${questionIndex + 1}`,
        `**Prompt:** ${prompt}`,
    );
    if (expected) parts.push(`**Expected answer:** ${expected}`);
    parts.push(
        ``,
        `## Agent's Answer`,
        agentAnswer,
        ``,
        `## Instructions`,
        `Evaluate the agent's answer against the expected outcome (if provided) and the question context.`,
        ``,
        `Return ONLY a valid JSON object. No markdown, no explanation, no code fences:`,
        `{`,
        `  "score": 75,`,
        `  "reasoning": "Detailed multi-sentence evaluation of the answer quality, what was good, what was missing, and suggestions for improvement."`,
        `}`,
        ``,
        `Rules:`,
        `- "score" must be 0-100.`,
        `- "reasoning" should be 2-5 sentences, specific and actionable.`,
        `- Be fair but rigorous. A perfect answer gets 90-100, good 70-89, partial 40-69, poor 0-39.`,
        `- Consider technical accuracy, completeness, clarity, and relevance to the question.`,
    );

    return parts.join("\n");
}

export interface FullEvaluationInput {
    templateName: string;
    templateDescription?: string;
    skills: string[];
    difficulty?: string;
    transcript: Array<{ role: string; content: string }>;
}

/**
 * Builds the prompt for AI-powered full interview evaluation.
 * Gemini must return a JSON object with overall score, pass/fail threshold recommendations, and per-skill scores.
 */
export function buildFullEvaluationPrompt(input: FullEvaluationInput): string {
    const { templateName, templateDescription, skills, difficulty, transcript } = input;

    const parts: string[] = [
        `You are an expert technical interviewer conducting a final evaluation of a candidate's interview.`,
        `Your job is to read the entire interview transcript and evaluate the candidate across the required skills.`,
        ``,
        `## Interview Context`,
        `Template: "${templateName}"`,
    ];

    if (templateDescription) parts.push(`Description: ${templateDescription}`);
    if (skills.length > 0) parts.push(`Skills assessed: ${skills.join(", ")}`);
    if (difficulty) parts.push(`Difficulty: ${difficulty}`);

    parts.push(
        ``,
        `## Interview Transcript`,
    );

    for (let i = 0; i < transcript.length; i++) {
        const msg = transcript[i];
        const roleName = msg.role === 'interviewer' ? 'Interviewer' : (msg.role === 'agent' ? 'Candidate' : 'System');
        if (msg.role !== 'system') {
            parts.push(`**${roleName}:** ${msg.content}\n`);
        }
    }

    parts.push(
        ``,
        `## Instructions`,
        `Based on the ENTIRE transcript, evaluate the candidate's overall performance and their proficiency in EACH specific skill listed.`,
        ``,
        `Return ONLY a valid JSON object. No markdown, no explanation, no code fences:`,
        `{`,
        `  "overall": 85,`,
        `  "pass_threshold": 70,`,
        `  "skill_threshold": 60,`,
        `  "per_skill": {`
    );

    if (skills.length > 0) {
        skills.forEach((s, idx) => {
            parts.push(`    "${s}": 85${idx < skills.length - 1 ? ',' : ''}`);
        });
    } else {
        parts.push(`    "general": 85`);
    }

    parts.push(
        `  }`,
        `}`,
        ``,
        `Rules:`,
        `- "overall" must be 0-100. Be fair but rigorous. A perfect interview gets 90-100, good 70-89, partial 40-69, poor 0-39.`,
        `- "pass_threshold" should be your recommendation for passing the interview, typically 65-75.`,
        `- "skill_threshold" should be the minimum score required in any single skill to not fail automatically, typically 50-60.`,
        `- "per_skill" MUST include exactly the skills requested. Score each 0-100.`
    );

    return parts.join("\n");
}
