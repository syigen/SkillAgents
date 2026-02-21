import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
    evaluationPayloadSchema,
    evidencePayloadSchema,
    certificateSnapshotSchema
} from '../agent-api';

describe('Evaluation & Certificate Schemas', () => {
    describe('EvaluationPayload', () => {
        it('should pass with valid evaluation payload', () => {
            const payload = {
                overall: 78,
                pass_threshold: 70,
                per_skill: { "FastAPI": 72, "SQL": 80 },
                skill_threshold: 65,
                per_question: [
                    {
                        question_index: 0,
                        score: 8,
                        max_score: 10,
                        skills: { "FastAPI": 8 },
                        feedback: "Good answer"
                    }
                ],
                model: "gpt-4.1-mini",
                version: "eval_v1"
            };
            const result = evaluationPayloadSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });

        it('should fail when overall score is out of bounds', () => {
            const payload = {
                overall: 105,
                pass_threshold: 70,
                per_skill: { "FastAPI": 72 },
                skill_threshold: 65,
                per_question: []
            };
            const result = evaluationPayloadSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
    });

    describe('EvidencePayload', () => {
        it('should pass with valid evidence payload', () => {
            const payload = {
                run_id: crypto.randomUUID(),
                template_id: crypto.randomUUID(),
                template_name: "FastAPI Interview",
                overall: 78,
                per_skill: { "FastAPI": 72 },
                threshold: 65,
                evaluated_at: new Date().toISOString()
            };
            const result = evidencePayloadSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });

    describe('CertificateSnapshot', () => {
        it('should pass with valid certificate snapshot', () => {
            const payload = {
                run_id: crypto.randomUUID(),
                agent_id: "agent_123",
                agent_name: "Test Agent",
                template_id: crypto.randomUUID(),
                template_name: "FastAPI Interview",
                score: 85,
                issued_at: new Date().toISOString()
            };
            const result = certificateSnapshotSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });
});
