import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import BoardroomDashboard from '@/components/BoardroomDashboard';

export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BoardroomPage() {
    const user = await getCurrentUser();
    if (!['EXECUTIVE', 'ADMIN'].includes(user?.role || '')) {
        redirect('/');
    }

    const ideas = await prisma.idea.findMany({
        where: {
            status: 'EXECUTIVE_REVIEW'
        },
        include: {
            submitter: true,
            _count: {
                select: { votes: true }
            }
        },
        orderBy: { businessValueScore: 'desc' }
    });

    return (
        <main>
            <Navigation currentUser={user} />
            <div className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>The Boardroom</h1>
                        <p className={styles.subtitle}>Executive Decision Gate • Strategic Investment Review</p>
                    </div>
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{ideas.length}</div>
                            <div className={styles.statLabel}>Pending Review</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{ideas.filter(i => i.businessValueScore >= 80).length}</div>
                            <div className={styles.statLabel}>High Priority</div>
                        </div>
                    </div>
                </div>

                <BoardroomDashboard ideas={ideas} />
            </div>
        </main>
    );
}
