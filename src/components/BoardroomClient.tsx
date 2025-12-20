'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Target } from 'lucide-react';
import BoardroomDashboard from './BoardroomDashboard';
import QuarterlyGoals from './QuarterlyGoals';
import styles from './BoardroomClient.module.css';

interface BoardroomClientProps {
    ideas: any[];
    goals: any[];
    currentUser: any;
}

export default function BoardroomClient({ ideas, goals, currentUser }: BoardroomClientProps) {
    const [activeTab, setActiveTab] = useState<'ideas' | 'goals'>('ideas');

    // Split goals into current and historical
    const currentDate = new Date();
    const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const currentYear = currentDate.getFullYear();

    const currentGoals = goals.filter(g =>
        g.quarter === currentQuarter && g.year === currentYear
    );

    const historicalGoals = goals.filter(g =>
        g.quarter !== currentQuarter || g.year !== currentYear
    );

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'ideas' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('ideas')}
                >
                    <BrainCircuit size={20} />
                    <span>Ideas Review</span>
                    {ideas.length > 0 && (
                        <span className={styles.badge}>{ideas.length}</span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'goals' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('goals')}
                >
                    <Target size={20} />
                    <span>Quarterly Goals</span>
                    {goals.filter(g => g.status === 'ACTIVE').length > 0 && (
                        <span className={styles.badge}>
                            {goals.filter(g => g.status === 'ACTIVE').length}
                        </span>
                    )}
                </button>
                <motion.div
                    className={styles.indicator}
                    animate={{
                        x: activeTab === 'ideas' ? 0 : '100%'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </div>

            <div className={styles.content}>
                {activeTab === 'ideas' ? (
                    <BoardroomDashboard ideas={ideas} />
                ) : (
                    <QuarterlyGoals
                        currentGoals={currentGoals}
                        historicalGoals={historicalGoals}
                        currentUser={currentUser}
                    />
                )}
            </div>
        </div>
    );
}
