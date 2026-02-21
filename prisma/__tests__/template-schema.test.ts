import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../lib/prisma';

describe('Template and TemplateCriterion Schema Tests', () => {
    let userId: string;

    beforeAll(async () => {
        // Clean up before starting
        await prisma.templateCriterion.deleteMany();
        await prisma.template.deleteMany();
        await prisma.user.deleteMany();

        // Create a dummy user for foreign key constraints
        const user = await prisma.user.create({
            data: {
                id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
            },
        });
        userId = user.id;
    });

    afterAll(async () => {
        // Clean up after tests run
        await prisma.templateCriterion.deleteMany();
        await prisma.template.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should create a template without criteria', async () => {
        const template = await prisma.template.create({
            data: {
                ownerUserId: userId,
                name: 'Test Template',
                type: 'test_type',
                skills: ['skill1', 'skill2'],
                difficulty: 'medium',
            },
        });

        expect(template.id).toBeDefined();
        expect(template.name).toBe('Test Template');
        expect(template.type).toBe('test_type');
        expect(template.status).toBe('private'); // Default value test
    });

    it('should create a template with criteria using nested writes', async () => {
        const template = await prisma.template.create({
            data: {
                ownerUserId: userId,
                name: 'Template With Criteria',
                type: 'evaluation',
                skills: ['react'],
                difficulty: 'hard',
                status: 'public',
                criteria: {
                    create: [
                        {
                            prompt: 'Is this good?',
                            expected: 'Yes',
                            minScore: 5,
                        },
                        {
                            prompt: 'How many?',
                            expected: '42',
                            minScore: 10,
                        },
                    ],
                },
            },
            include: {
                criteria: true,
            },
        });

        expect(template.id).toBeDefined();
        expect(template.criteria).toHaveLength(2);
        expect(template.criteria[0].prompt).toBeDefined();
        expect(template.criteria[0].expected).toBeDefined();
        expect(template.criteria[0].minScore).toBeGreaterThanOrEqual(0);
    });

    it('should delete criteria when template is deleted (cascade delete)', async () => {
        const template = await prisma.template.create({
            data: {
                ownerUserId: userId,
                name: 'Template To Delete',
                type: 'evaluation',
                skills: [],
                difficulty: 'easy',
                criteria: {
                    create: [
                        {
                            prompt: 'Delete me',
                            expected: 'Ok',
                            minScore: 1,
                        },
                    ],
                },
            },
        });

        // Verify criteria exists
        let criteriaCount = await prisma.templateCriterion.count({
            where: { templateId: template.id },
        });
        expect(criteriaCount).toBe(1);

        // Delete the template
        await prisma.template.delete({
            where: { id: template.id },
        });

        // Verify criteria was cascade deleted
        criteriaCount = await prisma.templateCriterion.count({
            where: { templateId: template.id },
        });
        expect(criteriaCount).toBe(0);
    });
});
