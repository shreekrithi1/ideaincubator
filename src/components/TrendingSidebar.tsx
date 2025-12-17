'use client';

import { TrendingUp, Award, Zap } from 'lucide-react';
import styles from './TrendingSidebar.module.css';

export default function TrendingSidebar({ ideas }: { ideas: any[] }) {
    if (!ideas || ideas.length === 0) return null;

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <TrendingUp className="text-purple-600" size={20} />
                <h3>Trending Now</h3>
            </div>

            <div className={styles.list}>
                {ideas.map((idea, index) => (
                    <div key={idea.id} className={styles.item}>
                        <div className={styles.rank}>{index + 1}</div>
                        <div className={styles.content}>
                            <h4 className={styles.title}>{idea.title}</h4>
                            <div className={styles.meta}>
                                <span className={styles.score}>
                                    <Zap size={12} className={styles.icon} />
                                    {idea.voteCount} Votes
                                </span>
                                <span className={styles.author}>
                                    by {idea.submitterName}
                                </span>
                            </div>
                        </div>
                        {index < 3 && <Award size={16} className={styles.medal} />}
                    </div>
                ))}
            </div>
        </div>
    );
}
