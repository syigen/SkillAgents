/**
 * Mock Agent Workflow Script
 * 
 * Usage:
 * npx tsx scripts/mock-agent.ts <invite_token>
 * 
 * This script will:
 * 1. Register with the invite token to get an API key.
 * 2. Start an interview to get the questions.
 * 3. Submit dummy answers for each question.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api";

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const isNew = args.includes('--new');
    let inviteToken = args.find(a => !a.startsWith('--'));

    if (!inviteToken) {
        console.log("ℹ️ No invite token provided. Attempting to generate one automatically...");

        // Find a template
        let template = await prisma.template.findFirst({
            where: { status: 'published' } // Try to find a published one first
        }) || await prisma.template.findFirst();

        if (!template) {
            console.log("ℹ️ No templates found. Creating a dummy template...");

            // We need an owner. Find the first user or create a dummy user
            let user = await prisma.user.findFirst();
            if (!user) {
                const dummyId = crypto.randomUUID();
                user = await prisma.user.create({
                    data: { id: dummyId }
                });
            }

            template = await prisma.template.create({
                data: {
                    name: 'Mock Agent Evaluation',
                    description: 'Auto-generated template for testing the agent flow.',
                    difficulty: 'medium',
                    status: 'published',
                    ownerUserId: user.id,
                    criteria: {
                        create: [
                            { prompt: "What is your primary function?", expected: "I am an AI agent designed to answer questions.", minScore: 5 },
                            { prompt: "Write a hello world program in Python.", expected: "print('Hello World')", minScore: 10 }
                        ]
                    }
                }
            });
        }

        console.log(`ℹ️ Found template: "${template.name}" (${template.id})`);

        // Generate invite token
        const inviteRes = await fetch(`${API_BASE}/agents/invite-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template_id: template.id })
        });

        if (!inviteRes.ok) {
            const error = await inviteRes.json();
            console.error("❌ Failed to generate invite token:", error);
            process.exit(1);
        }

        const inviteData = await inviteRes.json();
        inviteToken = inviteData.token;
        console.log(`✅ Generated new invite token: ${inviteToken}`);
    }

    console.log(`🤖 Starting Mock Agent Workflow with token: ${inviteToken}`);

    // -- Step 1: Register with Token --
    console.log("\n[1/3] Registering Agent...");

    // Create a unique client request ID for idempotency/upsert
    const clientRequestId = isNew ? `mock-agent-${Date.now()}` : `mock-agent-default`;

    const registerRes = await fetch(`${API_BASE}/agents/register-with-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            invite_token: inviteToken,
            client_request_id: clientRequestId,
            agent_name: "Test Mock Agent",
            agent_version: "1.0.0",
            agent_fingerprint: "sys-fp-12345",
            fingerprint_method: "mac_address",
            tool_access: ["read_file", "write_file", "search_web"],
            skill_md_hash: "abcd1234efgh5678",
            skills: [
                {
                    name: "Python Programming",
                    declared_level: "expert",
                    evidence: "Github profile parsing"
                }
            ]
        })
    });

    if (!registerRes.ok) {
        const error = await registerRes.json();
        console.error("❌ Registration failed. HTTP Status:", registerRes.status);
        console.error(JSON.stringify(error, null, 2));
        await prisma.$disconnect();
        return;
    }

    const registerData = await registerRes.json();
    console.log("✅ Registration successful!");
    console.log(`   Agent ID: ${registerData.agent_id}`);
    console.log(`   API Key: ${registerData.api_key.substring(0, 8)}...`);

    const apiKey = registerData.api_key;

    // -- Step 2: Start Interview (Fetch Questions) --
    console.log("\n[2/3] Starting Interview...");

    const startRes = await fetch(`${API_BASE}/agents/invite/${inviteToken}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!startRes.ok) {
        const error = await startRes.json();
        console.error("❌ Failed to start interview. HTTP Status:", startRes.status);
        console.error(JSON.stringify(error, null, 2));
        await prisma.$disconnect();
        return;
    }

    const startData = await startRes.json();
    console.log("✅ Interview started successfully!");
    console.log(`   Run ID: ${startData.run_id}`);
    console.log(`   Template: ${startData.template_name}`);
    console.log(`   Questions received: ${startData.questions.length}`);

    startData.questions.forEach((q: string, idx: number) => {
        console.log(`     Q${idx + 1}: ${q}`);
    });

    // -- Step 3: Submit Answers --
    console.log("\n[3/3] Submitting Answers...");

    const answers = startData.questions.map((q: string, idx: number) => {
        return {
            question_index: idx,
            answer: `This is an automated mock answer for question ${idx + 1}: "${q.substring(0, 30)}..."`,
            confidence_score: 0.95,
            used_tools: ["search_web"]
        };
    });

    const submitRes = await fetch(`${API_BASE}/agents/interview/${startData.run_id}/submit`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
    });

    if (!submitRes.ok) {
        const error = await submitRes.json();
        console.error("❌ Failed to submit answers. HTTP Status:", submitRes.status);
        console.error(JSON.stringify(error, null, 2));
        await prisma.$disconnect();
        return;
    }

    const submitData = await submitRes.json();
    console.log("✅ Answers submitted successfully!");
    console.log(`   Status: ${submitData.status}`);
    console.log(`   Message: ${submitData.message}`);

    console.log("\n🎉 Mock agent workflow completed successfully!");
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
