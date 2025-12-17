'use client';
import { useState } from 'react';
import styles from './ModeratorTable.module.css';
import { updateStatus, deleteIdea } from '@/app/moderator-actions';
import { Check, X, ArrowRight, Trash2 } from 'lucide-react';

interface Idea {
    id: string;
    title: string;
    description: string;
    submitterId: string;
    submitterName: string;
    status: string;
    createdAt: string;
}

export default function ModeratorTable({ ideas }: { ideas: Idea[] }) {
    const [selected, setSelected] = useState<string[]>([]);

    function toggleSelect(id: string) {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    }

    return (
        <div className={styles.container}>
            {selected.length > 1 && (
                <div className={styles.toolbar}>
                    <span>{selected.length} ideas selected</span>
                    <button className={styles.mergeBtn} onClick={() => alert('Simulated Merge: Combining ideas...')}>
                        Merge Selected
                    </button>
                </div>
            )}

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: 40 }}></th>
                        <th>Title</th>
                        <th>Submitter</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ideas.map((idea) => (
                        <tr key={idea.id} className={styles.row}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(idea.id)}
                                    onChange={() => toggleSelect(idea.id)}
                                />
                            </td>
                            <td>
                                <div className={styles.ideaTitle}>{idea.title}</div>
                                <div className={styles.ideaDesc}>{idea.description.substring(0, 50)}...</div>
                            </td>
                            <td>
                                <div className="font-medium text-gray-900">{idea.submitterName}</div>
                                <div className="text-xs text-gray-500">{idea.submitterId.substring(0, 6)}...</div>
                            </td>
                            <td>
                                <span className={`${styles.badge} ${styles[idea.status] || ''}`}>
                                    {idea.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <div className={styles.actions}>
                                    {idea.status === 'SUBMITTED' && (
                                        <button title="Approve" onClick={() => updateStatus(idea.id, 'MODERATED')} className={styles.iconBtn}>
                                            <Check size={18} className={styles.approveIcon} />
                                        </button>
                                    )}
                                    {idea.status !== 'IN_DEV' && (
                                        <button title="Delete" onClick={() => deleteIdea(idea.id)} className={styles.iconBtn}>
                                            <Trash2 size={18} className={styles.rejectIcon} />
                                        </button>
                                    )}
                                    {idea.status === 'MODERATED' && (
                                        <button title="Push to CIO" onClick={() => updateStatus(idea.id, 'EXECUTIVE_REVIEW')} className={styles.iconBtn}>
                                            <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
