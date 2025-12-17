
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ExternalLink, X, ArrowRight } from 'lucide-react';
import styles from './DetailPanel.module.css';

interface Idea {
    id: string;
    title: string;
    description: string;
    status: string;
    jiraTicketId: string | null;
    jiraStatus: string | null;
    submitterId: string;
}

export default function DetailPanel({ idea, onClose }: { idea: any, onClose: () => void }) {
    const router = useRouter();
    if (!idea) return null;

    const handleManage = () => {
        if (['DRAFT', 'SUBMITTED'].includes(idea.status)) {
            router.push('/moderator');
        } else if (['MODERATED', 'EXECUTIVE_REVIEW'].includes(idea.status)) {
            router.push('/boardroom');
        } else if (['IN_DEV', 'G2M_READY', 'LAUNCHED'].includes(idea.status)) {
            // In reality, maybe a PMO dashboard, but for now Boardroom history or JIRA
            if (idea.jiraTicketId) {
                window.open(`https://${process.env.NEXT_PUBLIC_JIRA_DOMAIN || 'empower.atlassian.net'}/browse/${idea.jiraTicketId}`, '_blank');
            } else {
                router.push('/boardroom');
            }
        } else {
            router.push('/moderator');
        }
    };

    return (
        <div className={styles.drawer}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <span className={styles.idLabel}>{idea.id}</span>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>
                <h2 className={styles.title}>{idea.title}</h2>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className={styles.content}>

                {/* KPI SECTION */}
                <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiLabel}>Budget Allocation</div>
                        <div className={styles.kpiValue}>$50,000</div>
                        {/* Mock data for now, ideally format from db decimal */}
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiLabel}>Time to Market</div>
                        <div className={styles.kpiValue}>Q3 2024</div>
                    </div>
                </div>

                {/* INTEGRATION STATUS */}
                <div>
                    <h4 className={styles.sectionTitle}>System Integrations</h4>
                    <div className={styles.integrationBox}>
                        {/* JIRA ROW */}
                        <div className={styles.integrationRow}>
                            <div className={styles.integrationInfo}>
                                <div className={styles.integrationIcon}>J</div>
                                <div>
                                    <div className={styles.integrationName}>JIRA Epic</div>
                                    <div className={styles.integrationMeta}>
                                        {idea.jiraTicketId || 'Not Linked'} • {idea.jiraStatus || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            {idea.jiraTicketId && (
                                <a
                                    href={`https://${process.env.NEXT_PUBLIC_JIRA_DOMAIN || 'empower.atlassian.net'}/browse/${idea.jiraTicketId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                >
                                    View <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                        {/* SLACK ROW */}
                        <div className={styles.integrationRow}>
                            <div className={styles.integrationInfo}>
                                <div className={styles.integrationIcon}>S</div>
                                <div>
                                    <div className={styles.integrationName}>Channel</div>
                                    <div className={styles.integrationMeta}>#proj-innovation-feed</div>
                                </div>
                            </div>
                            <span className={styles.statusActive}>Active</span>
                        </div>
                    </div>
                </div>

                {/* AUDIT LOG (Forensic Ready) */}
                <div>
                    <h4 className={styles.sectionTitle}>
                        <ShieldCheck size={14} /> Audit Trail
                    </h4>
                    <div className={styles.timeline}>

                        {/* Mock Log Entry 1 - ideally fetch from SystemAuditLog */}
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineDot} ${styles.dotSuccess}`}></div>
                            <div className={styles.logTitle}>Approved by CIO</div>
                            <div className={styles.logMeta}>Automated JIRA Sync triggered</div>
                            <div className={styles.logTime}>Oct 24, 14:02 • IP: 10.0.4.12</div>
                        </div>

                        {/* Log Entry 2 */}
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineDot} ${styles.dotGray}`}></div>
                            <div className={styles.logTitle}>Submitted by {idea.submitterId}</div>
                            <div className={styles.logMeta}>Initial Draft Created</div>
                            <div className={styles.logTime}>Oct 23, 09:15 • IP: 192.168.1.45</div>
                        </div>

                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className={styles.footer}>
                <button className={styles.manageBtn} onClick={handleManage}>
                    Manage Governance
                </button>
            </div>
        </div>
    );
}
