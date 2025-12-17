
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userData = [
    {
        id: 'user-emp-001',
        name: 'Emma Employee',
        email: 'emma@company.com',
        role: 'INNOVATOR',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    {
        id: 'user-emp-002',
        name: 'John Developer',
        email: 'john@company.com',
        role: 'INNOVATOR',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    },
    {
        id: 'user-emp-003',
        name: 'Lisa Designer',
        email: 'lisa@company.com',
        role: 'INNOVATOR',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
    },
    {
        id: 'user-mod-001',
        name: 'Mike Moderator',
        email: 'mike@company.com',
        role: 'MODERATOR',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    },
    {
        id: 'user-exec-001',
        name: 'Sarah CIO',
        email: 'sarah@company.com',
        role: 'EXECUTIVE',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
        id: 'user-admin-001',
        name: 'Alice Admin',
        email: 'alice@company.com',
        role: 'ADMIN',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    }
];

const sampleIdeas = [
    {
        title: 'AI-Powered Retirement Planning Assistant',
        description: 'Develop an AI chatbot that helps employees understand their retirement options, calculate projections, and make informed decisions about their 401(k) contributions.',
        category: 'PRODUCT',
        tShirtSize: 'L',
        submitterId: 'user-emp-001',
        status: 'APPROVED',
        businessValueScore: 85
    },
    {
        title: 'Mobile App for Real-Time Portfolio Tracking',
        description: 'Create a mobile application that allows users to track their retirement portfolio performance in real-time with push notifications for significant market changes.',
        category: 'PRODUCT',
        tShirtSize: 'M',
        submitterId: 'user-emp-002',
        status: 'APPROVED',
        businessValueScore: 78
    },
    {
        title: 'Gamification of Financial Literacy',
        description: 'Implement a gamified learning platform where employees earn badges and rewards for completing financial education modules and improving their retirement readiness.',
        category: 'PROCESS',
        tShirtSize: 'M',
        submitterId: 'user-emp-003',
        status: 'PENDING_MODERATION',
        businessValueScore: 72
    },
    {
        title: 'Automated Contribution Increase Program',
        description: 'System that automatically increases employee 401(k) contributions by 1% annually unless they opt-out, helping them save more without thinking about it.',
        category: 'PROCESS',
        tShirtSize: 'S',
        submitterId: 'user-emp-001',
        status: 'APPROVED',
        businessValueScore: 90
    },
    {
        title: 'Virtual Reality Retirement Planning Workshops',
        description: 'Use VR technology to create immersive retirement planning workshops where employees can visualize their future lifestyle based on different saving scenarios.',
        category: 'PRODUCT',
        tShirtSize: 'XL',
        submitterId: 'user-emp-002',
        status: 'PENDING_MODERATION',
        businessValueScore: 65
    },
    {
        title: 'Peer-to-Peer Financial Mentorship Platform',
        description: 'Connect employees who are retirement-ready with those just starting out for mentorship and knowledge sharing about financial planning.',
        category: 'CULTURE',
        tShirtSize: 'M',
        submitterId: 'user-emp-003',
        status: 'APPROVED',
        businessValueScore: 68
    },
    {
        title: 'Green Investment Options',
        description: 'Introduce ESG (Environmental, Social, Governance) focused investment funds for employees who want their retirement savings to align with their values.',
        category: 'PRODUCT',
        tShirtSize: 'L',
        submitterId: 'user-emp-001',
        status: 'APPROVED',
        businessValueScore: 75
    },
    {
        title: 'Instant Loan Approval System',
        description: 'Streamline the 401(k) loan process with instant approval for qualified requests, reducing wait time from days to minutes.',
        category: 'PROCESS',
        tShirtSize: 'M',
        submitterId: 'user-emp-002',
        status: 'PENDING_MODERATION',
        businessValueScore: 82
    }
];

async function main() {
    console.log('Start seeding ...');

    // Create users
    for (const u of userData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role, name: u.name, avatarUrl: u.avatarUrl },
            create: u,
        });
        console.log(`Created user: ${user.name} (${user.role})`);
    }

    // Create ideas
    for (const idea of sampleIdeas) {
        // Check if idea exists
        const existing = await prisma.idea.findFirst({
            where: {
                title: idea.title,
                submitterId: idea.submitterId
            }
        });

        const createdIdea = existing || await prisma.idea.create({
            data: idea
        });

        console.log(`Created idea: ${createdIdea.title}`);

        // Add some votes to make ideas trending
        const voterIds = userData.map(u => u.id).filter(id => id !== idea.submitterId);
        const numVotes = Math.floor(Math.random() * voterIds.length);

        for (let i = 0; i < numVotes; i++) {
            const existingVote = await prisma.vote.findFirst({
                where: {
                    ideaId: createdIdea.id,
                    userId: voterIds[i]
                }
            });

            if (!existingVote) {
                await prisma.vote.create({
                    data: {
                        ideaId: createdIdea.id,
                        userId: voterIds[i]
                    }
                });
            }
        }
        console.log(`  Added ${numVotes} votes`);
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
