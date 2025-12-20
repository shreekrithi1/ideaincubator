import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import QuarterlyGoals from '@/components/QuarterlyGoals';

export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function GoalsPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    // Get current quarter and year
    const currentDate = new Date();
    const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const currentYear = currentDate.getFullYear();

    // Fetch all goals with their contributions and linked ideas
    const goals = await prisma.quarterlyGoal.findMany({
        include: {
            contributions: {
                orderBy: { createdAt: 'desc' }
            },
            ideas: {
                include: {
                    submitter: true,
                    votes: true
                },
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: [
            { year: 'desc' },
            { quarter: 'desc' },
            { createdAt: 'desc' }
        ]
    }) as any;

    // Separate current quarter goals from historical goals
    const currentGoals = goals.filter((g: any) =>
        g.quarter === currentQuarter && g.year === currentYear
    );

    const historicalGoals = goals.filter((g: any) =>
        g.quarter !== currentQuarter || g.year !== currentYear
    );

    return (
        <main>
            <Navigation currentUser={user} />
            <div className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Quarterly Goals</h1>
                        <p className={styles.subtitle}>View and contribute to company goals</p>
                    </div>
                </div>

                <QuarterlyGoals
                    currentGoals={currentGoals}
                    historicalGoals={historicalGoals}
                    currentUser={user}
                />
            </div>
        </main>
    );
}
