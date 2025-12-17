
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import MetricsDashboard from '@/components/MetricsDashboard';
import { getDashboardMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

import { getJiraConfig } from '../jira-actions';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const metrics = await getDashboardMetrics();
    const jiraConfig = await getJiraConfig();

    return (
        <main>
            <Navigation currentUser={user} />
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Mission Control</h1>
                    <p className={styles.subtitle}>System-wide Performance & Analytics</p>
                </div>

                <div className={styles.dashboardContainer}>
                    <MetricsDashboard metrics={metrics} jiraConfig={jiraConfig} />
                </div>
            </div>
        </main>
    );
}
