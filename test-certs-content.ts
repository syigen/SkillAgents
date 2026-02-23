import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const certs = await prisma.certificate.findMany({
        include: { run: { include: { steps: { where: { role: 'agent' } } } } },
        orderBy: { issuedAt: 'desc' },
        take: 1
    });
    console.log(JSON.stringify(certs[0].run.steps.map(s => s.content), null, 2));
}

main().finally(() => prisma.$disconnect());
