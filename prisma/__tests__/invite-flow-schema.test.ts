import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../lib/prisma';
import crypto from 'crypto';

describe('Invite-First Flow Schema Tests', () => {
    let userId: string;
    let templateId: string;

    beforeAll(async () => {
        // Clean up before starting
        await prisma.runStep.deleteMany();
        await prisma.run.deleteMany();
        await prisma.agentInvite.deleteMany();
        await prisma.agent.deleteMany();
        await prisma.templateCriterion.deleteMany();
        await prisma.template.deleteMany();
        await prisma.user.deleteMany();

        // Create a dummy user
        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(), // Valid UUID
            },
        });
        userId = user.id;

        // Create a dummy template
        const template = await prisma.template.create({
            data: {
                ownerUserId: userId,
                name: 'Test Template for Flow',
                skills: ['python'],
                difficulty: 'medium',
            },
        });
        templateId = template.id;
    });

    afterAll(async () => {
        // Clean up after tests run
        await prisma.runStep.deleteMany();
        await prisma.run.deleteMany();
        await prisma.agentInvite.deleteMany();
        await prisma.agent.deleteMany();
        await prisma.templateCriterion.deleteMany();
        await prisma.template.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should create an agent invite', async () => {
        const invite = await prisma.agentInvite.create({
            data: {
                ownerUserId: userId,
                templateId: templateId,
                tokenHash: crypto.randomBytes(32).toString('hex'),
                maxUses: 5,
            },
        });

        expect(invite.id).toBeDefined();
        expect(invite.status).toBe('active');
        expect(invite.uses).toBe(0);
        expect(invite.templateId).toBe(templateId);
    });

    it('should create an agent and link to a user', async () => {
        const agent = await prisma.agent.create({
            data: {
                agentId: 'agent-12345',
                ownerUserId: userId,
                clientRequestId: 'client-req-001',
                name: 'Test CLI Agent',
                apiKeyHash: 'dummy_hash',
                toolAccess: ['bash', 'python'],
            },
        });

        expect(agent.id).toBeDefined();
        expect(agent.agentId).toBe('agent-12345');
        expect(agent.ownerUserId).toBe(userId);
    });

    it('should create a run and add step', async () => {
        const agent = await prisma.agent.create({
            data: {
                agentId: 'agent-run-test',
                ownerUserId: userId,
                clientRequestId: 'client-req-002',
                name: 'Runner Agent',
                apiKeyHash: 'dummy_hash_2',
            },
        });

        const run = await prisma.run.create({
            data: {
                ownerUserId: userId,
                agentFkId: agent.id,
                templateId: templateId,
                status: 'running',
                questions: ['Q1?', 'Q2?'],
                steps: {
                    create: [
                        {
                            role: 'interviewer',
                            content: 'Welcome to the interview',
                        },
                        {
                            role: 'agent',
                            content: 'Hello, I am ready',
                        }
                    ]
                }
            },
            include: {
                steps: true,
                agent: true
            }
        });

        expect(run.id).toBeDefined();
        expect(run.agent.agentId).toBe('agent-run-test');
        expect(run.steps).toHaveLength(2);
        expect(run.steps[0].role).toBe('interviewer');
        expect(run.steps[1].role).toBe('agent');
    });

    it('should cascade delete runs and steps when run is deleted, and handle user deletion', async () => {
        const tempUser = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
            },
        });

        const template = await prisma.template.create({
            data: {
                ownerUserId: tempUser.id,
                name: 'Temp Template',
                skills: [],
                difficulty: 'easy',
            },
        });

        const agent = await prisma.agent.create({
            data: {
                agentId: 'agent-delete-test',
                ownerUserId: tempUser.id,
                clientRequestId: 'req-3',
                name: 'Temp Agent',
                apiKeyHash: 'hash',
            },
        });

        const run = await prisma.run.create({
            data: {
                ownerUserId: tempUser.id,
                agentFkId: agent.id,
                templateId: template.id,
                steps: {
                    create: [{ role: 'system', content: 'test' }]
                }
            },
        });

        const runId = run.id;

        // Verify they exist
        expect(await prisma.run.findUnique({ where: { id: runId } })).not.toBeNull();
        expect((await prisma.runStep.findMany({ where: { runId } })).length).toBe(1);

        // Delete user
        await prisma.user.delete({ where: { id: tempUser.id } });

        // Verify runs and steps are gone
        expect(await prisma.run.findUnique({ where: { id: runId } })).toBeNull();
        expect((await prisma.runStep.findMany({ where: { runId } })).length).toBe(0);

        // Note: The agent's ownerUserId should be set to null because of onDelete: SetNull
        const deletedUserAgent = await prisma.agent.findUnique({ where: { id: agent.id } });
        expect(deletedUserAgent).not.toBeNull();
        expect(deletedUserAgent?.ownerUserId).toBeNull();

        // clean up agent
        await prisma.agent.delete({ where: { id: agent.id } });
    });
});
