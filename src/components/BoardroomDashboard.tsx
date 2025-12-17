'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, BrainCircuit, Lock } from 'lucide-react';
import { generateSWOT, approveStrategy, rejectStrategy } from '@/app/boardroom-actions';
import styles from './BoardroomDashboard.module.css';
import SignatureModal from './SignatureModal';

export default function BoardroomDashboard({ ideas }: { ideas: any[] }) {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [swot, setSwot] = useState<any>(null);
    const [loadingSwot, setLoadingSwot] = useState(false);

    // Signature State
    const [signingId, setSigningId] = useState<string | null>(null);

    const selectedIdea = ideas.find(i => i.id === signingId);

    const handleAnalzye = async (ideaId: string) => {
        if (selectedTopic === ideaId) {
            setSelectedTopic(null);
            return;
        }
        setSelectedTopic(ideaId);
        setLoadingSwot(true);
        // Simulate AI delay
        const analysis = await generateSWOT(ideaId);
        setSwot(analysis);
        setLoadingSwot(false);
    };

    const handleApproveClick = (ideaId: string) => {
        setSigningId(ideaId);
    }

    const handleAuthorized = async (signature: string) => {
        if (signingId) {
            await approveStrategy(signingId, "M", "Signed by Executive");
            // Wait for animation in modal
            await new Promise(r => setTimeout(r, 1500));
            setSigningId(null);
            setSelectedTopic(null);
        }
    };

    if (!ideas || ideas.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3>Boardroom is Empty</h3>
                <p>No investment proposals are pending review.</p>
                <p className={styles.emptyHint}>Moderators promote ideas here for executive sign-off.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Signature Modal */}
            <AnimatePresence>
                {signingId && selectedIdea && (
                    <SignatureModal
                        ideaTitle={selectedIdea.title}
                        onConfirm={handleAuthorized}
                        onCancel={() => setSigningId(null)}
                    />
                )}
            </AnimatePresence>

            <div className={styles.grid}>
                {ideas.map((idea) => (
                    <motion.div
                        key={idea.id}
                        className={`${styles.card} ${selectedTopic === idea.id ? styles.activeCard : ''}`}
                        layoutId={idea.id}
                        onClick={() => selectedTopic !== idea.id && handleAnalzye(idea.id)} // Only trigger open on card click if not already open
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.statusBadge}>{idea.status.replace('_', ' ')}</div>
                            <span className={styles.score}>Score: {idea.businessValueScore}</span>
                        </div>
                        <h3 className={styles.cardTitle}>{idea.title}</h3>
                        <p className={styles.cardDesc}>{idea.description}</p>

                        {/* Collapsed View Action */}
                        {selectedTopic !== idea.id && (
                            <button className={styles.analyzeTrigger} onClick={(e) => {
                                e.stopPropagation();
                                handleAnalzye(idea.id);
                            }}>
                                <BrainCircuit size={14} /> Analyze Risk (SWOT)
                            </button>
                        )}

                        {selectedTopic === idea.id && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={(e) => e.stopPropagation()}
                                className={styles.expandedContent}
                            >
                                {loadingSwot ? (
                                    <div className={styles.aiThinking}>
                                        <BrainCircuit className={styles.spin} /> AI Analyzing Risk...
                                    </div>
                                ) : swot ? (
                                    <div className={styles.swotGrid}>
                                        <div className={`${styles.swotBox} ${styles.strength}`}>
                                            <h4>Strengths</h4>
                                            <p>{swot.strengths}</p>
                                        </div>
                                        <div className={`${styles.swotBox} ${styles.weakness}`}>
                                            <h4>Risks</h4>
                                            <p>{swot.weaknesses}</p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className={styles.actions}>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            rejectStrategy(idea.id, "Rejected by Board");
                                        }}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        className={styles.approveBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApproveClick(idea.id);
                                        }}
                                    >
                                        <Lock size={16} /> Authorize Budget
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
