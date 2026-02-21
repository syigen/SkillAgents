import { z } from "zod";

// A) Invite prompt generation
export const invitePromptRequestSchema = z.object({
    template_id: z.string().uuid(),
});

export type InvitePromptRequest = z.infer<typeof invitePromptRequestSchema>;

export const invitePromptResponseSchema = z.object({
    token: z.string(),
    prompt: z.string(),
});

export type InvitePromptResponse = z.infer<typeof invitePromptResponseSchema>;

// B) Agent registration with token
export const skillSchema = z.object({
    name: z.string(),
    declared_level: z.string(),
    evidence: z.string(),
});

export type Skill = z.infer<typeof skillSchema>;

export const registerWithTokenRequestSchema = z.object({
    invite_token: z.string(),
    client_request_id: z.string(),
    agent_name: z.string(),
    agent_version: z.string().default("1.0"),
    agent_fingerprint: z.string().default(""),
    fingerprint_method: z.string().default("none"),
    tool_access: z.array(z.string()).default([]),
    skill_md_hash: z.string().default(""),
    skills: z.array(skillSchema).default([]),
});

export type RegisterWithTokenRequest = z.infer<typeof registerWithTokenRequestSchema>;

export const registerResponseSchema = z.object({
    agent_id: z.string(),
    api_key: z.string(),
    verification_url: z.string(),
    registration_receipt: z.record(z.string(), z.any()),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

// C) Start interview via invite token
export const inviteInterviewResponseSchema = z.object({
    run_id: z.string().uuid(),
    template_name: z.string(),
    questions: z.array(z.string()),
    submission_endpoint: z.string().url(),
});

export type InviteInterviewResponse = z.infer<typeof inviteInterviewResponseSchema>;

// D) Submit answers
export const answerSubmissionSchema = z.object({
    question_index: z.number().int().min(0),
    answer: z.string(),
});

export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;

export const submitAnswersRequestSchema = z.object({
    answers: z.array(answerSubmissionSchema),
});

export type SubmitAnswersRequest = z.infer<typeof submitAnswersRequestSchema>;

export const submitAnswersResponseSchema = z.object({
    status: z.string(),
    message: z.string(),
});

export type SubmitAnswersResponse = z.infer<typeof submitAnswersResponseSchema>;

// E) Evaluation Payload
export const evaluationPerQuestionSchema = z.object({
    question_index: z.number().int().min(0),
    score: z.number().min(0),
    max_score: z.number().min(1),
    skills: z.record(z.string(), z.number()).default({}),
    feedback: z.string().optional(),
});

export type EvaluationPerQuestion = z.infer<typeof evaluationPerQuestionSchema>;

export const evaluationPayloadSchema = z.object({
    overall: z.number().min(0).max(100),
    pass_threshold: z.number().min(0).max(100),
    per_skill: z.record(z.string(), z.number()),
    skill_threshold: z.number().min(0).max(100),
    per_question: z.array(evaluationPerQuestionSchema).default([]),
    model: z.string().optional(),
    version: z.string().optional(),
});

export type EvaluationPayload = z.infer<typeof evaluationPayloadSchema>;

// F) Skill Claim Evidence Payload
export const evidencePayloadSchema = z.object({
    run_id: z.string().uuid(),
    template_id: z.string().uuid(),
    template_name: z.string(),
    overall: z.number(),
    per_skill: z.record(z.string(), z.number()),
    threshold: z.number(),
    evaluated_at: z.string(),
});

export type EvidencePayload = z.infer<typeof evidencePayloadSchema>;

// G) Certificate Snapshot Payload
export const certificateSnapshotSchema = z.object({
    run_id: z.string().uuid(),
    agent_id: z.string(),
    agent_name: z.string(),
    template_id: z.string().uuid(),
    template_name: z.string(),
    score: z.number(),
    issued_at: z.string(),
});

export type CertificateSnapshot = z.infer<typeof certificateSnapshotSchema>;
