'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, FileSignature, AlertCircle } from 'lucide-react';
import styles from './SignatureModal.module.css';

interface SignatureModalProps {
    ideaTitle: string;
    onConfirm: (signature: string) => Promise<void>;
    onCancel: () => void;
}

export default function SignatureModal({ ideaTitle, onConfirm, onCancel }: SignatureModalProps) {
    const [signature, setSignature] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleSign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate cryptographic delay
        await new Promise(r => setTimeout(r, 1000));
        await onConfirm(signature);
        setComplete(true);
        setIsProcessing(false);
    };

    return (
        <div className={styles.overlay}>
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                {!complete ? (
                    <form onSubmit={handleSign} className={styles.form}>
                        <div className={styles.header}>
                            <div className={styles.iconBox}>
                                <FileSignature size={24} color="#fff" />
                            </div>
                            <div>
                                <h3 className={styles.title}>Digital Signature Required</h3>
                                <p className={styles.subtitle}>
                                    You are about to authorize budget for <strong>"{ideaTitle}"</strong>.
                                    This action will be cryptographically logged.
                                </p>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label>Type "APPROVE" to confirm</label>
                            <input
                                type="text"
                                value={signature}
                                onChange={e => setSignature(e.target.value)}
                                placeholder="APPROVE"
                                className={styles.input}
                                pattern="APPROVE"
                                required
                            />
                        </div>

                        <div className={styles.actions}>
                            <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
                            <button
                                type="submit"
                                className={styles.signBtn}
                                disabled={isProcessing || signature !== 'APPROVE'}
                            >
                                {isProcessing ? 'Verifying...' : 'Sign & Auhorize'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <motion.div
                        className={styles.success}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className={styles.lockAnim}>
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            >
                                <Lock size={48} className="text-green-500" />
                            </motion.div>
                        </div>
                        <h3>Budget Locked</h3>
                        <p>Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
