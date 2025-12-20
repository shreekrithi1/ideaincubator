'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Edit3, Target, Clock } from 'lucide-react';
import { checkDuplicates, submitIdea, updateIdea } from '@/app/spark-actions';
import styles from './SparkDialog.module.css';

interface SparkDialogProps {
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    initialData?: any;
}

interface QuarterlyGoal {
    id: string;
    title: string;
    description: string;
    deadline: Date | null;
    quarter: number;
    year: number;
    status: string;
    category: string | null;
}

export default function SparkDialog({ trigger, isOpen: controlledIsOpen, onClose, initialData }: SparkDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Determine if controlled or uncontrolled
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Product Feature');
    const [tShirtSize, setTShirtSize] = useState('M');
    const [risk, setRisk] = useState('');
    const [sponsor, setSponsor] = useState('');
    const [similarIdeas, setSimilarIdeas] = useState<string[]>([]);
    const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update current time every second for countdown timer
    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    // Fetch quarterly goals when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetch('/api/quarterly-goals')
                .then(res => res.json())
                .then(data => setQuarterlyGoals(data))
                .catch(err => console.error('Failed to fetch goals:', err));
        }
    }, [isOpen]);

    // Reset or Populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setDescription(initialData.description || '');
                setCategory(initialData.category || 'Product Feature');
                setTShirtSize(initialData.tShirtSize || 'M');
                setRisk(initialData.riskMitigation || '');
                setSponsor(initialData.executiveSponsor || '');
                setSelectedGoalId(initialData.quarterlyGoalId || '');
            } else {
                // Reset for new idea
                setTitle('');
                setDescription('');
                setCategory('Product Feature');
                setTShirtSize('M');
                setRisk('');
                setSponsor('');
                setSimilarIdeas([]);
                setSelectedGoalId('');
            }
        }
    }, [isOpen, initialData]);

    const handleClose = () => {
        if (isControlled && onClose) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        // Don't check duplicates if editing same title
        if (!initialData && val.length > 5) {
            const matches = await checkDuplicates(val);
            if (matches && matches.length > 0) setSimilarIdeas(['Duplicate: ' + val]);
            else setSimilarIdeas([]);
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('tShirtSize', tShirtSize);
        if (selectedGoalId) {
            formData.append('quarterlyGoalId', selectedGoalId);
        }
        if (tShirtSize === 'XL') {
            formData.append('riskMitigation', risk);
            formData.append('executiveSponsor', sponsor);
        }

        if (initialData) {
            await updateIdea(initialData.id, formData);
        } else {
            await submitIdea(formData);
        }

        handleClose();
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div
                        className={styles.dialog}
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        transition={{ duration: 0.2 }}
                    >
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <X size={20} />
                        </button>

                        <div className={styles.header}>
                            <div className={styles.iconWrapper}>
                                {initialData ? <Edit3 size={24} color="#7c3aed" /> : <Sparkles size={24} color="#7c3aed" />}
                            </div>
                            <div>
                                <h2 className={styles.title}>{initialData ? 'Refine Initiative' : 'Ignite a New Idea'}</h2>
                                <p className={styles.subtitle}>
                                    {initialData ? 'Update the details of your proposal.' : 'Share your concept with the innovation council.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>

                            {!initialData && similarIdeas.length > 0 && (
                                <div className={styles.warning}>
                                    <AlertTriangle size={16} />
                                    Potential duplicate found: "{similarIdeas[0]}"
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AI-Driven Compliance Checker"
                                    value={title}
                                    onChange={handleTitleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            {/* Quarterly Goals Selection */}
                            {quarterlyGoals.length > 0 && (
                                <div className={styles.fieldGroup}>
                                    <label>
                                        <Target size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                                        Link to Quarterly Goal (Optional)
                                    </label>
                                    <select
                                        value={selectedGoalId}
                                        onChange={(e) => setSelectedGoalId(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">No Goal Selected - Standalone Idea</option>
                                        {quarterlyGoals
                                            .filter(goal => goal.status === 'ACTIVE')
                                            .map(goal => {
                                                const timeRemaining = getTimeRemaining(goal.deadline);
                                                const timeText = timeRemaining ? ` (${timeRemaining.text})` : '';
                                                const categoryText = goal.category ? ` [${goal.category}]` : '';
                                                return (
                                                    <option key={goal.id} value={goal.id}>
                                                        Q{goal.quarter} {goal.year}: {goal.title}{categoryText}{timeText}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                    {selectedGoalId && quarterlyGoals.find(g => g.id === selectedGoalId) && (
                                        <div className={styles.goalHint}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0.5rem 0 0 0' }}>
                                                {quarterlyGoals.find(g => g.id === selectedGoalId)?.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.row}>
                                <div className={styles.fieldGroup}>
                                    <label>Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option>Product Feature</option>
                                        <option>Tech Debt</option>
                                        <option>Process Improvement</option>
                                        <option>New Market</option>
                                        <option>General</option>
                                    </select>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Effort (T-Shirt)</label>
                                    <select
                                        value={tShirtSize}
                                        onChange={(e) => setTShirtSize(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="XS">XS (1 day)</option>
                                        <option value="S">S (1 week)</option>
                                        <option value="M">M (1 sprint)</option>
                                        <option value="L">L (1 month)</option>
                                        <option value="XL">XL (Quarter+)</option>
                                    </select>
                                </div>
                            </div>

                            {tShirtSize === 'XL' && (
                                <div className={styles.xlWarning}>
                                    <h4 className={styles.xlTitle}>Major Initiative Requirements</h4>
                                    <div className={styles.fieldGroup}>
                                        <label style={{ color: '#7f1d1d' }}>Risk Mitigation Plan</label>
                                        <input
                                            className={styles.input}
                                            value={risk}
                                            onChange={e => setRisk(e.target.value)}
                                            required={!initialData}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label style={{ color: '#7f1d1d' }}>Executive Sponsor</label>
                                        <input
                                            className={styles.input}
                                            value={sponsor}
                                            onChange={e => setSponsor(e.target.value)}
                                            required={!initialData}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <label>Description</label>
                                <textarea
                                    placeholder="Describe the problem and solution..."
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className={styles.textarea}
                                />
                            </div>

                            <div className={styles.footer}>
                                {!initialData && (
                                    <div className={styles.gamification}>
                                        <span className={styles.points}>+50 XP</span>
                                    </div>
                                )}
                                <button type="submit" className={styles.submitBtn}>
                                    {initialData ? 'Update Idea' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {trigger && <div onClick={() => setInternalIsOpen(true)}>{trigger}</div>}
            {mounted && createPortal(modalContent, document.body)}
        </>
    );
}
