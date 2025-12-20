'use server'
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function checkDuplicates(text: string) {
    if (!text || text.length < 3) return [];

    // Simulated Vector Search
    const ideas = await prisma.idea.findMany({
        where: {
            OR: [
                { title: { contains: text } },
                { description: { contains: text } }
            ]
        },
        take: 3,
        select: { id: true, title: true }
    });

    return ideas;
}

export async function submitIdea(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tShirtSize = formData.get('tShirtSize') as string;
    const riskMitigation = formData.get('riskMitigation') as string;
    const executiveSponsor = formData.get('executiveSponsor') as string;
    const quarterlyGoalId = formData.get('quarterlyGoalId') as string | null;

    // 1. Vector Search for Duplicates (Simulated)
    const isDuplicate = await checkDuplicates(title);
    if (isDuplicate.length > 0) { // Check if the array is not empty
        return { success: false, message: "Similar idea found. Please check existing ideas." };
    }

    // Get Current User
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Unauthorized" };
    }

    // 2. Persist to DB
    await prisma.idea.create({
        data: {
            title,
            description,
            submitterId: user.id, // Using Name for display simplicity in UI
            category: category || 'General',
            tShirtSize: tShirtSize || 'M',
            riskMitigation: riskMitigation || null,
            executiveSponsor: executiveSponsor || null,
            quarterlyGoalId: quarterlyGoalId || null,
            status: 'PENDING_MODERATION',
            businessValueScore: Math.floor(Math.random() * 100), // Placeholder AI score
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function updateIdea(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tShirtSize = formData.get('tShirtSize') as string;
    const riskMitigation = formData.get('riskMitigation') as string;
    const executiveSponsor = formData.get('executiveSponsor') as string;
    const quarterlyGoalId = formData.get('quarterlyGoalId') as string | null;

    try {
        await prisma.idea.update({
            where: { id },
            data: {
                title,
                description,
                category,
                tShirtSize,
                riskMitigation: riskMitigation || null,
                executiveSponsor: executiveSponsor || null,
                quarterlyGoalId: quarterlyGoalId || null,
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update idea:", error);
        return { success: false, message: "Failed to update idea" };
    }
}
