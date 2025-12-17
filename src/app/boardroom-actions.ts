'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createJiraStoryForIdea } from './jira-actions';

export async function generateSWOT(description: string) {
    // Simulated AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        strengths: ['Innovative approach', 'Internal synergy', 'High potential ROI'],
        weaknesses: ['Requires significant dev resources', 'Unproven market fit'],
        opportunities: ['First to market advantage', 'Can leverage existing client base'],
        threats: ['Competitor X is building similar', 'Tech debt accumulation']
    };
}

export async function approveStrategy(id: string, sizing: string, notes: string) {
    // 1. Fetch current Idea Details
    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) throw new Error("Idea not found");

    // 2. Create Review Record
    await prisma.review.create({
        data: {
            ideaId: id,
            reviewerId: 'CIO-001', // Simulated CIO
            role: 'CIO',
            decision: 'APPROVE',
            comments: `Effort: ${sizing}. Notes: ${notes}`,
        }
    });

    // 3. Update Status first (Optimistic)
    await prisma.idea.update({
        where: { id },
        data: {
            status: 'IN_DEV',
        }
    });

    // 4. Trigger JIRA Sync (Non-blocking - don't fail if JIRA fails)
    try {
        await createJiraStoryForIdea(id);
        console.log('✅ JIRA story created successfully');
    } catch (error) {
        console.error('⚠️ JIRA sync failed, but idea was approved:', error);
        // Update idea to show JIRA sync failed
        await prisma.idea.update({
            where: { id },
            data: {
                jiraTicketId: 'SYNC-FAILED',
                jiraStatus: 'Manual sync required'
            }
        });
    }

    revalidatePath('/boardroom');
    revalidatePath('/');
}

export async function rejectStrategy(id: string, reason: string) {
    await prisma.review.create({
        data: {
            ideaId: id,
            reviewerId: 'CIO-001',
            role: 'CIO',
            decision: 'REJECT',
            comments: reason,
        }
    });

    await prisma.idea.update({
        where: { id },
        data: { status: 'DRAFT' } // Send back to drawing board
    });

    revalidatePath('/boardroom');
}
