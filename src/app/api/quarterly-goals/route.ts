import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const goals = await prisma.quarterlyGoal.findMany({
            where: {
                status: 'ACTIVE'
            },
            orderBy: [
                { year: 'desc' },
                { quarter: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                description: true,
                deadline: true,
                quarter: true,
                year: true,
                status: true,
                category: true
            }
        });

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error fetching quarterly goals:', error);
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}
