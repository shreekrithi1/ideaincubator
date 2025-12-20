'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, TrendingUp, Calendar, Award, X, Edit, Trash2, Clock, Users } from 'lucide-react';
import { createQuarterlyGoal, updateGoalProgress, deleteQuarterlyGoal, addGoalContribution } from '@/app/goals-actions';
import styles from './QuarterlyGoals.module.css';

interface Contribution {
    id: string;
    contributorName: string;
    contributorRole: string;
    amount: number;
    notes: string | null;
    createdAt: Date;
}

interface Idea {
    id: string;
    title: string;
    description: string;
    status: string;
    submitter: {
        name: string;
        email: string;
    };
    votes: any[];
    createdAt: Date;
}

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
    deadline: Date | null;
    createdAt: Date;
    completedAt: Date | null;
    contributions: Contribution[];
    ideas: Idea[];
}

interface CurrentUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export default function QuarterlyGoals({
    currentGoals = [],
    historicalGoals = [],
    currentUser
}: {
    currentGoals?: Goal[];
    historicalGoals?: Goal[];
    currentUser: CurrentUser;
}) {
    const [showModal, setShowModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [editingProgress, setEditingProgress] = useState<string | null>(null);
    const [progressValue, setProgressValue] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second for countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const currentDate = new Date();
    const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const currentYear = currentDate.getFullYear();

    // Ensure arrays are valid before spreading
    const safeCurrentGoals = Array.isArray(currentGoals) ? currentGoals : [];
    const safeHistoricalGoals = Array.isArray(historicalGoals) ? historicalGoals : [];

    const allGoals = [...safeCurrentGoals, ...safeHistoricalGoals];
    const activeGoals = safeCurrentGoals.filter((g: Goal) => g.status === 'ACTIVE');
    const completedGoals = allGoals.filter((g: Goal) => g.status === 'COMPLETED');
    const missedGoals = allGoals.filter((g: Goal) => g.status === 'MISSED');

    const isExecutiveOrAdmin = ['EXECUTIVE', 'ADMIN'].includes(currentUser?.role || '');

    const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createQuarterlyGoal(formData);
        setShowModal(false);
        window.location.reload();
    };

    const handleUpdateProgress = async (goalId: string) => {
        await updateGoalProgress(goalId, progressValue);
        setEditingProgress(null);
        window.location.reload();
    };

    const handleDelete = async (goalId: string) => {
        if (confirm('Are you sure you want to delete this goal?')) {
            await deleteQuarterlyGoal(goalId);
            window.location.reload();
        }
    };

    const handleContribute = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await addGoalContribution(formData);
        setShowContributeModal(false);
        setSelectedGoal(null);
        window.location.reload();
    };

    const getProgressPercentage = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    const getTimeRemaining = (deadline: Date | null) => {
        if (!deadline) return null;

        const now = currentTime.getTime();
        const end = new Date(deadline).getTime();
        const diff = end - now;

        if (diff <= 0) return { expired: true, text: 'Expired' };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
            return { expired: false, text: `${days}d ${hours}h ${minutes}m` };
        } else if (hours > 0) {
            return { expired: false, text: `${hours}h ${minutes}m ${seconds}s` };
        } else {
            return { expired: false, text: `${minutes}m ${seconds}s` };
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Target className={styles.headerIcon} />
                    <div>
                        <h2 className={styles.title}>Quarterly Goals</h2>
                        <p className={styles.subtitle}>Q{currentQuarter} {currentYear} • Strategic Objectives</p>
                    </div>
                </div>
                {isExecutiveOrAdmin && (
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Set New Goal
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--accent-blue)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{activeGoals.length}</div>
                        <div className={styles.statLabel}>Active Goals</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--success-green)' }}>
                        <Award size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{completedGoals.length}</div>
                        <div className={styles.statLabel}>Completed</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--warning-orange)' }}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{missedGoals.length}</div>
                        <div className={styles.statLabel}>Missed</div>
                    </div>
                </div>
            </div>

            {/* Current Quarter Goals */}
            <h3 className={styles.sectionTitle}>Current Quarter (Q{currentQuarter} {currentYear})</h3>
            {safeCurrentGoals.length === 0 ? (
                <div className={styles.emptyState}>
                    <Target size={48} className={styles.emptyIcon} />
                    <h3>No Goals Set for Current Quarter</h3>
                    <p>Start by setting your first quarterly goal</p>
                    {isExecutiveOrAdmin && (
                        <button className={styles.emptyButton} onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Create Goal
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.goalsGrid}>
                    {safeCurrentGoals.map((goal: Goal) => {
                        const progress = getProgressPercentage(goal.currentProgress, goal.targetValue);
                        const isEditing = editingProgress === goal.id;
                        const timeRemaining = getTimeRemaining(goal.deadline);

                        return (
                            <motion.div
                                key={goal.id}
                                className={`${styles.goalCard} ${styles[goal.status.toLowerCase()]}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className={styles.goalHeader}>
                                    <div className={styles.goalCategory}>{goal.category || 'General'}</div>
                                    <div className={styles.goalActions}>
                                        <button
                                            className={styles.iconButton}
                                            onClick={() => handleDelete(goal.id)}
                                            title="Delete goal"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className={styles.goalTitle}>{goal.title}</h3>
                                <p className={styles.goalDescription}>{goal.description}</p>

                                {/* Deadline Timer */}
                                {goal.deadline && (
                                    <div className={`${styles.deadlineTimer} ${timeRemaining?.expired ? styles.expired : ''}`}>
                                        <Clock size={16} />
                                        <span>{timeRemaining?.text}</span>
                                    </div>
                                )}

                                <div className={styles.goalMetric}>
                                    <div className={styles.metricLabel}>{goal.targetMetric}</div>
                                    <div className={styles.metricValue}>
                                        {goal.currentProgress} / {goal.targetValue}
                                    </div>
                                </div>

                                <div className={styles.progressBar}>
                                    <motion.div
                                        className={styles.progressFill}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className={styles.progressLabel}>{Math.round(progress)}% Complete</div>

                                {/* Contributions Section */}
                                {goal.contributions.length > 0 && (
                                    <div className={styles.contributionsSection}>
                                        <div className={styles.contributionsHeader}>
                                            <Users size={16} />
                                            <span>{goal.contributions.length} Contribution{goal.contributions.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className={styles.contributionsList}>
                                            {goal.contributions.slice(0, 3).map((contrib) => (
                                                <div key={contrib.id} className={styles.contributionItem}>
                                                    <div className={styles.contributorInfo}>
                                                        <span className={styles.contributorName}>{contrib.contributorName}</span>
                                                        <span className={styles.contributorRole}>{contrib.contributorRole}</span>
                                                    </div>
                                                    <div className={styles.contributionAmount}>+{contrib.amount}</div>
                                                </div>
                                            ))}
                                            {goal.contributions.length > 3 && (
                                                <div className={styles.moreContributions}>
                                                    +{goal.contributions.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {goal.status === 'ACTIVE' && (
                                    <div className={styles.updateProgress}>
                                        {isEditing ? (
                                            <div className={styles.progressEditor}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={goal.targetValue}
                                                    value={progressValue}
                                                    onChange={(e) => setProgressValue(parseInt(e.target.value))}
                                                    className={styles.progressInput}
                                                    placeholder="Enter progress"
                                                />
                                                <button
                                                    className={styles.saveButton}
                                                    onClick={() => handleUpdateProgress(goal.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className={styles.cancelButton}
                                                    onClick={() => setEditingProgress(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    className={styles.updateButton}
                                                    onClick={() => {
                                                        setEditingProgress(goal.id);
                                                        setProgressValue(goal.currentProgress);
                                                    }}
                                                >
                                                    <Edit size={14} />
                                                    Update Progress
                                                </button>
                                                <button
                                                    className={styles.contributeButton}
                                                    onClick={() => {
                                                        setSelectedGoal(goal);
                                                        setShowContributeModal(true);
                                                    }}
                                                >
                                                    <Plus size={14} />
                                                    Contribute
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {goal.status === 'COMPLETED' && goal.completedAt && (
                                    <div className={styles.completedBadge}>
                                        <Award size={14} />
                                        Completed {new Date(goal.completedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Historical Goals */}
            {safeHistoricalGoals.length > 0 && (
                <>
                    <h3 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>History</h3>
                    <div className={styles.historySection}>
                        {safeHistoricalGoals.map((goal: Goal) => {
                            const progress = getProgressPercentage(goal.currentProgress, goal.targetValue);
                            const timeRemaining = getTimeRemaining(goal.deadline);

                            return (
                                <motion.div
                                    key={goal.id}
                                    className={`${styles.historyCard} ${styles[goal.status.toLowerCase()]}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className={styles.historyHeader}>
                                        <div>
                                            <div className={styles.historyQuarter}>
                                                Q{goal.quarter} {goal.year} • {goal.category || 'General'}
                                            </div>
                                            <h4 className={styles.historyTitle}>{goal.title}</h4>
                                            <p className={styles.historyDescription}>{goal.description}</p>
                                        </div>
                                        <div className={styles.historyStatus}>
                                            <span className={`${styles.statusBadge} ${styles[goal.status.toLowerCase()]}`}>
                                                {goal.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.historyMetrics}>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>{goal.targetMetric}</span>
                                            <span className={styles.metricValue}>
                                                {goal.currentProgress} / {goal.targetValue} ({Math.round(progress)}%)
                                            </span>
                                        </div>
                                        {goal.deadline && (
                                            <div className={styles.metricItem}>
                                                <span className={styles.metricLabel}>Deadline</span>
                                                <span className={styles.metricValue}>
                                                    {new Date(goal.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Linked Ideas */}
                                    {goal.ideas && goal.ideas.length > 0 && (
                                        <div className={styles.linkedIdeas}>
                                            <div className={styles.linkedIdeasHeader}>
                                                <strong>Ideas Submitted ({goal.ideas.length})</strong>
                                            </div>
                                            <div className={styles.ideasList}>
                                                {goal.ideas.map((idea: Idea) => (
                                                    <div key={idea.id} className={styles.ideaItem}>
                                                        <div className={styles.ideaInfo}>
                                                            <span className={styles.ideaTitle}>{idea.title}</span>
                                                            <span className={styles.ideaSubmitter}>
                                                                by {idea.submitter.name} • {idea.votes.length} votes
                                                            </span>
                                                        </div>
                                                        <span className={`${styles.ideaStatus} ${styles[idea.status.toLowerCase()]}`}>
                                                            {idea.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contributions for historical goals */}
                                    {goal.contributions.length > 0 && (
                                        <div className={styles.contributionsSection}>
                                            <div className={styles.contributionsHeader}>
                                                <Users size={16} />
                                                <span>{goal.contributions.length} Contribution{goal.contributions.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={styles.contributionsList}>
                                                {goal.contributions.slice(0, 3).map((contrib: Contribution) => (
                                                    <div key={contrib.id} className={styles.contributionItem}>
                                                        <div className={styles.contributorInfo}>
                                                            <span className={styles.contributorName}>{contrib.contributorName}</span>
                                                            <span className={styles.contributorRole}>{contrib.contributorRole}</span>
                                                        </div>
                                                        <div className={styles.contributionAmount}>+{contrib.amount}</div>
                                                    </div>
                                                ))}
                                                {goal.contributions.length > 3 && (
                                                    <div className={styles.moreContributions}>
                                                        +{goal.contributions.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Create Goal Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>Set Quarterly Goal</h3>
                                <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGoal} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Goal Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g., Approve 15 high-value innovations"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        placeholder="Describe the goal and its strategic importance..."
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Category</label>
                                        <select name="category" className={styles.select}>
                                            <option value="Innovation">Innovation</option>
                                            <option value="Efficiency">Efficiency</option>
                                            <option value="Revenue">Revenue</option>
                                            <option value="Quality">Quality</option>
                                            <option value="Culture">Culture</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Quarter</label>
                                        <select name="quarter" defaultValue={currentQuarter} className={styles.select}>
                                            <option value="1">Q1</option>
                                            <option value="2">Q2</option>
                                            <option value="3">Q3</option>
                                            <option value="4">Q4</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Year</label>
                                        <input
                                            type="number"
                                            name="year"
                                            defaultValue={currentYear}
                                            min={currentYear}
                                            max={currentYear + 5}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Deadline (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        name="deadline"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Target Metric</label>
                                    <input
                                        type="text"
                                        name="targetMetric"
                                        required
                                        placeholder="e.g., Ideas Approved, JIRA Stories Created"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Target Value</label>
                                    <input
                                        type="number"
                                        name="targetValue"
                                        required
                                        min="1"
                                        placeholder="e.g., 15"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className={styles.cancelModalButton}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.submitButton}>
                                        <Target size={16} />
                                        Create Goal
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contribute Modal */}
            <AnimatePresence>
                {showContributeModal && selectedGoal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowContributeModal(false);
                            setSelectedGoal(null);
                        }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>Contribute to Goal</h3>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => {
                                        setShowContributeModal(false);
                                        setSelectedGoal(null);
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleContribute} className={styles.form}>
                                <input type="hidden" name="goalId" value={selectedGoal.id} />

                                <div className={styles.goalSummary}>
                                    <h4>{selectedGoal.title}</h4>
                                    <p>{selectedGoal.targetMetric}: {selectedGoal.currentProgress} / {selectedGoal.targetValue}</p>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Your Contribution Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        min="1"
                                        placeholder="e.g., 2"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Notes (Optional)</label>
                                    <textarea
                                        name="notes"
                                        placeholder="Add any details about your contribution..."
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className={styles.cancelModalButton}
                                        onClick={() => {
                                            setShowContributeModal(false);
                                            setSelectedGoal(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.submitButton}>
                                        <Plus size={16} />
                                        Submit Contribution
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
