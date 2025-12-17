'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Edit3 } from 'lucide-react';
import { checkDuplicates, submitIdea, updateIdea } from '@/app/spark-actions';
import styles from './SparkDialog.module.css';

interface SparkDialogProps {
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    initialData?: any;
}

export default function SparkDialog({ trigger, isOpen: controlledIsOpen, onClose, initialData }: SparkDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

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
            } else {
                // Reset for new idea
                setTitle('');
                setDescription('');
                setCategory('Product Feature');
                setTShirtSize('M');
                setRisk('');
                setSponsor('');
                setSimilarIdeas([]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('tShirtSize', tShirtSize);
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

    return (
        <>
            {trigger && <div onClick={() => setInternalIsOpen(true)}>{trigger}</div>}

            <AnimatePresence>
                {isOpen && (
                    <div className={styles.overlay}>
                        <motion.div
                            className={styles.dialog}
                            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
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
        </>
    );
}
