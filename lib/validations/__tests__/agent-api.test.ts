import { describe, it, expect } from 'vitest';
import {
    invitePromptRequestSchema,
    registerWithTokenRequestSchema,
    submitAnswersRequestSchema
} from '../agent-api';
import crypto from 'crypto';

describe('Agent API Validation Schemas', () => {
    describe('InvitePromptRequest', () => {
        it('should pass with a valid UUID template_id', () => {
            const payload = { template_id: crypto.randomUUID() };
            const result = invitePromptRequestSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });

        it('should fail with an invalid UUID template_id', () => {
            const payload = { template_id: 'not-a-uuid' };
            const result = invitePromptRequestSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
    });

    describe('RegisterWithTokenRequest', () => {
        it('should pass with minimal required fields and apply defaults', () => {
            const payload = {
                invite_token: 'dummy_token',
                client_request_id: 'req_123',
                agent_name: 'Test Agent',
            };
            const result = registerWithTokenRequestSchema.safeParse(payload);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.agent_version).toBe('1.0');
                expect(result.data.skills).toEqual([]);
                expect(result.data.tool_access).toEqual([]);
            }
        });

        it('should pass with all fields provided', () => {
            const payload = {
                invite_token: 'dummy_token',
                client_request_id: 'req_123',
                agent_name: 'Test Agent',
                agent_version: '2.5',
                agent_fingerprint: 'abc',
                fingerprint_method: 'sha256',
                tool_access: ['bash', 'python'],
                skill_md_hash: 'hash123',
                skills: [
                    { name: 'python', declared_level: 'expert', evidence: 'github link' }
                ],
            };
            const result = registerWithTokenRequestSchema.safeParse(payload);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.skills).toHaveLength(1);
            }
        });

        it('should fail if required fields are missing', () => {
            const payload = {
                client_request_id: 'req_123',
                // missing invite_token and agent_name
            };
            const result = registerWithTokenRequestSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
    });

    describe('SubmitAnswersRequest', () => {
        it('should pass with valid answers array', () => {
            const payload = {
                answers: [
                    { question_index: 0, answer: 'My first answer' },
                    { question_index: 1, answer: 'My second answer' },
                ]
            };
            const result = submitAnswersRequestSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid answers structure', () => {
            const payload = {
                answers: [
                    { question_index: 'zero', answer: 'Wrong type' }, // needs to be int
                ]
            };
            const result = submitAnswersRequestSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });

        it('should pass with an empty answers array', () => {
            const payload = { answers: [] };
            const result = submitAnswersRequestSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });
});
