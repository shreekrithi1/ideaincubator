import styles from './IdeaCard.module.css';
import { ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import type { Idea } from '@prisma/client';

export default function IdeaCard({ idea }: { idea: Idea }) {
    return (
        <div className={styles.card}>
            <div className={styles.statusBadge}>{idea.status.replace('_', ' ')}</div>
            <h3 className={styles.title}>{idea.title}</h3>
            <p className={styles.description}>{idea.description}</p>

            <div className={styles.footer}>
                <div className={styles.meta}>
                    <Clock size={14} />
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>

                <div className={styles.actions}>
                    <button className={styles.actionBtn}>
                        <ThumbsUp size={16} />
                        <span>{idea.businessValueScore || 0}</span>
                    </button>
                    <button className={styles.actionBtn}>
                        <MessageSquare size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
