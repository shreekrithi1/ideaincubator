'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createQuarterlyGoal(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !['EXECUTIVE', 'ADMIN'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const targetMetric = formData.get('targetMetric') as string;
    const targetValue = parseInt(formData.get('targetValue') as string);
    const quarter = parseInt(formData.get('quarter') as string);
    const year = parseInt(formData.get('year') as string);
    const category = formData.get('category') as string;
    const deadlineStr = formData.get('deadline') as string;
    const deadline = deadlineStr ? new Date(deadlineStr) : null;

    const goal = await prisma.quarterlyGoal.create({
        data: {
            title,
            description,
            targetMetric,
            targetValue,
            quarter,
            year,
            category,
            deadline,
            createdById: user.id,
        }
    });

    revalidatePath('/boardroom');
    return goal;
}

export async function updateGoalProgress(goalId: string, progress: number) {
    const user = await getCurrentUser();
    if (!user || !['EXECUTIVE', 'ADMIN'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    const goal = await prisma.quarterlyGoal.findUnique({
        where: { id: goalId }
    });

    if (!goal) {
        throw new Error('Goal not found');
    }

    const status = progress >= goal.targetValue ? 'COMPLETED' : 'ACTIVE';
    const completedAt = status === 'COMPLETED' ? new Date() : null;

    const updatedGoal = await prisma.quarterlyGoal.update({
        where: { id: goalId },
        data: {
            currentProgress: progress,
            status,
            completedAt
        }
    });

    revalidatePath('/boardroom');
    return updatedGoal;
}

export async function deleteQuarterlyGoal(goalId: string) {
    const user = await getCurrentUser();
    if (!user || !['EXECUTIVE', 'ADMIN'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    await prisma.quarterlyGoal.delete({
        where: { id: goalId }
    });

    revalidatePath('/boardroom');
}

export async function getQuarterlyGoals(quarter?: number, year?: number) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const currentDate = new Date();
    const currentQuarter = quarter || Math.ceil((currentDate.getMonth() + 1) / 3);
    const currentYear = year || currentDate.getFullYear();

    const goals = await prisma.quarterlyGoal.findMany({
        where: {
            quarter: currentQuarter,
            year: currentYear
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return goals;
}

export async function getAllQuarterlyGoals() {
    const user = await getCurrentUser();
    if (!user || !['EXECUTIVE', 'ADMIN'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    const goals = await prisma.quarterlyGoal.findMany({
        orderBy: [
            { year: 'desc' },
            { quarter: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    return goals;
}

export async function markGoalAsMissed(goalId: string) {
    const user = await getCurrentUser();
    if (!user || !['EXECUTIVE', 'ADMIN'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    const updatedGoal = await prisma.quarterlyGoal.update({
        where: { id: goalId },
        data: {
            status: 'MISSED'
        }
    });

    revalidatePath('/boardroom');
    return updatedGoal;
}

export async function addGoalContribution(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const goalId = formData.get('goalId') as string;
    const amount = parseInt(formData.get('amount') as string);
    const notes = formData.get('notes') as string || '';

    // Create the contribution
    const contribution = await prisma.goalContribution.create({
        data: {
            goalId,
            contributorId: user.id,
            contributorName: user.name,
            contributorRole: user.role,
            amount,
            notes
        }
    });

    // Update the goal's current progress
    const goal = await prisma.quarterlyGoal.findUnique({
        where: { id: goalId },
        include: {
            contributions: true
        }
    });

    if (goal) {
        const totalProgress = goal.contributions.reduce((sum, c) => sum + c.amount, 0);
        const status = totalProgress >= goal.targetValue ? 'COMPLETED' : 'ACTIVE';
        const completedAt = status === 'COMPLETED' ? new Date() : goal.completedAt;

        await prisma.quarterlyGoal.update({
            where: { id: goalId },
            data: {
                currentProgress: totalProgress,
                status,
                completedAt
            }
        });
    }

    revalidatePath('/boardroom');
    return contribution;
}

export async function getGoalContributions(goalId: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const contributions = await prisma.goalContribution.findMany({
        where: { goalId },
        orderBy: { createdAt: 'desc' }
    });

    return contributions;
}

export async function getGoalWithContributions(goalId: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const goal = await prisma.quarterlyGoal.findUnique({
        where: { id: goalId },
        include: {
            contributions: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return goal;
}
