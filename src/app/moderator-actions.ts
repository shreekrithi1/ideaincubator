'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateStatus(id: string, status: string) {
    await prisma.idea.update({
        where: { id },
        data: { status },
    });
    revalidatePath('/moderator');
    revalidatePath('/');
}

export async function deleteIdea(id: string) {
    await prisma.idea.delete({
        where: { id },
    });
    revalidatePath('/moderator');
    revalidatePath('/');
}
