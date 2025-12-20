'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import { Plus } from 'lucide-react';
import SparkDialog from '@/components/SparkDialog';
import IdeaDashboard from '@/components/IdeaDashboard';
import DetailPanel from '@/components/DetailPanel';
import GoalBanner from '@/components/GoalBanner';

import MetricsDashboard from '@/components/MetricsDashboard';
import { DashboardMetrics } from '@/lib/metrics';
import TrendingSidebar from '@/components/TrendingSidebar';

export default function HomeClient({
    ideas,
    metrics,
    trending,
    currentUser,
    currentGoals = [],
    userActiveIdeas = []
}: {
    ideas: any[];
    metrics: DashboardMetrics;
    trending: any[];
    currentUser: any;
    currentGoals?: any[];
    userActiveIdeas?: any[];
}) {
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const selectedIdea = ideas.find(i => i.id === selectedIdeaId);

    return (
        <main>
            <Navigation currentUser={currentUser} />

            <div className={styles.main}>
                <div className={styles.container}>
                    {/* Quarterly Goal Banner and User's Active Ideas */}
                    <GoalBanner goals={currentGoals} userIdeas={userActiveIdeas} />

                    <div className={styles.layoutGrid}>
                        <div className={styles.contentArea}>
                            {/* Dashboard View */}
                            <IdeaDashboard
                                ideas={ideas}
                                onSelectIdea={setSelectedIdeaId}
                                selectedIdeaId={selectedIdeaId}
                            />
                        </div>

                        <aside className={styles.rightPanel}>
                            <TrendingSidebar ideas={trending} />
                        </aside>
                    </div>
                </div>

                {/* Slide-over Inspector */}
                {selectedIdea && (
                    <DetailPanel
                        idea={selectedIdea}
                        onClose={() => setSelectedIdeaId(null)}
                    />
                )}

                <SparkDialog trigger={
                    <button className={styles.fab}>
                        <Plus size={32} />
                    </button>
                } />
            </div>
        </main>
    );
}
