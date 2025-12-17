import React, { useState } from 'react';
import {
    MoreHorizontal, Filter, Download,
    ChevronLeft, ChevronRight, ThumbsUp, Edit2
} from 'lucide-react';
import { toggleVote } from '@/app/vote-actions';
import SparkDialog from './SparkDialog';
import styles from './IdeaDashboard.module.css';

// Type definition for props
interface Idea {
    id: string;
    title: string;
    status: string;
    businessValueScore: number | null;
    createdAt: string; // Serialized date
    submitterId: string;
    submitterName: string;
    voteCount: number;
    hasVoted: boolean;
}

const StatusBadge = ({ stage }: { stage: string }) => {
    return (
        <span className={`${styles.badge} ${styles[stage] || styles.DRAFT}`}>
            {stage.replace('_', ' ')}
        </span>
    );
};

export default function IdeaDashboard({ ideas, onSelectIdea, selectedIdeaId }: { ideas: Idea[], onSelectIdea: (id: string | null) => void, selectedIdeaId: string | null }) {

    const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

    const handleVote = async (e: React.MouseEvent, ideaId: string) => {
        e.stopPropagation();
        await toggleVote(ideaId);
    };

    const handleEdit = (e: React.MouseEvent, idea: Idea) => {
        e.stopPropagation();
        setEditingIdea(idea);
    };

    return (
        <div className={styles.container}>
            {/* TOOLBAR */}
            <div className={styles.toolbar}>
                <h2 className={styles.title}>Innovation Pipeline</h2>
                <div className={styles.actions}>
                    <button className={styles.btnFilter}>
                        <Filter size={14} /> Filter
                    </button>
                    <button className={styles.btnExport}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* DATA GRID */}
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <th>ID</th>
                        <th>Initiative</th>
                        <th>Owner</th>
                        <th className={styles.textCenter}>Votes</th>
                        <th className={styles.textCenter}>ROI Score</th>
                        <th>Stage</th>
                        <th className={styles.textRight}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ideas.map((row) => (
                        <tr
                            key={row.id}
                            onClick={() => onSelectIdea(row.id)}
                            className={`${styles.row} ${selectedIdeaId === row.id ? styles.rowSelected : ''}`}
                        >
                            <td className={styles.cellId}>{row.id.substring(0, 8)}...</td>
                            <td className={styles.cellTitle}>{row.title}</td>
                            <td className={styles.cellOwner}>
                                <div className={styles.ownerWrapper}>
                                    <div className={styles.ownerAvatar}>
                                        {row.submitterName.charAt(0).toUpperCase()}
                                    </div>
                                    {row.submitterName}
                                </div>
                            </td>
                            <td className={styles.cellCenter}>
                                <button
                                    className={`${styles.voteBtn} ${row.hasVoted ? styles.voted : ''}`}
                                    onClick={(e) => handleVote(e, row.id)}
                                >
                                    <ThumbsUp size={14} /> {row.voteCount}
                                </button>
                            </td>
                            <td className={styles.cellScore}>
                                <span className={`${row.businessValueScore && row.businessValueScore > 80 ? styles.scoreHigh : styles.scoreNormal}`}>
                                    {row.businessValueScore || 0}
                                </span>
                            </td>
                            <td>
                                <StatusBadge stage={row.status} />
                            </td>
                            <td className={styles.cellActions}>
                                <button className={styles.btnAction} onClick={(e) => handleEdit(e, row)}>
                                    <Edit2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            <div className={styles.footer}>
                <span>Showing {ideas.length} initiatives</span>
                <div className={styles.pagination}>
                    <button className={styles.btnPage}><ChevronLeft size={14} /> Previous</button>
                    <button className={styles.btnPage}>Next <ChevronRight size={14} /></button>
                    {/* EDIT DIALOG */}
                    {editingIdea && (
                        <SparkDialog
                            isOpen={!!editingIdea}
                            onClose={() => setEditingIdea(null)}
                            initialData={editingIdea}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
