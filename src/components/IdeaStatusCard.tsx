
import React from 'react';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Idea } from '@prisma/client';
import styles from './IdeaStatusCard.module.css';

// Extended type to include potential joined fields if needed, 
// but for now we map from standard Prisma Idea type
interface IdeaWithDetails extends Idea {
    category?: string;
    submitterAvatar?: string;
    approverAvatar?: string;
}

const IdeaStatusCard = ({ idea }: { idea: IdeaWithDetails }) => {
    const steps = [
        { key: 'DRAFT', label: 'Ideation' },
        { key: 'MODERATED', label: 'Curation' },
        { key: 'EXECUTIVE_REVIEW', label: 'Strategy' },
        { key: 'IN_DEV', label: 'Building (JIRA)' },
        { key: 'G2M_READY', label: 'G2M Launch' }
    ];

    const getCurrentStepIndex = (status: string) => {
        const statusMap: Record<string, number> = {
            'DRAFT': 0, 'SUBMITTED': 0,
            'MODERATED': 1,
            'EXECUTIVE_REVIEW': 2,
            'IN_DEV': 3,
            'G2M_READY': 4, 'LAUNCHED': 4
        };
        return statusMap[status] || 0;
    };

    const currentStep = getCurrentStepIndex(idea.status);
    const score = idea.businessValueScore || 0;

    return (
        <div className={styles.card}>
            {/* HEADER SECTION */}
            <div className={styles.header}>
                <div>
                    <div className={styles.metaBadge}>
                        <span className={styles.badge}>
                            {idea.category || "Innovation"}
                        </span>
                        <span className={styles.idTag}>#{idea.id.slice(0, 8)}</span>
                    </div>
                    <h3 className={styles.title}>{idea.title}</h3>
                    <p className={styles.description}>{idea.description}</p>
                </div>

                {/* KPI BADGE */}
                <div className={styles.scoreBox}>
                    <div className={styles.scoreLabel}>Biz Value Score</div>
                    <div className={`${styles.scoreValue} ${score > 80 ? styles.highScore : ''}`}>
                        {score}/100
                    </div>
                </div>
            </div>

            {/* PROGRESS STEPPER */}
            <div className={styles.stepperContainer}>
                {/* Background Line */}
                <div className={styles.stepperLineBg}></div>

                {/* Active Progress Line */}
                <div
                    className={styles.stepperLineActive}
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.key} className={styles.stepItem}>
                            <div
                                className={`${styles.stepIcon} 
                  ${isCompleted ? styles.stepCompleted :
                                        isCurrent ? styles.stepCurrent :
                                            styles.stepPending}`}
                            >
                                {isCompleted ? <CheckCircle size={16} /> :
                                    isCurrent ? <Clock size={16} /> :
                                        <div className={styles.stepDot} />}
                            </div>
                            <span
                                className={`${styles.stepLabel}
                  ${isCurrent ? styles.labelCurrent : isCompleted ? styles.labelCompleted : styles.labelPending}`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER ACTIONS */}
            <div className={styles.footer}>
                <div className={styles.contributorInfo}>
                    <div className={styles.avatarStack}>
                        <img className={styles.avatar} src={idea.submitterAvatar || "https://i.pravatar.cc/150?u=1"} alt="Submitter" />
                        {idea.approverAvatar && (
                            <img className={styles.avatar} src={idea.approverAvatar} alt="Approver" />
                        )}
                    </div>
                    <span className={styles.dateLabel}>
                        Last updated {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                </div>

                {/* Dynamic Action Buttons based on Stage */}
                <div className={styles.actions}>
                    {currentStep >= 3 && idea.jiraTicketId && (
                        <a
                            href={`https://${process.env.NEXT_PUBLIC_JIRA_DOMAIN || 'empower.atlassian.net'}/browse/${idea.jiraTicketId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.jiraBtn}
                        >
                            Open Epic {idea.jiraTicketId}
                        </a>
                    )}

                    {(currentStep === 4) && (
                        <button className={styles.launchBtn}>
                            <ExternalLink size={16} />
                            View Launch Assets
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdeaStatusCard;
