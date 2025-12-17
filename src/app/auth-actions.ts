'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';



import * as auth from '@/lib/auth';

export async function loginUser(userId: string) {
    console.log('Logging in user:', userId);
    (await cookies()).set('userId', userId);
    revalidatePath('/');
}

export async function getCurrentUser() {
    return auth.getCurrentUser();
}

export async function getAllUsers() {
    return auth.getAllUsers();
}

export async function logoutUser() {
    (await cookies()).delete('userId');
    revalidatePath('/');
}
