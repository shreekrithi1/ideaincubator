import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import ModeratorTable from '@/components/ModeratorTable'; // We will create this

export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ModeratorPage() {
    const user = await getCurrentUser();
    if (!['MODERATOR', 'ADMIN'].includes(user?.role || '')) {
        redirect('/');
    }

    const ideas = await prisma.idea.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            submitter: { select: { name: true } }
        }
    });

    const serializedIdeas = ideas.map(idea => ({
        ...idea,
        createdAt: idea.createdAt.toISOString(),
        updatedAt: idea.updatedAt ? idea.updatedAt.toISOString() : null,
        submitterName: idea.submitter?.name || 'Anonymous'
    }));

    return (
        <main>
            <Navigation currentUser={user} />
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Control Tower</h1>
                    <div className={styles.stats}>
                        <span>Pending Review: {ideas.filter(i => i.status === 'SUBMITTED').length}</span>
                    </div>
                </div>
                {/* @ts-ignore */}
                <ModeratorTable ideas={serializedIdeas} />
            </div>
        </main>
    );
}
