'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function toggleVote(ideaId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const existingVote = await prisma.vote.findUnique({
        where: {
            ideaId_userId: {
                ideaId,
                userId: user.id
            }
        }
    });

    if (existingVote) {
        await prisma.vote.delete({
            where: { id: existingVote.id }
        });
    } else {
        await prisma.vote.create({
            data: {
                ideaId,
                userId: user.id
            }
        });
    }

    revalidatePath('/');
}

export async function getTrendingIdeas() {
    const ideas = await prisma.idea.findMany({
        where: {},
        include: {
            submitter: { select: { name: true, avatarUrl: true } },
            votes: true
        },
        orderBy: {
            votes: {
                _count: 'desc'
            }
        },
        take: 10
    });
    return ideas;
}
