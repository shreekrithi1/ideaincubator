'use client';

import { useState, useEffect } from 'react';
import { Target, Clock, TrendingUp, Lightbulb, ThumbsUp, Calendar } from 'lucide-react';
import styles from './GoalBanner.module.css';

interface Goal {
    id: string;
    title: string;
    description: string;
    targetMetric: string;
    currentProgress: number;
    targetValue: number;
    quarter: number;
    year: number;
    status: string;
    category: string | null;
    deadline: string | null;
    contributions: any[];
}

interface Idea {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    voteCount: number;
}

export default function GoalBanner({
    goals,
    userIdeas
}: {
    goals: Goal[];
    userIdeas: Idea[];
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeRemaining = (deadline: string | null) => {
        if (!deadline) return null;

        const now = currentTime.getTime();
        const end = new Date(deadline).getTime();
        const diff = end - now;

        if (diff <= 0) return { expired: true, text: 'Expired' };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return { expired: false, text: `${days}d ${hours}h ${minutes}m` };
        } else {
            return { expired: false, text: `${hours}h ${minutes}m` };
        }
    };

    const getProgressPercentage = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    const getStatusClass = (status: string) => {
        if (status === 'PENDING_MODERATION') return 'pending';
        if (status === 'EXECUTIVE_REVIEW') return 'review';
        if (status === 'IN_DEV' || status === 'IN_DEVELOPMENT') return 'development';
        if (status === 'SUBMITTED') return 'pending';
        return 'pending';
    };

    const getStatusLabel = (status: string) => {
        if (status === 'PENDING_MODERATION') return 'Pending Review';
        if (status === 'EXECUTIVE_REVIEW') return 'Executive Review';
        if (status === 'IN_DEV' || status === 'IN_DEVELOPMENT') return 'In Development';
        if (status === 'SUBMITTED') return 'Submitted';
        return status;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const currentGoal = goals[0]; // Display the first active goal

    return (
        <div>
            {/* Quarterly Goal Banner */}
            {currentGoal ? (
                <div className={styles.goalBanner}>
                    <div className={styles.goalHeader}>
                        <div className={styles.goalInfo}>
                            <div className={styles.goalCategory}>
                                {currentGoal.category || 'General'}
                            </div>
                            <h2 className={styles.goalTitle}>{currentGoal.title}</h2>
                            <p className={styles.goalDescription}>{currentGoal.description}</p>
                        </div>
                        {currentGoal.deadline && (
                            <div className={styles.deadlineTimer}>
                                <Clock size={18} />
                                <span>{getTimeRemaining(currentGoal.deadline)?.text}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.goalStats}>
                        <div className={styles.goalMetric}>
                            <div className={styles.metricLabel}>{currentGoal.targetMetric}</div>
                            <div className={styles.metricValue}>
                                {currentGoal.currentProgress} / {currentGoal.targetValue}
                            </div>
                        </div>

                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${getProgressPercentage(currentGoal.currentProgress, currentGoal.targetValue)}%`
                                    }}
                                />
                            </div>
                            <div className={styles.progressLabel}>
                                {Math.round(getProgressPercentage(currentGoal.currentProgress, currentGoal.targetValue))}% Complete
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.emptyGoal}>
                    <Target size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                    <h3>No Active Quarterly Goals</h3>
                    <p>Check back soon for new strategic objectives</p>
                </div>
            )}

            {/* User's Active Ideas */}
            <div className={styles.userIdeasSection}>
                <h3 className={styles.sectionTitle}>
                    <Lightbulb size={24} />
                    Your Active Ideas
                </h3>

                {userIdeas.length > 0 ? (
                    <div className={styles.ideasGrid}>
                        {userIdeas.map((idea) => (
                            <div key={idea.id} className={styles.ideaCard}>
                                <div className={styles.ideaHeader}>
                                    <span className={`${styles.ideaStatus} ${styles[getStatusClass(idea.status)]}`}>
                                        {getStatusLabel(idea.status)}
                                    </span>
                                </div>
                                <h4 className={styles.ideaTitle}>{idea.title}</h4>
                                <p className={styles.ideaDescription}>{idea.description}</p>
                                <div className={styles.ideaFooter}>
                                    <div className={styles.ideaVotes}>
                                        <ThumbsUp size={16} />
                                        <span>{idea.voteCount} votes</span>
                                    </div>
                                    <div className={styles.ideaDate}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                        {formatDate(idea.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyIdeas}>
                        <Lightbulb size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                        <h3>No Active Ideas Yet</h3>
                        <p>Start contributing by submitting your first innovative idea!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
